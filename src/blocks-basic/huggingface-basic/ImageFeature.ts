import type * as TmpBlockly from "blockly";
import type { Blocks } from "blockly";
import { Order } from "blockly/python";
import { pipeline } from "@huggingface/transformers";
import { type PyodideGenerator } from "../PyodideGenerator";
// 将Hugging Face的pipeline函数添加到window对象
(window as any).pipeline = pipeline

/**
 * 添加图像特征提取相关的Block定义和代码生成器
 * @param blocks Blockly blocks对象
 * @param pythonGenerator Python代码生成器
 * @param Blockly Blockly实例
 * @param content 内容配置
 */
export function addImageFeatureBlocksV2(blocks: typeof Blocks, pythonGenerator: PyodideGenerator, Blockly: typeof TmpBlockly, content: any) {
  // 定义选择图片的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "feature_select_image",
    "tooltip": "",
    "helpUrl": "",
    "message0": "%1 %2",
    "args0": [
      {
        "type": "field_label_serializable",
        "text": "（图像特征提取）选择图片",
        "name": "NAME"
      },
      {
        "type": "input_value", 
        "name": "image",
        "align": "RIGHT"
      }
    ],
    "nextStatement": null,
    "colour": '#90CAF9'  // 淡蓝色
  }])
  
  pythonGenerator.forBlock['feature_select_image'] = function (block, generator) {
    // 生成图片加载相关的Python代码
    let ret = `# 导入必要的库
import cv2
import os
import glob

# 指定图片目录
image_dir = "/data/mount/image_feature"
image_list = []
image_names = []

# 读取所有图片
if not os.path.exists(image_dir):
    raise Exception(f"图片目录 {image_dir} 不存在")

for image_path in glob.glob(os.path.join(image_dir, "*")):
    if not image_path.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.webp')):
        continue
    image = cv2.imread(image_path)
    if image is None:
        print(f"无法读取图片: {image_path}")
        continue
    image_list.append(image)
    image_names.append(os.path.basename(image_path))
    print(f"已加载图片: {os.path.basename(image_path)}")

if not image_list:
    raise Exception("未找到任何有效的图片文件")
print(f"已加载 {len(image_list)} 张图片")`
    
    return ret
  }

  // 添加模型类型选择的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "feature_model_type",
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

  pythonGenerator.forBlock['feature_model_type'] = function(block) {
    const dtype = block.getFieldValue('DTYPE')
    return [`'${dtype}'`, Order.ATOMIC]
  }

  // 添加加载特征提取模型的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "feature_load_model",
    "message0": "加载图像特征提取模型 %1",
    "args0": [
      {
        "type": "input_value",
        "name": "MODEL_TYPE",
        "check": null
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": '#81D4FA'  // 蓝色
  }])

  pythonGenerator.forBlock['feature_load_model'] = function (block, generator) {
    const modelType = generator.valueToCode(block, 'MODEL_TYPE', Order.ATOMIC);
    generator.addPyodidePreRunCode('feature_load_model', `
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
    return `# 导入必要的库
from transformers import pipeline

print("正在加载图像特征提取模型...")
try:
    is_quantized = ${modelType} == 'q8'
    extractor = await pipeline('image-feature-extraction', 'Xenova/clip-vit-base-patch32', ${modelType})
    print("图像特征提取模型加载完成")
except Exception as e:
    print(f"模型加载失败: {str(e)}")
    raise`
  }

  // 添加特征提取推理Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "feature_extract",
    "message0": "提取图像嵌入向量",
    "previousStatement": null,
    "nextStatement": null,
    "colour": '#4FC3F7'  // 蓝色
  }])

  pythonGenerator.forBlock['feature_extract'] = function(block, generator) {
    generator.addPyodidePreRunCode('feature_extract', `import cv2
import numpy as np
from js import Uint8Array, Blob, URL, console

def convert_to_url(img):
    # 读取图像并编码为字节流
    _, buffer = cv2.imencode(".jpg", img)
    byte_data = buffer.tobytes()
    
    # 转换为 JS 类型
    js_uint8 = Uint8Array.new(len(byte_data))
    js_uint8.assign(byte_data)
    
    # 生成 Blob 和 URL
    blob = Blob.new([js_uint8], {"type": "image/jpg"})
    url = URL.createObjectURL(blob)
    return url
`)

    return `# 检查必要条件
if 'extractor' not in globals():
    raise Exception("请先加载特征提取模型")
if not image_list:
    raise Exception("请先加载图片")

features_list = []

for idx, (image, name) in enumerate(zip(image_list, image_names)):
    print(f"正在处理第{idx + 1}张图片: {name}...")
    
    try:
        # 提取特征
        features = await extractor(convert_to_url(image))
        
        # 将 JsProxy 对象转换为 Python 数据类型
        if hasattr(features, 'to_py'):
            features = features.to_py()
        
        # 确保转换为 NumPy 数组
        try:
            if isinstance(features, list):
                features_array = np.array(features)
            else:
                # 如果已经是特殊结构，尝试先获取数据字段
                if hasattr(features, 'data'):
                    features_array = np.array(features.data)
                else:
                    # 尝试直接转换
                    features_array = np.array(features)
            
            # 确保是一维数组
            flat_features = features_array.flatten() if hasattr(features_array, 'flatten') else np.array(features_array).flatten()
        except Exception as e:
            print(f"特征转换失败: {str(e)}")
            # 备用方案：直接使用原始格式
            flat_features = features if isinstance(features, list) else [features]
        
        # 记录特征结果
        features_list.append({
            "image_index": idx,
            "image_name": name,
            "image": image,
            "features": flat_features
        })
        
        # 安全输出维度和部分特征值
        try:
            if hasattr(features_array, 'shape'):
                dims = ", ".join([str(d) for d in features_array.shape])
                print(f"特征维度: [ {dims} ]")
            else:
                print("特征结构: 非标准数组")
            
            # 输出前几个特征值
            preview = []
            for i, v in enumerate(flat_features):
                if i >= 5:
                    break
                preview.append(f"{float(v):.4f}")
            feature_preview = ", ".join(preview)
            print(f"特征向量片段: [ {feature_preview}, ... ]")
        except Exception as e:
            print(f"特征信息输出失败: {str(e)}")
    except Exception as e:
        print(f"处理图片 {name} 时发生错误: {str(e)}")
        continue`
  }

  // 添加保存特征结果的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "feature_save_result",
    "tooltip": "",
    "helpUrl": "",
    "message0": "保存图像嵌入向量结果",
    "previousStatement": null,
    "colour": '#FFAB91'  // 淡红色
  }])
  pythonGenerator.forBlock['feature_save_result'] = function (block, generator) {
    return `# 导入所需库
import pandas as pd
import os
import numpy as np

if not features_list:
    raise Exception("没有可保存的特征结果")

# 准备保存为CSV的数据
results_data = []
for item in features_list:
    result = {"image_name": item["image_name"]}
    
    # 为每个特征维度添加一列
    for i, value in enumerate(item["features"]):
        result[f"feature_{i}"] = float(value)
    
    results_data.append(result)

# 保存为CSV文件
df = pd.DataFrame(results_data)
csv_path = os.path.join(image_dir, "image_features.csv")
df.to_csv(csv_path, index=False)
print(f"特征向量已保存至: {csv_path}")

# 提示特征维度信息
feature_count = len(features_list[0]["features"])
print(f"特征维度: {feature_count}")`
  }
}
