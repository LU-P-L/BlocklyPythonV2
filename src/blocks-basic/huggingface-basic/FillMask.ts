import type * as TmpBlockly from "blockly";
import type { Blocks } from "blockly";
import { Order } from "blockly/python";
import { pipeline } from "@huggingface/transformers";
import { type PyodideGenerator } from "../PyodideGenerator";
// 将Hugging Face的pipeline函数添加到window对象
(window as any).pipeline = pipeline

/**
 * 添加文本填充相关的Block定义和代码生成器
 * @param blocks Blockly blocks对象
 * @param pythonGenerator Python代码生成器
 * @param Blockly Blockly实例
 * @param content 内容配置
 */
export function addFillMaskBlocksV2(blocks: typeof Blocks, pythonGenerator: PyodideGenerator, Blockly: typeof TmpBlockly, content: any) {
  // 定义输入文本的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "fill_mask_input",
    "message0": "输入带[MASK]的文本 %1",
    "args0": [
      {
        "type": "input_value",
        "name": "TEXT",
        "check": "String"
      }
    ],
    "nextStatement": null,
    "colour": '#90CAF9'  // 淡蓝色
  }])
  
  pythonGenerator.forBlock['fill_mask_input'] = function (block, generator) {
    const text = generator.valueToCode(block, 'TEXT', Order.ATOMIC) || "''"
    
    return `# 读取输入文本
if not ${text}.strip():
    raise Exception("请输入有效的提示文本")
if "[MASK]" not in ${text}:
    raise Exception("文本必须包含[MASK]标记")
input_text = ${text}
print("输入文本:", input_text)
`
  }

  // 添加模型类型选择的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "fill_mask_model_type",
    "message0": "选择量化模型 %1",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "DTYPE",
        "options": [
          ["全精度 (fp32)", "fp32"],
          ["半精度 (fp16)", "fp16"],
          ["8位量化 (q8)", "q8"],
        ]
      }
    ],
    "output": null,
    "colour": 225
  }])

  pythonGenerator.forBlock['fill_mask_model_type'] = function(block) {
    const dtype = block.getFieldValue('DTYPE')
    return [`'${dtype}'`, Order.ATOMIC]
  }

  // 添加加载文本填充模型的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "fill_mask_load_model",
    "message0": "加载文本填充模型 %1",
    "args0": [
      {
        "type": "input_value",
        "name": "MODEL_TYPE",
        "check": null
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": '#CE93D8'  // 淡紫色
  }])

  pythonGenerator.forBlock['fill_mask_load_model'] = function (block, generator) {
    const modelType = generator.valueToCode(block, 'MODEL_TYPE', Order.ATOMIC);
    generator.addPyodidePreRunCode('fill_mask_load_model', `
import sys
import types
from pyodide.ffi import to_js
import js

# 创建transformers模块
T = types.ModuleType('transformers')
sys.modules['transformers'] = T

# Pipeline实现
async def pipeline(task, model, dtype_config):
    """
    创建HuggingFace pipeline的Pyodide包装器
    
    Args:
        task (str): pipeline任务类型
        model (str): 模型名称
        dtype_config (str): 数据类型配置
    """
    try:
        # 创建pipeline实例
        func = await js.pipeline(task, model, {
            "dtype": dtype_config,
            "device": "webgpu"
        })
        
        # 创建异步包装函数
        async def func_wrap(*args, **kwargs):
            try:
                # 转换参数为JavaScript对象
                js_args = [to_js(arg) for arg in args]
                js_kwargs = {k: to_js(v) for k, v in kwargs.items()}
                
                # 调用pipeline并等待结果
                future = func._call(*js_args, **js_kwargs)
                result = await future
                
                # 转换回Python对象
                return result.to_py()
            except Exception as e:
                print(f"Pipeline执行失败: {str(e)}")
                raise
                
        return func_wrap
    except Exception as e:
        print(f"Pipeline创建失败: {str(e)}")
        raise

# 将pipeline函数添加到transformers模块
T.pipeline = pipeline
`)
    return `# 加载文本填充模型
from transformers import pipeline

print("开始加载模型...")
print("使用模型量化等级:", ${modelType})
try:
    unmasker = await pipeline("fill-mask",
                       model="Xenova/bert-base-uncased",
                       dtype_config=${modelType})
    print("文本填充模型加载完成")
except Exception as e:
    raise Exception(f"文本填充模型加载失败: {str(e)}")
`
  }

  // 添加文本填充推理Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "fill_mask_predict",
    "message0": "使用文本填充模型进行推理 top_k为 %1",
    "args0": [
      {
        "type": "input_value",
        "name": "top_k",
        "check": "Number",
        "align": "RIGHT"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": '#A5D6A7'  // 淡绿色
  }])

  pythonGenerator.forBlock['fill_mask_predict'] = function(block, generator) {
    const topK = generator.valueToCode(block, 'top_k', Order.ATOMIC) || '5'
    
    return `# 进行文本填充
if "unmasker" not in locals():
    raise Exception("请先加载文本填充模型")
if "input_text" not in locals():
    raise Exception("请先输入提示文本")

print("返回前", ${topK}, "个结果")
try:
    # 进行文本填充
    output = await unmasker(input_text, {"top_k": int(${topK})})
    
    # 确保结果是列表
    if not isinstance(output, list):
        output = [output]
        
    if not output:
        raise Exception("填充失败")
    
    # 记录填充结果
    fill_mask_results = output
    
    # 输出填充结果
    for result in output:
        print(f"填充结果: {result['sequence']} (分数: {result['score']*100:.2f}%)")
except Exception as e:
    raise Exception(f"文本填充失败: {str(e)}")
`
  }

  // 添加保存结果Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "fill_mask_save_result",
    "message0": "保存文本填充结果",
    "previousStatement": null,
    "colour": '#FFAB91'  // 淡红色
  }])

  pythonGenerator.forBlock['fill_mask_save_result'] = function(block, generator) {
    return `# 保存填充结果
import pandas as pd
import os

# 检查是否有结果可保存
if "fill_mask_results" not in locals() or not fill_mask_results:
    raise Exception("没有可保存的填充结果")

# 准备保存的数据
result_data = {
    "input_text": [],
    "filled_text": [],
    "token": [],
    "score": []
}

# 填充数据
for result in fill_mask_results:
    result_data["input_text"].append(input_text)
    result_data["filled_text"].append(result["sequence"])
    result_data["token"].append(result["token_str"])
    result_data["score"].append(result["score"])

# 保存为CSV文件
try:
    df = pd.DataFrame(result_data)
    mask_dir = "/data/mount"
    os.makedirs(mask_dir, exist_ok=True)
    csv_path = os.path.join(mask_dir, "fill_mask_result.csv")
    df.to_csv(csv_path, index=False, encoding="utf-8")
    print(f"填充结果已保存到 {csv_path}")
except Exception as e:
    raise Exception(f"保存结果失败: {str(e)}")
`
  }
}
