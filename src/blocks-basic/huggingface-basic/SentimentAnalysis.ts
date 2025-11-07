import type * as TmpBlockly from "blockly";
import type { Blocks } from "blockly";
import { Order } from "blockly/python";
import { pipeline } from "@huggingface/transformers";
import { type PyodideGenerator } from "../PyodideGenerator";
// 将Hugging Face的pipeline函数添加到window对象
(window as any).pipeline = pipeline

/**
 * 添加情感分析相关的Block定义和代码生成器
 * @param blocks Blockly blocks对象
 * @param pythonGenerator Python代码生成器
 * @param Blockly Blockly实例
 * @param content 内容配置
 */
export function addSentimentAnalysisBlocksV2(blocks: typeof Blocks, pythonGenerator: PyodideGenerator, Blockly: typeof TmpBlockly, content: any) {
  // 定义输入文本的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "sentiment_analysis_input",
    "message0": "%1 %2",
    "args0": [
      {
        "type": "field_label_serializable",
        "text": "输入待分析文本",
        "name": "NAME"
      },
      {
        "type": "input_value", 
        "name": "TEXT",
        "check": "String",
        "align": "RIGHT"
      }
    ],
    "nextStatement": null,
    "colour": '#90CAF9'  // 淡蓝色
  }])

  pythonGenerator.forBlock['sentiment_analysis_input'] = function(block, generator) {
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
    "type": "sentiment_analysis_model_type",
    "message0": "选择量化模型 %1",
    "args0": [
      {
        "type": "field_dropdown", 
        "name": "DTYPE",
        "options": [
          ["8位量化 (q8)", "q8"]  // 只保留q8选项，与原始文件保持一致
        ]
      }
    ],
    "output": null,
    "colour": 225  // 与其他模块相同的蓝色调
  }])

  pythonGenerator.forBlock['sentiment_analysis_model_type'] = function(block) {
    const dtype = block.getFieldValue('DTYPE')
    return [`'${dtype}'`, Order.ATOMIC]
  }

  // 添加加载情感分析模型的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "sentiment_analysis_load_model",
    "message0": "加载情感分析模型 %1",
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

  pythonGenerator.forBlock['sentiment_analysis_load_model'] = function(block, generator) {
    const modelType = generator.valueToCode(block, 'MODEL_TYPE', Order.ATOMIC);
    generator.addPyodidePreRunCode('sentiment_analysis_load_model', `
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
    
    return `# 加载情感分析模型
from transformers import pipeline

print("开始加载模型...")
print("使用模型量化等级:", ${modelType})
try:
    analyzer = await pipeline("sentiment-analysis", 
                            model="Xenova/distilbert-base-uncased-finetuned-sst-2-english",
                            dtype_config=${modelType})
    print("情感分析模型加载完成")
except Exception as e:
    raise Exception(f"情感分析模型加载失败: {str(e)}")
`
  }

  // 添加情感分析Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "sentiment_analysis_analyze",
    "message0": "分析文本情感",
    "previousStatement": null,
    "nextStatement": null,
    "colour": '#A5D6A7'  // 淡绿色
  }])

  pythonGenerator.forBlock['sentiment_analysis_analyze'] = function(block) {
    return `# 进行情感分析
if "analyzer" not in locals():
    raise Exception("请先加载情感分析模型")
if "input_text" not in locals():
    raise Exception("请先输入文本")

print("开始分析情感...")
try:
    output = await analyzer(input_text)
    if not output:
        raise Exception("情感分析失败")
    result = output[0]
    sentiment = "积极" if result["label"] == "POSITIVE" else "消极"
    score = result["score"]
    print("原文:", input_text)
    print("情感分析结果:")
    print("- 情感倾向:", sentiment, f"({result['label']})")
    print("- 置信度: {:.2f}%".format(score * 100))
except Exception as e:
    raise Exception(f"情感分析失败: {str(e)}")
`
  }

  // 添加保存分析结果的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "sentiment_analysis_save_result",
    "message0": "保存情感分析结果",
    "previousStatement": null,
    "colour": '#FFAB91'  // 淡红色
  }])

  pythonGenerator.forBlock['sentiment_analysis_save_result'] = function(block) {
    return `# 保存分析结果
import pandas as pd
import os

# 检查是否有结果可保存
if "sentiment" not in locals() or "score" not in locals():
    raise Exception("没有可保存的分析结果")

# 准备保存的数据
result_data = {
    "input_text": [input_text],
    "sentiment": [sentiment],
    "confidence": [score]
}

# 保存为CSV文件
try:
    df = pd.DataFrame(result_data)
    sentiment_dir = "/data/mount"
    os.makedirs(sentiment_dir, exist_ok=True)
    csv_path = os.path.join(sentiment_dir, "sentiment_analysis_result.csv")
    df.to_csv(csv_path, index=False, encoding="utf-8")
    print(f"分析结果已保存到 {csv_path}")
except Exception as e:
    raise Exception(f"保存结果失败: {str(e)}")
`
  }
}
