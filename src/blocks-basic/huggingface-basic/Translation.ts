import type * as TmpBlockly from "blockly";
import type { Blocks } from "blockly";
import { Order } from "blockly/python";
import { pipeline } from "@huggingface/transformers";
import { type PyodideGenerator } from "../PyodideGenerator";
// 将Hugging Face的pipeline函数添加到window对象
(window as any).pipeline = pipeline

/**
 * 添加翻译系统相关的Block定义和代码生成器
 * @param blocks Blockly blocks对象
 * @param pythonGenerator Python代码生成器
 * @param Blockly Blockly实例
 * @param content 内容配置
 */
export function addTranslationBlocksV2(blocks: typeof Blocks, pythonGenerator: PyodideGenerator, Blockly: typeof TmpBlockly, content: any) {
  // 定义输入文本的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "translation_input",
    "message0": "输入需要翻译的文本 %1",
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
  
  pythonGenerator.forBlock['translation_input'] = function(block, generator) {
    const text = generator.valueToCode(block, 'TEXT', Order.ATOMIC) || "''"
    
    return `# 读取输入文本
if not ${text}.strip():
    raise Exception("请输入需要翻译的文本")
input_text = ${text}
print("待翻译文本:", input_text)`
  }

  // 添加模型类型选择的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "translation_model_type",
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

  pythonGenerator.forBlock['translation_model_type'] = function(block) {
    const dtype = block.getFieldValue('DTYPE')
    return [`'${dtype}'`, Order.ATOMIC]
  }

  // 添加加载翻译模型的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "translation_load_model",
    "message0": "加载翻译模型 %1",
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

  pythonGenerator.forBlock['translation_load_model'] = function(block, generator) {
    const modelType = generator.valueToCode(block, 'MODEL_TYPE', Order.ATOMIC);
    
    generator.addPyodidePreRunCode('translation_load_model', `
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
    
    return `# 加载翻译模型
from transformers import pipeline

print("开始加载模型...")
print("使用模型量化等级:", ${modelType})
try:
    # 确保参数直接传入，而不是作为config对象的一部分
    translator = await pipeline("translation", 
                      model="Xenova/nllb-200-distilled-600M", 
                      dtype_config=${modelType})
    print("翻译模型加载完成")
except Exception as e:
    raise Exception(f"翻译模型加载失败: {str(e)}")`
  }

  // 修改翻译推理Block的定义
  Blockly.defineBlocksWithJsonArray([{
    "type": "translation_translate",
    "message0": "使用翻译模型进行翻译 源语言 %1 目标语言 %2",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "src_lang",
        "options": [
          ["简体中文 (zho_Hans)", "zho_Hans"],
          ["英语 (eng_Latn)", "eng_Latn"],
          ["日语 (jpn_Jpan)", "jpn_Jpan"],
          ["韩语 (kor_Hang)", "kor_Hang"],
          ["法语 (fra_Latn)", "fra_Latn"],
          ["德语 (deu_Latn)", "deu_Latn"],
          ["西班牙语 (spa_Latn)", "spa_Latn"],
          ["俄语 (rus_Cyrl)", "rus_Cyrl"],
          ["阿拉伯语 (arb_Arab)", "arb_Arab"],
          ["印地语 (hin_Deva)", "hin_Deva"],
          ["意大利语 (ita_Latn)", "ita_Latn"],
          ["葡萄牙语 (por_Latn)", "por_Latn"],
          ["越南语 (vie_Latn)", "vie_Latn"],
          ["印尼语 (ind_Latn)", "ind_Latn"],
          ["泰语 (tha_Thai)", "tha_Thai"],
          ["土耳其语 (tur_Latn)", "tur_Latn"],
          ["波兰语 (pol_Latn)", "pol_Latn"],
          ["荷兰语 (nld_Latn)", "nld_Latn"],
          ["希伯来语 (heb_Hebr)", "heb_Hebr"],
          ["希腊语 (ell_Grek)", "ell_Grek"]
        ]
      },
      {
        "type": "field_dropdown",
        "name": "tgt_lang",
        "options": [
          ["英语 (eng_Latn)", "eng_Latn"],
          ["简体中文 (zho_Hans)", "zho_Hans"],
          ["日语 (jpn_Jpan)", "jpn_Jpan"],
          ["韩语 (kor_Hang)", "kor_Hang"],
          ["法语 (fra_Latn)", "fra_Latn"],
          ["德语 (deu_Latn)", "deu_Latn"],
          ["西班牙语 (spa_Latn)", "spa_Latn"],
          ["俄语 (rus_Cyrl)", "rus_Cyrl"],
          ["阿拉伯语 (arb_Arab)", "arb_Arab"],
          ["印地语 (hin_Deva)", "hin_Deva"],
          ["意大利语 (ita_Latn)", "ita_Latn"],
          ["葡萄牙语 (por_Latn)", "por_Latn"],
          ["越南语 (vie_Latn)", "vie_Latn"],
          ["印尼语 (ind_Latn)", "ind_Latn"],
          ["泰语 (tha_Thai)", "tha_Thai"],
          ["土耳其语 (tur_Latn)", "tur_Latn"],
          ["波兰语 (pol_Latn)", "pol_Latn"],
          ["荷兰语 (nld_Latn)", "nld_Latn"],
          ["希伯来语 (heb_Hebr)", "heb_Hebr"],
          ["希腊语 (ell_Grek)", "ell_Grek"]
        ]
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": '#A5D6A7'  // 淡绿色
  }])

  pythonGenerator.forBlock['translation_translate'] = function(block, generator) {
    const srcLang = `'${block.getFieldValue('src_lang')}'`
    const tgtLang = `'${block.getFieldValue('tgt_lang')}'`
    
    return `# 进行翻译
if "translator" not in locals():
    raise Exception("请先加载翻译模型")
if "input_text" not in locals():
    raise Exception("请先输入待翻译文本")

print("源语言:", ${srcLang})
print("目标语言:", ${tgtLang})
try:
    # 修改为与customBlocks_translation一致的参数传递方式
    output = await translator(input_text, {
        "src_lang": ${srcLang}, 
        "tgt_lang": ${tgtLang}
    })
    if not output or not output[0]["translation_text"]:
        raise Exception("翻译失败")
    translated_text = output[0]["translation_text"].strip()
    if not translated_text:
        raise Exception("翻译结果为空")
    print("翻译结果:", translated_text)
except Exception as e:
    raise Exception(f"翻译失败: {str(e)}")`
  }

  // 添加保存翻译结果的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "translation_save_result",
    "message0": "保存翻译结果",
    "previousStatement": null,
    "colour": '#FFAB91'  // 淡红色
  }])

  pythonGenerator.forBlock['translation_save_result'] = function(block, generator) {
    return `# 保存翻译结果
import pandas as pd
import os

if "translated_text" not in locals():
    raise Exception("没有可保存的翻译结果")

# 准备保存的数据
result_data = {
    "original_text": [input_text],
    "translated_text": [translated_text]
}

# 保存为CSV文件
try:
    df = pd.DataFrame(result_data)
    trans_dir = "/data/mount"
    os.makedirs(trans_dir, exist_ok=True)
    csv_path = os.path.join(trans_dir, "translation_result.csv")
    df.to_csv(csv_path, index=False, encoding="utf-8")
    print(f"翻译结果已保存到 {csv_path}")
except Exception as e:
    raise Exception(f"保存结果失败: {str(e)}")`
  }
}
