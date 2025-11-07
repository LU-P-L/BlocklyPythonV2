import type * as TmpBlockly from "blockly";
import type { Blocks } from "blockly";
import { Order } from "blockly/python";
import { pipeline } from "@huggingface/transformers";
import { type PyodideGenerator } from "../PyodideGenerator";
// 将Hugging Face的pipeline函数添加到window对象
(window as any).pipeline = pipeline

/**
 * 添加图像零样本分类相关的Block定义和代码生成器
 * @param blocks Blockly blocks对象
 * @param pythonGenerator Python代码生成器
 * @param Blockly Blockly实例
 * @param content 内容配置
 */
export function addImageZeroshotBlocksV2(blocks: typeof Blocks, pythonGenerator: PyodideGenerator, Blockly: typeof TmpBlockly, content: any) {
  // 定义选择图片的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "image_zeroshot_select_image",
    "tooltip": "",
    "helpUrl": "",
    "message0": "%1 %2",
    "args0": [
      {
        "type": "field_label_serializable",
        "text": "（图像零样本分类）选择图片",
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
  
  pythonGenerator.forBlock['image_zeroshot_select_image'] = function (block, generator) {
    // 生成图片加载相关的Python代码
    let ret = `# 导入必要的库
import cv2
import os
import glob

# 指定图片目录
image_dir = "/data/mount/image_zeroshot"
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

  // 定义输入标签的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "image_zeroshot_input_labels",
    "tooltip": "",
    "helpUrl": "",
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
    "colour": '#81D4FA'  // 蓝色
  }])

  pythonGenerator.forBlock['image_zeroshot_input_labels'] = function(block, generator) {
    const labels = generator.valueToCode(block, 'LABELS', Order.ATOMIC) || "''"
    
    return `# 处理类别标签
if not ${labels}.strip():
    raise Exception("请输入类别标签")
    
label_list = [label.strip() for label in ${labels}.split(",") if label.strip()]

if not label_list:
    raise Exception("请至少输入一个有效的类别标签")
    
print("类别标签:", ", ".join(label_list))`
  }

  // 添加模型类型选择的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "image_zeroshot_model_type",
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

  pythonGenerator.forBlock['image_zeroshot_model_type'] = function(block) {
    const dtype = block.getFieldValue('DTYPE')
    return [`'${dtype}'`, Order.ATOMIC]
  }

  // 添加加载零样本分类模型的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "image_zeroshot_load_model",
    "message0": "加载图像零样本分类模型 %1",
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

  pythonGenerator.forBlock['image_zeroshot_load_model'] = function (block, generator) {
    const modelType = generator.valueToCode(block, 'MODEL_TYPE', Order.ATOMIC);
    generator.addPyodidePreRunCode('image_zeroshot_load_model', `
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
        dtype_config (dict): 数据类型配置
    """
    try:
        # 创建pipeline实例
        func = await js.pipeline(task, model, to_js({
            "dtype": dtype_config.get("dtype", "fp16"),
            "device": dtype_config.get("device", "webgpu")
        }))
        
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

print("正在加载图像零样本分类模型...")
try:
    is_quantized = ${modelType} == 'q8'
    classifier = await pipeline('zero-shot-image-classification', model='Xenova/clip-vit-base-patch32', dtype_config={"dtype": ${modelType}})
    print("图像零样本分类模型加载完成")
except Exception as e:
    print(f"模型加载失败: {str(e)}")
    raise`
  }

  // 添加图像零样本分类推理Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "image_zeroshot_classify",
    "message0": "进行图像零样本分类",
    "previousStatement": null,
    "nextStatement": null,
    "colour": '#4FC3F7'  // 蓝色
  }])

  pythonGenerator.forBlock['image_zeroshot_classify'] = function(block, generator) {
    generator.addPyodidePreRunCode('image_zeroshot_classify', `import cv2
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
    
# 将Python列表转换为JavaScript数组
def to_js_array(py_list):
    from pyodide.ffi import to_js
    # 直接使用to_js并直接传入列表，不使用关键字参数
    return to_js(py_list)
`)

    return `# 检查必要条件
if 'classifier' not in globals():
    raise Exception("请先加载图像零样本分类模型")
if not image_list:
    raise Exception("请先加载图片")
if 'label_list' not in globals() or not label_list:
    raise Exception("请先输入类别标签")

classification_results = []

for idx, (image, name) in enumerate(zip(image_list, image_names)):
    print(f"正在处理第{idx + 1}张图片: {name}...")
    
    try:
        # 将label_list转换为JS数组
        js_labels = to_js_array(label_list)
        # 进行零样本分类 - 直接传递标签列表而不是对象
        output = await classifier(convert_to_url(image), js_labels)
        
        if not output:
            print(f"第{idx + 1}张图片 [{name}] 未能成功分类")
            continue
            
        # 记录分类结果
        classification_results.append({
            "image_index": idx,
            "image_name": name,
            "image": image,
            "results": output
        })
        
        # 输出分类结果
        print(f"第{idx + 1}张图片 [{name}] 分类结果:")
        for result in output:
            print(f"  {result['label']}: {result['score']*100:.2f}%")
    except Exception as e:
        print(f"处理图片 {name} 时发生错误: {str(e)}")
        continue`
  }

  // 添加保存分类结果的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "image_zeroshot_save_result",
    "tooltip": "",
    "helpUrl": "",
    "message0": "保存图像零样本分类结果",
    "previousStatement": null,
    "colour": '#FFAB91'  // 淡红色
  }])
  pythonGenerator.forBlock['image_zeroshot_save_result'] = function (block, generator) {
    return `# 导入所需库
import pandas as pd
import os

if not classification_results:
    raise Exception("没有可保存的分类结果")

# 准备保存的数据
result_data = []
for item in classification_results:
    for result in item["results"]:
        result_data.append({
            "image_name": item["image_name"],
            "label": result["label"],
            "confidence": f"{result['score']*100:.2f}%"
        })

# 保存为CSV文件
df = pd.DataFrame(result_data)
csv_path = os.path.join(image_dir, "image_zeroshot_results.csv")
df.to_csv(csv_path, index=False)
print(f"零样本分类结果已保存至: {csv_path}")`
  }
}
