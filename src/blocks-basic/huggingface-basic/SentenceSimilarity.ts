import type * as TmpBlockly from "blockly";
import type { Blocks } from "blockly";
import { Order } from "blockly/python";
import { pipeline } from "@huggingface/transformers";
import { type PyodideGenerator } from "../PyodideGenerator";
// 将Hugging Face的pipeline函数添加到window对象
(window as any).pipeline = pipeline

/**
 * 添加句子相似度相关的Block定义和代码生成器
 * @param blocks Blockly blocks对象
 * @param pythonGenerator Python代码生成器
 * @param Blockly Blockly实例
 * @param content 内容配置
 */
export function addSentenceSimilarityBlocksV2(blocks: typeof Blocks, pythonGenerator: PyodideGenerator, Blockly: typeof TmpBlockly, content: any) {
  // 定义输入两个文本的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "sentence_similarity_input",
    "tooltip": "",
    "helpUrl": "",
    "message0": "%1 %2 %3",
    "args0": [
      {
        "type": "field_label_serializable",
        "text": "输入两段文本",
        "name": "NAME"
      },
      {
        "type": "input_value", 
        "name": "TEXT1",
        "check": "String",
        "align": "RIGHT"
      },
      {
        "type": "input_value", 
        "name": "TEXT2",
        "check": "String",
        "align": "RIGHT"
      }
    ],
    "nextStatement": null,
    "colour": '#90CAF9'  // 淡蓝色
  }])
  
  pythonGenerator.forBlock['sentence_similarity_input'] = function (block, generator) {
    const text1 = generator.valueToCode(block, 'TEXT1', Order.ATOMIC) || "''"
    const text2 = generator.valueToCode(block, 'TEXT2', Order.ATOMIC) || "''"
    
    return `# 读取输入文本
if not ${text1}.strip():
    raise Exception("请输入第一段文本")
if not ${text2}.strip():
    raise Exception("请输入第二段文本")

# 处理输入的两段文本
text1 = ${text1}.strip()
text2 = ${text2}.strip()
print("文本1:", text1)
print("文本2:", text2)`
  }

  // 添加模型类型选择的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "sentence_similarity_model_type",
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

  pythonGenerator.forBlock['sentence_similarity_model_type'] = function(block) {
    const dtype = block.getFieldValue('DTYPE')
    return [`'${dtype}'`, Order.ATOMIC]
  }

  // 添加加载句子相似度模型的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "sentence_similarity_load_model",
    "message0": "加载句子相似度模型 %1",
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

  pythonGenerator.forBlock['sentence_similarity_load_model'] = function (block, generator) {
    const modelType = generator.valueToCode(block, 'MODEL_TYPE', Order.ATOMIC);
    generator.addPyodidePreRunCode('sentence_similarity_load_model', `
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
    return `# 加载句子相似度模型
from transformers import pipeline

print("开始加载句子相似度模型...")
print("使用模型量化等级:", ${modelType})

try:
    similarity = await pipeline("feature-extraction", 
                              model="nomic-ai/nomic-embed-text-v1.5", 
                              dtype_config=${modelType})
    print("句子相似度模型加载完成")
except Exception as e:
    raise Exception(f"句子相似度模型加载失败: {str(e)}")`
  }

  // 添加句子相似度计算Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "sentence_similarity_compute",
    "message0": "计算文本特征相似度",
    "previousStatement": null,
    "nextStatement": null,
    "colour": '#A5D6A7'  // 淡绿色
  }])

  pythonGenerator.forBlock['sentence_similarity_compute'] = function(block, generator) {
    generator.addPyodidePreRunCode('sentence_similarity_compute', `
import numpy as np

def cosine_similarity(v1, v2):
    """计算余弦相似度"""
    print("开始计算余弦相似度...")
    print(f"向量1形状: {v1.shape}, 向量2形状: {v2.shape}")
    
    try:
        dot_product = np.dot(v1, v2)
        print(f"点积结果: {dot_product}")
        
        norm_v1 = np.linalg.norm(v1)
        print(f"向量1范数: {norm_v1}")
        
        norm_v2 = np.linalg.norm(v2)
        print(f"向量2范数: {norm_v2}")
        
        if norm_v1 == 0 or norm_v2 == 0:
            print("警告: 向量范数为0，返回相似度0")
            return 0.0
        
        similarity = dot_product / (norm_v1 * norm_v2)
        print(f"计算得到的余弦相似度: {similarity}")
        return similarity
    except Exception as e:
        print(f"余弦相似度计算过程中出错: {e}")
        raise
`)
    
    return `# 计算文本特征相似度
if "similarity" not in locals():
    raise Exception("请先加载文本特征模型")
if "text1" not in locals() or "text2" not in locals():
    raise Exception("请先输入两段文本")

print("正在提取文本特征并计算相似度...")
try:
    # 获取两个文本的特征向量
    print("提取两段文本的特征向量...")
    # 这里使用相同文本输入两次，以确保一致的模型输出格式
    sample_input = "This is a sample text"
    print(f"使用样本文本进行格式探测: {sample_input}")
    sample_embedding = await similarity(sample_input)
    print(f"样本嵌入向量类型: {type(sample_embedding)}")
    
    # 尝试不同的方法提取样本向量尺寸
    import numpy as np
    sample_shape = None
    
    try:
        if hasattr(sample_embedding, 'data'):
            sample_array = np.array([float(x) for x in sample_embedding.data])
            sample_shape = sample_array.shape
            print(f"从样本的data属性提取，形状: {sample_shape}")
        elif hasattr(sample_embedding, '__getitem__') and len(sample_embedding) > 0:
            sample_array = np.array([float(x) for x in sample_embedding[0]])
            sample_shape = sample_array.shape
            print(f"从样本的[0]索引提取，形状: {sample_shape}")
        else:
            sample_array = np.array(sample_embedding)
            sample_shape = sample_array.shape
            print(f"将样本直接转换为数组，形状: {sample_shape}")
    except Exception as e:
        print(f"探测样本形状时出错: {e}")
    
    print("提取文本1特征向量...")
    embedding1 = await similarity(text1)
    
    # 提取embedding1数据并转换为numpy数组
    print("处理embedding1...")
    embedding1_array = None
    
    try:
        if hasattr(embedding1, 'data'):
            embedding1_array = np.array([float(x) for x in embedding1.data])
            print("从embedding1.data提取数据")
        elif hasattr(embedding1, '__getitem__') and len(embedding1) > 0:
            embedding1_array = np.array([float(x) for x in embedding1[0]])
            print("从embedding1[0]提取数据")
        else:
            embedding1_array = np.array(embedding1)
            print("将embedding1直接转换为数组")
            
        print(f"embedding1_array原始形状: {embedding1_array.shape}")
    except Exception as e:
        print(f"处理embedding1时出错: {e}")
        raise
    
    print("提取文本2特征向量...")
    embedding2 = await similarity(text2)
    
    # 提取embedding2数据并转换为numpy数组
    print("处理embedding2...")
    embedding2_array = None
    
    try:
        if hasattr(embedding2, 'data'):
            embedding2_array = np.array([float(x) for x in embedding2.data])
            print("从embedding2.data提取数据")
        elif hasattr(embedding2, '__getitem__') and len(embedding2) > 0:
            embedding2_array = np.array([float(x) for x in embedding2[0]])
            print("从embedding2[0]提取数据")
        else:
            embedding2_array = np.array(embedding2)
            print("将embedding2直接转换为数组")
            
        print(f"embedding2_array原始形状: {embedding2_array.shape}")
    except Exception as e:
        print(f"处理embedding2时出错: {e}")
        raise
    
    # 确保两个向量具有相同的维度
    if embedding1_array.shape != embedding2_array.shape:
        print(f"警告: 两个向量维度不一致 {embedding1_array.shape} vs {embedding2_array.shape}")
        print("尝试统一两个向量的维度...")
        
        # 方法1: 获取最小长度，截断较长的向量
        min_length = min(len(embedding1_array), len(embedding2_array))
        embedding1_array = embedding1_array[:min_length]
        embedding2_array = embedding2_array[:min_length]
        print(f"截断后的向量形状: {embedding1_array.shape}, {embedding2_array.shape}")
    
    # 计算余弦相似度
    print("计算余弦相似度...")
    sim_score = cosine_similarity(embedding1_array, embedding2_array)
    
    # 保存相似度结果
    similarity_result = {
        "text1": text1,
        "text2": text2,
        "similarity": sim_score
    }
    
    print(f"两段文本的特征相似度: {sim_score:.4f}")
    
    # 解释相似度结果
    if sim_score > 0.8:
        print("特征相似度很高，两段文本语义非常接近")
    elif sim_score > 0.6:
        print("特征相似度较高，两段文本语义比较接近")
    elif sim_score > 0.4:
        print("特征相似度一般，两段文本有一定的语义相关性")
    else:
        print("特征相似度较低，两段文本语义差异较大")
        
except Exception as e:
    print(f"计算文本特征相似度失败，错误详情: {str(e)}")
    import traceback
    traceback.print_exc()
    raise Exception(f"计算文本特征相似度失败: {str(e)}")`
  }

  // 添加保存结果Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "sentence_similarity_save_result",
    "message0": "保存文本特征相似度结果",
    "previousStatement": null,
    "colour": '#81C784'  // 淡绿色
  }])

  pythonGenerator.forBlock['sentence_similarity_save_result'] = function(block, generator) {
    return `# 保存文本相似度结果
import pandas as pd
import os

# 检查是否有结果可保存
if "similarity_result" not in locals():
    raise Exception("没有可保存的文本相似度结果")

# 准备保存的数据
result_data = {
    "text1": [similarity_result["text1"]],
    "text2": [similarity_result["text2"]],
    "similarity_score": [f"{similarity_result['similarity']:.4f}"]
}

# 保存为CSV文件
try:
    df = pd.DataFrame(result_data)
    similarity_dir = "/data/mount"
    os.makedirs(similarity_dir, exist_ok=True)
    csv_path = os.path.join(similarity_dir, "text_similarity_result.csv")
    df.to_csv(csv_path, index=False, encoding="utf-8")
    print(f"文本特征相似度结果已保存到 {csv_path}")
except Exception as e:
    raise Exception(f"保存结果失败: {str(e)}")`
  }
}
