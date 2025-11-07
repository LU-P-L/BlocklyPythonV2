import type * as TmpBlockly from "blockly";
import type { Blocks } from "blockly";
import { Order } from "blockly/python";
import { pipeline } from "@huggingface/transformers";
import { type PyodideGenerator } from "../PyodideGenerator";
// 将Hugging Face的pipeline函数添加到window对象
(window as any).pipeline = pipeline

/**
 * 添加零样本分类相关的Block定义和代码生成器
 * @param blocks Blockly blocks对象
 * @param pythonGenerator Python代码生成器
 * @param Blockly Blockly实例
 * @param content 内容配置
 */
export function addZeroshotBlocksV2(blocks: typeof Blocks, pythonGenerator: PyodideGenerator, Blockly: typeof TmpBlockly, content: any) {
  // 定义输入文本的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "zeroshot_input_text",
    "message0": "输入需要分类的文本 %1",
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

  pythonGenerator.forBlock['zeroshot_input_text'] = function(block, generator) {
    const text = generator.valueToCode(block, 'TEXT', Order.ATOMIC) || "''"
    
    return `# 读取输入文本
if not ${text}.strip():
    raise Exception("请输入需要分类的文本")
input_text = ${text}
print("待分类文本:", input_text)
`
  }

  // 定义输入标签的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "zeroshot_input_labels",
    "message0": "输入类别标签（用逗号分隔） %1",
    "args0": [
      {
        "type": "input_value",
        "name": "LABELS",
        "check": "String"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": '#81D4FA'  // 另一种淡蓝色
  }])

  pythonGenerator.forBlock['zeroshot_input_labels'] = function(block, generator) {
    const labels = generator.valueToCode(block, 'LABELS', Order.ATOMIC) || "''"
    
    return `# 处理类别标签
if not ${labels}.strip():
    raise Exception("请输入类别标签")
label_list = [label.strip() for label in ${labels}.split(",") if label.strip()]
if not label_list:
    raise Exception("请至少输入一个有效的类别标签")
print("类别标签:", ", ".join(label_list))
`
  }

  // 添加模型类型选择的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "zeroshot_model_type",
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

  pythonGenerator.forBlock['zeroshot_model_type'] = function(block) {
    const dtype = block.getFieldValue('DTYPE')
    return [`'${dtype}'`, Order.ATOMIC]
  }

  // 添加加载零样本分类模型的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "zeroshot_load_model",
    "message0": "加载零样本分类模型 %1",
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

  pythonGenerator.forBlock['zeroshot_load_model'] = function(block, generator) {
    const dtype = generator.valueToCode(block, 'MODEL_TYPE', Order.ATOMIC)
    
    generator.addPyodidePreRunCode('zeroshot_load_model', `
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
    
    return `# 加载零样本分类模型
from transformers import pipeline

print("开始加载模型...")
print("使用模型量化等级:", ${dtype})
try:
    classifier = await pipeline("zero-shot-classification",
                          model="Xenova/distilbert-base-uncased-mnli",
                          dtype_config=${dtype})
    print("零样本分类模型加载完成")
except Exception as e:
    raise Exception(f"零样本分类模型加载失败: {str(e)}")
`
  }

  // 添加零样本分类推理Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "zeroshot_classify",
    "message0": "使用零样本分类模型进行推理",
    "previousStatement": null,
    "nextStatement": null,
    "colour": '#A5D6A7'  // 淡绿色
  }])

  pythonGenerator.forBlock['zeroshot_classify'] = function(block, generator) {
    return `# 进行零样本分类
if "classifier" not in locals():
    raise Exception("请先加载零样本分类模型")
if "input_text" not in locals():
    raise Exception("请先输入待分类文本")
if "label_list" not in locals():
    raise Exception("请先输入类别标签")

try:
    output = await classifier(input_text, label_list)
    if not output or "labels" not in output or "scores" not in output:
        raise Exception("分类失败")
    results = [{"label": label, "score": score} 
              for label, score in zip(output["labels"], output["scores"])]
    results.sort(key=lambda x: x["score"], reverse=True)

    print("分类结果:")
    for result in results:
        print(f"  {result['label']}: {result['score']*100:.2f}%")
except Exception as e:
    raise Exception(f"分类失败: {str(e)}")
`
  }

  // 添加保存分类结果的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "zeroshot_save_result",
    "message0": "保存分类结果",
    "previousStatement": null,
    "colour": '#FFAB91'  // 淡红色
  }])

  pythonGenerator.forBlock['zeroshot_save_result'] = function(block, generator) {
    return `# 保存分类结果
import pandas as pd
import os

# 检查是否有结果可保存
if "results" not in locals():
    raise Exception("没有可保存的分类结果")

# 准备保存的数据
result_data = {
    "input_text": [input_text] * len(results),
    "label": [r["label"] for r in results],
    "confidence": [r["score"] for r in results]
}

# 保存为CSV文件
try:
    df = pd.DataFrame(result_data)
    zeroshot_dir = "/data/mount"
    os.makedirs(zeroshot_dir, exist_ok=True)
    csv_path = os.path.join(zeroshot_dir, "zeroshot_classification_result.csv")
    df.to_csv(csv_path, index=False, encoding="utf-8")
    print(f"分类结果已保存到 {csv_path}")
except Exception as e:
    raise Exception(f"保存结果失败: {str(e)}")
`
  }
}
