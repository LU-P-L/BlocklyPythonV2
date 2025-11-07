import type * as TmpBlockly from "blockly";
import type { Blocks } from "blockly";
import { Order } from "blockly/python";
import { pipeline } from "@huggingface/transformers";
import { type PyodideGenerator } from "../PyodideGenerator";
// 将Hugging Face的pipeline函数添加到window对象
(window as any).pipeline = pipeline

/**
 * 添加特征提取相关的Block定义和代码生成器
 * @param blocks Blockly blocks对象
 * @param pythonGenerator Python代码生成器
 * @param Blockly Blockly实例
 * @param content 内容配置
 */
export function addFeatureExtractionBlocksV2(blocks: typeof Blocks, pythonGenerator: PyodideGenerator, Blockly: typeof TmpBlockly, content: any) {
  // 定义输入文本的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "feature_extraction_input",
    "message0": "输入待提取文本 %1",
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

  pythonGenerator.forBlock['feature_extraction_input'] = function (block, generator) {
    const text = generator.valueToCode(block, 'TEXT', Order.ATOMIC) || "''"
    
    let ret = `# 读取输入文本
if not ${text}.strip():
    raise Exception("请输入有效的文本")
input_text = ${text}
print("输入文本:", input_text)
`
    return ret
  }

  // 添加模型类型选择的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "feature_extraction_model_type",
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

  // 为模型类型block添加Python代码生成器
  pythonGenerator.forBlock['feature_extraction_model_type'] = function(block) {
    const dtype = block.getFieldValue('DTYPE')
    return [`'${dtype}'`, Order.ATOMIC]
  }

  // 添加加载特征提取模型的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "feature_extraction_load_model",
    "message0": "加载特征提取模型 %1",
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

  pythonGenerator.forBlock['feature_extraction_load_model'] = function (block, generator) {
    const dtype = generator.valueToCode(block, 'MODEL_TYPE', Order.ATOMIC)
    
    // 添加预运行代码用于设置Transformers
    generator.addPyodidePreRunCode('feature_extraction_load_model', `
import sys
import types
from pyodide.ffi import to_js, JsProxy
import js

# 添加转换JsProxy到Python对象的辅助函数
def convert_js_to_py(js_obj):
    """将JS对象转换为Python对象"""
    if isinstance(js_obj, JsProxy):
        try:
            # 手动遍历属性或列表项
            if hasattr(js_obj, 'length'):  # 可能是JS数组
                return [js_obj[i] for i in range(js_obj.length)]
            elif hasattr(js_obj, 'keys'):  # 可能是JS对象
                return {str(k): convert_js_to_py(js_obj[k]) for k in js_obj.keys()}
            else:
                return js_obj  # 无法转换，保持原样
        except:
            # 如果无法直接转换，则保留原样
            return js_obj
    return js_obj

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
                return convert_js_to_py(result)
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
    
    let ret = `# 加载特征提取模型
from transformers import pipeline

print("开始加载模型...")
print("使用模型量化等级:", ${dtype})
try:
    extractor = await pipeline("feature-extraction",
                          model="nomic-ai/nomic-embed-text-v1.5",
                          dtype_config=${dtype})
    print("特征提取模型加载完成")
except Exception as e:
    raise Exception(f"特征提取模型加载失败: {str(e)}")
`
    return ret
  }

  // 添加特征提取Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "feature_extraction_extract",
    "message0": "提取文本嵌入向量",
    "previousStatement": null,
    "nextStatement": null,
    "colour": '#A5D6A7'  // 淡绿色
  }])

  pythonGenerator.forBlock['feature_extraction_extract'] = function(block) {
    let ret = `# 提取嵌入向量
if "extractor" not in locals():
    raise Exception("请先加载特征提取模型")
if "input_text" not in locals():
    raise Exception("请先输入文本")

print("开始提取嵌入向量...")
try:
    output = await extractor(input_text, pooling="mean", normalize=True)
    
    # 处理输出结果 - 兼容不同格式
    if isinstance(output, list) and len(output) > 0:
        # 如果输出是列表格式
        embeddings = output[0]
    elif hasattr(output, 'data'):
        # 如果输出有data属性 (JS对象格式)
        js_data = output.data
        if hasattr(js_data, 'length'):
            embeddings = [js_data[i] for i in range(js_data.length)]
        else:
            embeddings = js_data
    elif hasattr(output, 'tolist'):
        # 如果是numpy数组或类似格式
        embeddings = output.tolist()
    else:
        # 其他情况，直接使用输出
        embeddings = output
    
    # 确保embeddings是一个列表
    if not isinstance(embeddings, list):
        try:
            embeddings = list(embeddings)
        except:
            embeddings = [embeddings]
    
    print("嵌入向量维度:", len(embeddings))
    
    # 显示前几个元素
    if len(embeddings) > 0:
        sample = embeddings[:5]
        sample_str = ", ".join([f"{float(v):.4f}" for v in sample])
        print(f"嵌入向量: [{sample_str}, ...]")
except Exception as e:
    import traceback
    traceback.print_exc()
    raise Exception(f"嵌入向量提取失败: {str(e)}")
`
    return ret
  }

  // 添加保存特征提取结果的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "feature_extraction_save_result",
    "message0": "保存嵌入向量结果",
    "previousStatement": null,
    "colour": '#FFAB91'  // 淡红色
  }])

  pythonGenerator.forBlock['feature_extraction_save_result'] = function(block) {
    let ret = `# 保存嵌入向量
import pandas as pd
import os

if "embeddings" not in locals():
    raise Exception("没有可保存的嵌入向量")

# 准备保存的数据
result_data = {
    "input_text": [input_text],
    "embeddings": [','.join(map(str, embeddings))]  # 将向量转换为逗号分隔的字符串
}

# 保存为CSV文件
try:
    df = pd.DataFrame(result_data)
    fe_dir = "/data/mount"
    os.makedirs(fe_dir, exist_ok=True)
    csv_path = os.path.join(fe_dir, "embedding_result.csv")
    df.to_csv(csv_path, index=False, encoding="utf-8")
    print("嵌入向量已保存到", csv_path)
except Exception as e:
    raise Exception(f"保存结果失败: {str(e)}")
`
    return ret
  }
}
