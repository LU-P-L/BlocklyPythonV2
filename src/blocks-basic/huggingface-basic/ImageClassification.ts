import type * as TmpBlockly from "blockly";
import type { Blocks } from "blockly";
import { Order } from "blockly/python";
import { pipeline } from "@huggingface/transformers";
import { type PyodideGenerator } from "../PyodideGenerator";
// 将Hugging Face的pipeline函数添加到window对象
(window as any).pipeline = pipeline

/**
 * 添加图像分类相关的Block定义和代码生成器
 * @param blocks Blockly blocks对象
 * @param pythonGenerator Python代码生成器
 * @param Blockly Blockly实例
 * @param content 内容配置
 */
export function addImageClassificationBlocksV2(blocks: typeof Blocks, pythonGenerator: PyodideGenerator, Blockly: typeof TmpBlockly, content: any) {
  // 定义选择图片的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "ic_select_image",
    "tooltip": "",
    "helpUrl": "",
    "message0": "%1 %2",
    "args0": [
      {
        "type": "field_label_serializable",
        "text": "（图像分类）选择图片",
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
  pythonGenerator.forBlock['ic_select_image'] = function (block, generator) {
    // 生成图片加载相关的Python代码
    let ret = `# 导入必要的库
import cv2
import os
import glob

# 指定图片目录
image_dir = "/data/mount/image_classification"
image_list = []
image_names = []

# 读取所有图片
for img_path in glob.glob(os.path.join(image_dir, "*.jpg")):
    img = cv2.imread(img_path)
    if img is not None:
        image_list.append(img)
        image_names.append(os.path.basename(img_path))
        print(f"已加载图片: {os.path.basename(img_path)}")
if not image_list:
    raise Exception("未找到任何有效的图片")`
    
    return ret
  }

  // 添加模型类型选择的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "ic_model_type",
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
    "colour": 225  // 保持与其他模块相同的蓝色调
  }])

  pythonGenerator.forBlock['ic_model_type'] = function(block) {
    const dtype = block.getFieldValue('DTYPE')
    return [`'${dtype}'`, Order.ATOMIC]
  }

  // 添加加载图像分类模型的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "ic_load_model",
    "message0": "加载图像分类模型 %1",
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

  pythonGenerator.forBlock['ic_load_model'] = function (block, generator) {
    const modelType = generator.valueToCode(block, 'MODEL_TYPE', Order.ATOMIC);
    generator.addPyodidePreRunCode('ic_load_model', `
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

print("开始加载模型...")
try:
    print(f"使用模型量化等级: {${modelType}}")
    classifier = await pipeline("image-classification", "Xenova/vit-base-patch16-224", ${modelType})
    print("图像分类模型加载完成")
except Exception as e:
    print(f"模型加载失败: {str(e)}")
    raise`
  }

  // 添加图像分类推理Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "ic_classify",
    "message0": "使用图像分类模型进行推理",
    "previousStatement": null,
    "nextStatement": null,
    "colour": '#A5D6A7'  // 淡绿色
  }])

  pythonGenerator.forBlock['ic_classify'] = function(block, generator) {
    generator.addPyodidePreRunCode('ic_classify', `import cv2
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
if 'classifier' not in globals():
    raise Exception("请先加载图像分类模型")
if not image_list:
    raise Exception("请先加载图片")

classification_results = []

for idx, (image, name) in enumerate(zip(image_list, image_names)):
    print(f"正在处理第{idx + 1}张图片: {name}...")
    
    try:
        # 对当前图片进行图像分类
        result = await classifier(convert_to_url(image))
        
        if not result:
            print(f"第{idx + 1}张图片 [{name}] 未能成功分类")
            continue
            
        # 处理分类结果
        classification_results.append({
            "image_index": idx,
            "image_name": name,
            "image": image,
            "result": result[0]
        })
        
        # 输出分类结果
        print(f"第{idx + 1}张图片 [{name}] - "
              f"类别: {result[0]['label']}, "
              f"置信度: {result[0]['score']:.2%}")
    except Exception as e:
        print(f"处理图片 {name} 时发生错误: {str(e)}")
        continue`
  }

  // 添加保存分类结果的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "ic_save_result",
    "tooltip": "",
    "helpUrl": "",
    "message0": "保存图像分类结果",
    "previousStatement": null,
    "colour": '#FFAB91'  // 淡红色
  }])
  pythonGenerator.forBlock['ic_save_result'] = function (block, generator) {
    return `# 导入所需库
import pandas as pd
import os

if not classification_results:
    raise Exception("没有可保存的分类结果")

# 准备保存为CSV的数据
results_data = []
for cl in classification_results:
    results_data.append({
        "image_name": cl["image_name"],
        "label": cl["result"]["label"],
        "confidence": f"{cl['result']['score']:.2%}"
    })

# 保存为CSV文件
df = pd.DataFrame(results_data)
csv_path = os.path.join(image_dir, "classification_results.csv")
df.to_csv(csv_path, index=False)
print(f"分类结果已保存至: {csv_path}")`
  }
}