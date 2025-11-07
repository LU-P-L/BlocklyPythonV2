import type * as TmpBlockly from "blockly";
import type { Blocks } from "blockly";
import { Order } from "blockly/python";
import { pipeline } from "@huggingface/transformers";
import { type PyodideGenerator } from "../PyodideGenerator";
// 将Hugging Face的pipeline函数添加到window对象
(window as any).pipeline = pipeline

/**
 * 添加文本生成相关的Block定义和代码生成器
 * @param blocks Blockly blocks对象
 * @param pythonGenerator Python代码生成器
 * @param Blockly Blockly实例
 * @param content 内容配置
 */
export function addTextGenBlocksV2(blocks: typeof Blocks, pythonGenerator: PyodideGenerator, Blockly: typeof TmpBlockly, content: any) {
  // 定义输入文本的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "text_gen_input",
    "message0": "输入提示文本 %1",
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

  pythonGenerator.forBlock['text_gen_input'] = function(block, generator) {
    const text = generator.valueToCode(block, 'TEXT', Order.ATOMIC) || "''"
    
    return `# 读取输入文本
if not ${text}.strip():
    raise Exception("请输入有效的提示文本")
input_text = ${text}
print("输入文本:", input_text)`
  }

  // 添加模型类型选择的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "text_gen_model_type",
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

  pythonGenerator.forBlock['text_gen_model_type'] = function(block) {
    const dtype = block.getFieldValue('DTYPE')
    return [`'${dtype}'`, Order.ATOMIC]
  }

  // 添加加载文本生成模型的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "text_gen_load_model",
    "message0": "加载文本生成模型 %1",
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

  pythonGenerator.forBlock['text_gen_load_model'] = function(block, generator) {
    const dtype = generator.valueToCode(block, 'MODEL_TYPE', Order.ATOMIC);
    generator.addPyodidePreRunCode('text_gen_load_model', `
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
    
    return `# 加载文本生成模型
from transformers import pipeline

print("开始加载模型...")
print("使用模型量化等级:", ${dtype})
try:
    generator = await pipeline("text2text-generation",
                     model="Xenova/LaMini-Flan-T5-783M",
                     dtype_config=${dtype})
    print("文本生成模型加载完成")
except Exception as e:
    raise Exception(f"文本生成模型加载失败: {str(e)}")`
  }

  // 添加文本生成推理Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "text_gen_generate",
    "message0": "使用文本生成模型进行推理 temperature为 %1 最大生成长度为 %2",
    "args0": [
      {
        "type": "input_value",
        "name": "temperature",
        "check": "Number"
      },
      {
        "type": "input_value",
        "name": "max_tokens",
        "check": "Number",
        "align": "RIGHT"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": '#A5D6A7'  // 淡绿色
  }])

  pythonGenerator.forBlock['text_gen_generate'] = function(block, generator) {
    const temperature = generator.valueToCode(block, 'temperature', Order.ATOMIC) || '0.9'
    const maxTokens = generator.valueToCode(block, 'max_tokens', Order.ATOMIC) || '512'
    
    return `# 进行文本生成
if "generator" not in locals():
    raise Exception("请先加载文本生成模型")
if "input_text" not in locals():
    raise Exception("请先输入提示文本")

print("使用temperature:", ${temperature})
print("最大生成长度:", ${maxTokens})
try:
    output = await generator(input_text, temperature=float(${temperature}), max_new_tokens=int(${maxTokens}))
    if not output or not output[0]["generated_text"]:
        raise Exception("生成失败")
    generated_text = output[0]["generated_text"].strip()
    if not generated_text:
        raise Exception("生成的文本为空")
    print("生成的文本:", generated_text)
except Exception as e:
    raise Exception(f"文本生成失败: {str(e)}")`
  }

  // 添加保存生成结果的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "text_gen_save_result",
    "message0": "保存文本生成结果",
    "previousStatement": null,
    "colour": '#FFAB91'  // 淡红色
  }])

  pythonGenerator.forBlock['text_gen_save_result'] = function(block, generator) {
    return `# 保存生成结果
import pandas as pd
import os

# 检查是否有结果可保存
if "generated_text" not in locals():
    raise Exception("没有可保存的生成结果")

# 准备保存的数据
result_data = {
    "input_text": [input_text],
    "generated_text": [generated_text]
}

# 保存为CSV文件
try:
    df = pd.DataFrame(result_data)
    gen_dir = "/data/mount"
    os.makedirs(gen_dir, exist_ok=True)
    csv_path = os.path.join(gen_dir, "text_generation_result.csv")
    df.to_csv(csv_path, index=False, encoding="utf-8")
    print(f"生成结果已保存到 {csv_path}")
except Exception as e:
    raise Exception(f"保存结果失败: {str(e)}")`
  }
}
