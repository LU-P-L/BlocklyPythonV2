import type * as TmpBlockly from "blockly";
import type { Blocks } from "blockly";
import { Order } from "blockly/python";
import { pipeline } from "@huggingface/transformers";
import { type PyodideGenerator } from "../PyodideGenerator";
// 将Hugging Face的pipeline函数添加到window对象
(window as any).pipeline = pipeline

/**
 * 添加目标检测相关的Block定义和代码生成器
 * @param blocks Blockly blocks对象
 * @param pythonGenerator Python代码生成器
 * @param Blockly Blockly实例
 * @param content 内容配置
 */
export function addObjectDetectionBlocksV2(blocks: typeof Blocks, pythonGenerator: PyodideGenerator, Blockly: typeof TmpBlockly, content: any) {
  // 定义选择图片的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "od_select_image",
    "tooltip": "",
    "helpUrl": "",
    "message0": "%1 %2",
    "args0": [
      {
        "type": "field_label_serializable",
        "text": "（目标检测）选择图片",
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
  pythonGenerator.forBlock['od_select_image'] = function (block, generator) {
    // 生成图片加载相关的Python代码
    let ret = `# 导入必要的库
import cv2
import os
import glob

# 指定图片目录
image_dir = "/data/mount/od"
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
    "type": "od_model_type",
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
    "colour": 225  // 改为与其他模块相同的蓝色调
  }])


  pythonGenerator.forBlock['od_model_type'] = function(block) {
    const dtype = block.getFieldValue('DTYPE')
    return [`'${dtype}'`, Order.ATOMIC]
  }

  // 添加加载目标检测模型的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "od_load_model",
    "message0": "加载目标检测模型 %1",
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

  pythonGenerator.forBlock['od_load_model'] = function (block, generator) {
    const modelType = generator.valueToCode(block, 'MODEL_TYPE', Order.ATOMIC);
    generator.addPyodidePreRunCode('od_load_model', `
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

print("开始加载模型...")
try:
    detector = await pipeline("object-detection", model="Xenova/detr-resnet-50", dtype_config={"dtype": ${modelType}})
    print("目标检测模型加载完成")
except Exception as e:
    print(f"模型加载失败: {str(e)}")
    raise`
  }

  // 添加目标检测推理Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "od_detect",
    "message0": "使用目标检测模型进行推理 阈值为 %1",
    "args0": [
      {
        "type": "input_value",
        "name": "threshold",
        "check": "Number"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": '#A5D6A7'  // 淡绿色
  }])

  pythonGenerator.forBlock['od_detect'] = function(block, generator) {
    const threshold = generator.valueToCode(block, 'threshold', Order.ATOMIC) || '0.9'
    generator.addPyodidePreRunCode('od_detect', `import cv2
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
if 'detector' not in globals():
    raise Exception("请先加载目标检测模型")
if not image_list:
    raise Exception("请先加载图片")

detection_results = []

for idx, (image, name) in enumerate(zip(image_list, image_names)):
    print(f"正在处理第{idx + 1}张图片: {name}...")
    
    try:
        # 对当前图片进行目标检测
        detections = await detector(convert_to_url(image), threshold=${threshold})
        
        if not detections:
            print(f"第{idx + 1}张图片 [{name}] 未检测到任何目标")
            continue
        
        # 处理检测结果
        processed_detections = []
        for det in detections:
            box = {
                "xmin": round(det["box"]["xmin"]),
                "ymin": round(det["box"]["ymin"]),
                "xmax": round(det["box"]["xmax"]),
                "ymax": round(det["box"]["ymax"])
            }
            processed_detections.append({
                "label": det["label"],
                "score": det["score"],
                "box": box
            })
            print(f"第{idx + 1}张图片 [{name}] - "
                  f"类别: {det['label']}, "
                  f"置信度: {det['score']:.2%}, "
                  f"位置: ({box['xmin']}, {box['ymin']}, {box['xmax']}, {box['ymax']})")
        
        detection_results.append({
            "image_index": idx,
            "image_name": name,
            "image": image,
            "detections": processed_detections
        })
    except Exception as e:
        print(f"处理图片 {name} 时发生错误: {str(e)}")
        continue`
  }

// 修改绘制检测结果的Block定义
  Blockly.defineBlocksWithJsonArray([{
    "type": "od_draw_result",
    "tooltip": "",
    "helpUrl": "",
    "message0": "在图片上绘制目标检测结果 颜色为 %1 显示置信度 %2",
    "args0": [
      {
        "type": "input_value",
        "name": "COLOR",
        "check": null
      },
      {
        "type": "input_value",
        "name": "SHOW_SCORE",
        "check": "Boolean",
        "align": "RIGHT"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": '#FFE082'  // 淡黄色
  }])
  
  // 修改Python代码生成器
  pythonGenerator.forBlock['od_draw_result'] = function (block, generator) {
    const color = generator.valueToCode(block, 'COLOR', Order.ATOMIC) || "'#FF0000'"
    const showScore = generator.valueToCode(block, 'SHOW_SCORE', Order.ATOMIC) || 'True'
    
    // 将十六进制颜色转换为RGB
    const colorStr = color.replace(/['"]/g, '') // 移除引号
    const r = parseInt(colorStr.slice(1, 3), 16)
    const g = parseInt(colorStr.slice(3, 5), 16)
    const b = parseInt(colorStr.slice(5, 7), 16)
    
    return `
# 绘制检测结果
result_images = []

for detection in detection_results:
    print(f"正在绘制图片: {detection['image_name']}")
    image = detection["image"].copy()
    
    # 绘制每个检测框
    for det in detection["detections"]:
        box = det["box"]
        label = det["label"]
        score = det["score"]
        
        # 绘制边界框
        cv2.rectangle(image,
                      (box["xmin"], box["ymin"]),
                      (box["xmax"], box["ymax"]),
                      (${b}, ${g}, ${r}), 2)
        
        # 绘制标签
        text = f"{label} {score:.1%}" if ${showScore} else label
        cv2.putText(image, text,
                    (box["xmin"], box["ymin"] - 5),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5,
                    (${b}, ${g}, ${r}), 2)
    
    result_images.append(image)
    print(f"图片 {detection['image_name']} 绘制完成")
`
  }

  // 添加保存检测结果的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "od_save_result",
    "tooltip": "",
    "helpUrl": "",
    "message0": "保存目标检测结果",
    "previousStatement": null,
    "colour": '#FFAB91'  // 淡红色
  }])
  pythonGenerator.forBlock['od_save_result'] = function (block, generator) {
    return `# 导入所需库
import pandas as pd
import os
import cv2
from datetime import datetime
from PIL import Image
import matplotlib.pyplot as plt

# 创建时间戳
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

try:
    # 保存CSV结果
    results_data = []
    for detection in detection_results:
        for det in detection["detections"]:
            results_data.append({
                "image_name": detection["image_name"],
                "label": det["label"],
                "confidence": f"{det['score']:.2%}",
                "x_min": det["box"]["xmin"],
                "y_min": det["box"]["ymin"],
                "x_max": det["box"]["xmax"],
                "y_max": det["box"]["ymax"]
            })
    df = pd.DataFrame(results_data)

    
    # 保存CSV
    csv_path = os.path.join(image_dir, "detection_results.csv")
    df.to_csv(csv_path, index=False)
    print(f"检测结果已保存至: {csv_path}")

    # 保存绘制结果图片
    for img, detection in zip(result_images, detection_results):
        output_path = os.path.join(image_dir, f"detection_result_{detection['image_name']}")
        cv2.imwrite(output_path, img)
        print(f"已保存结果图片: {output_path}")
        img = Image.open(output_path)
        plt.figure(output_path) # 图像窗口名称
        plt.imshow(img)
        plt.axis('on') # 关掉坐标轴为 off
        plt.title('image') # 图像题目
        plt.show()
    print("所有检测结果已成功保存")
except Exception as e:
    print(f"保存结果时发生错误: {str(e)}")
    raise`
  }
}