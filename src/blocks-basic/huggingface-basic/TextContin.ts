import type * as TmpBlockly from "blockly";
import type { Blocks } from "blockly";
import { Order } from "blockly/python";
import { pipeline } from "@huggingface/transformers";
import { type PyodideGenerator } from "../PyodideGenerator";
// 将Hugging Face的pipeline函数添加到window对象
(window as any).pipeline = pipeline

/**
 * 添加文本续写相关的Block定义和代码生成器
 * @param blocks Blockly blocks对象
 * @param pythonGenerator Python代码生成器
 * @param Blockly Blockly实例
 * @param content 内容配置
 */
export function addTextContinBlocksV2(blocks: typeof Blocks, pythonGenerator: PyodideGenerator, Blockly: typeof TmpBlockly, content: any) {
  // 定义输入初始文本的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "text_contin_input",
    "message0": "%1 %2",
    "args0": [
      {
        "type": "field_label_serializable",
        "text": "输入初始文本",
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

  pythonGenerator.forBlock['text_contin_input'] = function(block, generator) {
    const text = generator.valueToCode(block, 'TEXT', Order.ATOMIC) || "''"
    
    return `# 读取输入文本
if not ${text}.strip():
    raise Exception("请输入有效的初始文本")
input_text = ${text}
print("输入文本:", input_text)
`
  }

  // 添加模型类型选择的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "text_contin_model_type",
    "message0": "选择量化模型 %1",
    "args0": [
      {
        "type": "field_dropdown", 
        "name": "DTYPE",
        "options": [
          ["8位量化 (q8)", "q8"],
          ["4位量化 (q4)", "q4"],
          ["半精度 (fp16)", "fp16"],
        ]
      }
    ],
    "output": null,
    "colour": 225  // 与其他模块相同的蓝色调
  }])

  pythonGenerator.forBlock['text_contin_model_type'] = function(block) {
    const dtype = block.getFieldValue('DTYPE')
    return [`'${dtype}'`, Order.ATOMIC]
  }

  // 添加加载文本续写模型的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "text_contin_load_model",
    "message0": "加载文本续写模型 %1",
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

  pythonGenerator.forBlock['text_contin_load_model'] = function(block, generator) {
    const modelType = generator.valueToCode(block, 'MODEL_TYPE', Order.ATOMIC);
    generator.addPyodidePreRunCode('text_contin_load_model', `
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
    
    return `# 加载文本续写模型
from transformers import pipeline

print("开始加载模型...")
print("使用模型量化等级:", ${modelType})
try:
    # 使用GPT2模型进行文本续写
    generator = await pipeline("text-generation", 
                            model="Xenova/llama2.c-stories15M", 
                            dtype_config=${modelType})
    print("文本续写模型加载完成")
except Exception as e:
    raise Exception(f"文本续写模型加载失败: {str(e)}")
`
  }

  // 添加文本生成参数Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "text_contin_params",
    "message0": "设置生成参数 最大长度: %1 温度: %2",
    "args0": [
      {
        "type": "input_value",
        "name": "MAX_LENGTH",
        "check": "Number"
      },
      {
        "type": "input_value",
        "name": "TEMPERATURE",
        "check": "Number"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": '#FFE082'  // 淡黄色
  }])

  pythonGenerator.forBlock['text_contin_params'] = function(block, generator) {
    const maxLength = generator.valueToCode(block, 'MAX_LENGTH', Order.ATOMIC) || '30'
    const temperature = generator.valueToCode(block, 'TEMPERATURE', Order.ATOMIC) || '0.7'
    
    return `# 设置文本生成参数
max_length = int(${maxLength})
if max_length < 10 or max_length > 100:
    print("警告：最大长度设置范围应在10-100之间，已调整为合适值")
    max_length = max(10, min(max_length, 100))

temperature = float(${temperature})
if temperature < 0.1 or temperature > 2.0:
    print("警告：温度设置范围应在0.1-2.0之间，已调整为合适值")
    temperature = max(0.1, min(temperature, 2.0))

print(f"设置最大生成长度: {max_length}，温度: {temperature}")
`
  }

  // 添加文本续写生成Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "text_contin_generate",
    "message0": "生成续写文本",
    "previousStatement": null,
    "nextStatement": null,
    "colour": '#A5D6A7'  // 淡绿色
  }])

  pythonGenerator.forBlock['text_contin_generate'] = function(block) {
    return `# 进行文本续写
if "generator" not in locals():
    raise Exception("请先加载文本续写模型")
if "input_text" not in locals():
    raise Exception("请先输入初始文本")

# 检查生成参数是否已设置
if "max_length" not in locals():
    print("未设置生成参数，使用默认值：最大长度=30，温度=0.7")
    max_length = 30
    temperature = 0.7

print("开始生成文本...")
try:
    # 调用模型生成文本
    outputs = await generator(input_text, {
        "max_length": max_length,
        "temperature": temperature,
        "no_repeat_ngram_size": 2,
        "do_sample": True
    })
    
    # 解析结果
    if not outputs or len(outputs) == 0:
        raise Exception("生成失败，没有返回结果")
    
    generated_text = outputs[0]["generated_text"]
    
    # 输出结果
    print("初始文本:", input_text)
    print("生成结果:", generated_text)
    
    # 存储结果以便后续保存
    original_text = input_text
    full_generated_text = generated_text
    continued_text = generated_text[len(input_text):]  # 提取续写的部分
    
    print("续写部分:", continued_text)
except Exception as e:
    raise Exception(f"文本生成失败: {str(e)}")
`
  }

  // 添加保存生成结果的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "text_contin_save_result",
    "message0": "保存续写结果",
    "previousStatement": null,
    "colour": '#FFAB91'  // 淡红色
  }])

  pythonGenerator.forBlock['text_contin_save_result'] = function(block) {
    return `# 保存续写结果
import pandas as pd
import os

# 检查是否有结果可保存
if "full_generated_text" not in locals() or "continued_text" not in locals():
    raise Exception("没有可保存的续写结果")

# 准备保存的数据
result_data = {
    "original_text": [original_text],
    "full_generated_text": [full_generated_text],
    "continued_text": [continued_text]
}

# 保存为CSV文件
try:
    df = pd.DataFrame(result_data)
    output_dir = "/data/mount"
    os.makedirs(output_dir, exist_ok=True)
    csv_path = os.path.join(output_dir, "text_continuation_result.csv")
    df.to_csv(csv_path, index=False, encoding="utf-8")
    print(f"续写结果已保存到 {csv_path}")
    
    # 同时保存为TXT文件，方便阅读
    txt_path = os.path.join(output_dir, "text_continuation_result.txt")
    with open(txt_path, 'w', encoding='utf-8') as f:
        f.write("初始文本:\\n" + original_text + "\\n\\n")
        f.write("完整生成文本:\\n" + full_generated_text + "\\n\\n")
        f.write("续写部分:\\n" + continued_text + "\\n")
    print(f"续写结果已同时保存为文本文件: {txt_path}")
except Exception as e:
    raise Exception(f"保存结果失败: {str(e)}")
`
  }
}
