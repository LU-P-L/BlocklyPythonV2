import type * as TmpBlockly from "blockly";
import type { Blocks } from "blockly";
import { Order } from "blockly/python";
import { pipeline } from "@huggingface/transformers";
import { type PyodideGenerator } from "../PyodideGenerator";
// 将Hugging Face的pipeline函数添加到window对象
(window as any).pipeline = pipeline

/**
 * 添加问答系统相关的Block定义和代码生成器
 * @param blocks Blockly blocks对象
 * @param pythonGenerator Python代码生成器
 * @param Blockly Blockly实例
 * @param content 内容配置
 */
export function addQABlocksV2(blocks: typeof Blocks, pythonGenerator: PyodideGenerator, Blockly: typeof TmpBlockly, content: any) {
  // 定义输入问题和上下文的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "qa_input",
    "tooltip": "",
    "helpUrl": "",
    "message0": "%1 %2 %3",
    "args0": [
      {
        "type": "field_label_serializable",
        "text": "输入问题和上下文",
        "name": "NAME"
      },
      {
        "type": "input_value", 
        "name": "QUESTION",
        "check": "String",
        "align": "RIGHT"
      },
      {
        "type": "input_value", 
        "name": "CONTEXT",
        "check": "String",
        "align": "RIGHT"
      }
    ],
    "nextStatement": null,
    "colour": '#90CAF9'  // 淡蓝色
  }])
  
  pythonGenerator.forBlock['qa_input'] = function (block, generator) {
    const question = generator.valueToCode(block, 'QUESTION', Order.ATOMIC) || "''"
    const context = generator.valueToCode(block, 'CONTEXT', Order.ATOMIC) || "''"
    
    return `# 读取输入文本
if not ${question}.strip():
    raise Exception("请输入有效的问题")
if not ${context}.strip():
    raise Exception("请输入有效的上下文")
    
question_text = ${question}
context_text = ${context}
print("输入问题:", question_text)
print("输入上下文:", context_text)`
  }

  // 添加模型类型选择的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "qa_model_type",
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
    "colour": 225  // 与其他模块相同的蓝色调
  }])

  pythonGenerator.forBlock['qa_model_type'] = function(block) {
    const dtype = block.getFieldValue('DTYPE')
    return [`'${dtype}'`, Order.ATOMIC]
  }

  // 添加加载问答模型的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "qa_load_model",
    "message0": "加载问答模型 %1",
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

  pythonGenerator.forBlock['qa_load_model'] = function (block, generator) {
    const modelType = generator.valueToCode(block, 'MODEL_TYPE', Order.ATOMIC);
    generator.addPyodidePreRunCode('qa_load_model', `
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
    return `# 加载问答模型
from transformers import pipeline

print("开始加载模型...")
print("使用模型量化等级:", ${modelType})
try:
    answerer = await pipeline("question-answering", 
                            model="Xenova/distilbert-base-cased-distilled-squad",
                            dtype_config=${modelType})
    print("问答模型加载完成")
except Exception as e:
    raise Exception(f"问答模型加载失败: {str(e)}")`
  }

  // 添加问答推理Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "qa_answer",
    "message0": "使用问答模型进行推理 top_k为 %1",
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

  pythonGenerator.forBlock['qa_answer'] = function(block, generator) {
    const topK = generator.valueToCode(block, 'top_k', Order.ATOMIC) || '1'
    
    return `# 进行问答
if "answerer" not in locals():
    raise Exception("请先加载问答模型")
if "question_text" not in locals() or "context_text" not in locals():
    raise Exception("请先输入问题和上下文")

print("返回前", ${topK}, "个结果")
try:
    # 进行问答
    output = await answerer(question_text, context_text, {"top_k": int(${topK})})
    
    # 确保结果是列表
    if not isinstance(output, list):
        output = [output]
    
    # 记录问答结果
    qa_results = output
    
    # 输出问答结果
    for result in output:
        print(f"回答: {result['answer']} (置信度: {result['score']*100:.2f}%)")
except Exception as e:
    raise Exception(f"问答失败: {str(e)}")`
  }

  // 添加保存结果Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "qa_save_result",
    "message0": "保存问答结果",
    "previousStatement": null,
    "colour": '#81C784'  // 淡绿色
  }])

  pythonGenerator.forBlock['qa_save_result'] = function(block, generator) {
    return `# 保存问答结果
import pandas as pd
import os

# 检查是否有结果可保存
if "qa_results" not in locals() or not qa_results:
    raise Exception("没有可保存的问答结果")

# 准备保存的数据
result_data = {
    "question": [],
    "context": [],
    "answer": [],
    "score": []
}

# 填充数据
for result in qa_results:
    result_data["question"].append(question_text)
    result_data["context"].append(context_text)
    result_data["answer"].append(result["answer"])
    result_data["score"].append(result["score"])

# 保存为CSV文件
try:
    df = pd.DataFrame(result_data)
    qa_dir = "/data/mount"
    os.makedirs(qa_dir, exist_ok=True)
    csv_path = os.path.join(qa_dir, "qa_result.csv")
    df.to_csv(csv_path, index=False, encoding="utf-8")
    print(f"问答结果已保存到 {csv_path}")
except Exception as e:
    raise Exception(f"保存结果失败: {str(e)}")`
  }
}
