import type * as TmpBlockly from "blockly";
import type { Blocks } from "blockly";
import { Order } from "blockly/python";
import { pipeline } from "@huggingface/transformers";
import { type PyodideGenerator } from "../PyodideGenerator";
// 将Hugging Face的pipeline函数添加到window对象
(window as any).pipeline = pipeline

/**
 * 添加文本摘要相关的Block定义和代码生成器
 * @param blocks Blockly blocks对象
 * @param pythonGenerator Python代码生成器
 * @param Blockly Blockly实例
 * @param content 内容配置
 */
export function addSummarizationBlocksV2(blocks: typeof Blocks, pythonGenerator: PyodideGenerator, Blockly: typeof TmpBlockly, content: any) {
  // 定义输入文本的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "summarization_input",
    "message0": "输入待总结文本 %1",
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

  pythonGenerator.forBlock['summarization_input'] = function(block, generator) {
    const text = generator.valueToCode(block, 'TEXT', Order.ATOMIC) || "''"
    
    return `# 读取输入文本
if not ${text}.strip():
    raise Exception("请输入有效的文本")
input_text = ${text}
print("输入文本:", input_text)
`
  }

  // 添加模型类型选择的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "summarization_model_type",
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

  pythonGenerator.forBlock['summarization_model_type'] = function(block) {
    const dtype = block.getFieldValue('DTYPE')
    return [`'${dtype}'`, Order.ATOMIC]
  }

  // 添加加载文本总结模型的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "summarization_load_model",
    "message0": "加载文本总结模型 %1",
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

  pythonGenerator.forBlock['summarization_load_model'] = function(block, generator) {
    const modelType = generator.valueToCode(block, 'MODEL_TYPE', Order.ATOMIC);
    generator.addPyodidePreRunCode('summarization_load_model', `
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
    return `# 加载文本总结模型
from transformers import pipeline

print("开始加载模型...")
print("使用模型量化等级:", ${modelType})
try:
    generator = await pipeline("summarization", 
                             model="Xenova/distilbart-cnn-6-6",
                             dtype_config=${modelType})
    print("文本总结模型加载完成")
except Exception as e:
    raise Exception(f"文本总结模型加载失败: {str(e)}")
`
  }

  // 添加文本总结推理Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "summarization_generate",
    "message0": "使用文本总结模型进行推理 最大生成长度为 %1",
    "args0": [
      {
        "type": "input_value",
        "name": "max_tokens",
        "check": "Number"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": '#A5D6A7'  // 淡绿色
  }])

  pythonGenerator.forBlock['summarization_generate'] = function(block, generator) {
    const maxTokens = generator.valueToCode(block, 'max_tokens', Order.ATOMIC) || '100'
    
    return `# 进行文本总结
if "generator" not in locals():
    raise Exception("请先加载文本总结模型")
if "input_text" not in locals():
    raise Exception("请先输入文本")

print("最大生成长度:", ${maxTokens})
try:
    output = await generator(input_text, max_length=int(${maxTokens}))
    
    if not output or not output[0]["summary_text"]:
        raise Exception("总结失败")
    
    summary_text = output[0]["summary_text"].strip()
    if not summary_text:
        raise Exception("生成的总结为空")
    
    # 记录总结结果
    summarization_result = {
        "input_text": input_text,
        "summary_text": summary_text
    }
    
    print("原文:", input_text)
    print("总结:", summary_text)
except Exception as e:
    raise Exception(f"文本总结失败: {str(e)}")
`
  }

  // 添加保存总结结果的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "summarization_save_result",
    "message0": "保存文本总结结果",
    "previousStatement": null,
    "colour": '#FFAB91'  // 淡红色
  }])

  pythonGenerator.forBlock['summarization_save_result'] = function(block) {
    return `# 保存总结结果
import pandas as pd
import os

# 检查是否有结果可保存
if "summarization_result" not in locals():
    raise Exception("没有可保存的总结结果")

# 准备保存的数据
result_data = {
    "input_text": [summarization_result["input_text"]],
    "summary_text": [summarization_result["summary_text"]]
}

# 保存为CSV文件
try:
    df = pd.DataFrame(result_data)
    summary_dir = "/data/mount"
    os.makedirs(summary_dir, exist_ok=True)
    csv_path = os.path.join(summary_dir, "summarization_result.csv")
    df.to_csv(csv_path, index=False, encoding="utf-8")
    print(f"总结结果已保存到 {csv_path}")
except Exception as e:
    raise Exception(f"保存结果失败: {str(e)}")
`
  }
}
