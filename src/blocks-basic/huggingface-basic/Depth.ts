import type * as TmpBlockly from "blockly";
import type { Blocks } from "blockly";
import { Order } from "blockly/python";
import { pipeline } from "@huggingface/transformers";
import { type PyodideGenerator } from "../PyodideGenerator";
// 将Hugging Face的pipeline函数添加到window对象
(window as any).pipeline = pipeline

/**
 * 添加深度估计相关的Block定义和代码生成器
 * @param blocks Blockly blocks对象
 * @param pythonGenerator Python代码生成器
 * @param Blockly Blockly实例
 * @param content 内容配置
 */
export function addDepthEstimationBlocksV2(blocks: typeof Blocks, pythonGenerator: PyodideGenerator, Blockly: typeof TmpBlockly, content: any) {
  // 定义选择图片的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "depth_select_image",
    "tooltip": "",
    "helpUrl": "",
    "message0": "%1 %2",
    "args0": [
      {
        "type": "field_label_serializable",
        "text": "（深度估计）选择图片",
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
  
  pythonGenerator.forBlock['depth_select_image'] = function (block, generator) {
    // 生成图片加载相关的Python代码
    let ret = `# 导入必要的库
import cv2
import os
import glob

# 指定图片目录
image_dir = "/data/mount/depth"
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
    "type": "depth_model_type",
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

  pythonGenerator.forBlock['depth_model_type'] = function(block) {
    const dtype = block.getFieldValue('DTYPE')
    return [`'${dtype}'`, Order.ATOMIC]
  }

  // 添加加载深度估计模型的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "depth_load_model",
    "message0": "加载深度估计模型 %1",
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

  pythonGenerator.forBlock['depth_load_model'] = function (block, generator) {
    const modelType = generator.valueToCode(block, 'MODEL_TYPE', Order.ATOMIC);
    generator.addPyodidePreRunCode('depth_load_model', `
import sys
import types
from pyodide.ffi import to_js, JsProxy
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
                return result
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

print("正在加载深度估计模型...")
try:
    is_quantized = ${modelType} == 'q8'
    depth_estimator = await pipeline('depth-estimation', 'Xenova/depth-anything-small-hf', ${modelType})
    print("深度估计模型加载完成")
except Exception as e:
    print(f"模型加载失败: {str(e)}")
    raise`
  }

  // 添加深度估计推理Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "depth_estimate",
    "message0": "估计图像深度",
    "previousStatement": null,
    "nextStatement": null,
    "colour": '#4FC3F7'  // 蓝色
  }])

  pythonGenerator.forBlock['depth_estimate'] = function(block, generator) {
    generator.addPyodidePreRunCode('depth_estimate', `import cv2
import numpy as np
from js import Uint8Array, Blob, URL, console
from pyodide.ffi import JsProxy

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
    
def colorize_depth_map(depth_map):
    """
    将深度图转换为彩色图像便于可视化
    
    Args:
        depth_map: 深度图像数据
        
    Returns:
        彩色可视化的深度图
    """
    # 确保深度图是浮点数类型
    depth_map = depth_map.astype(np.float32)
    
    # 将深度映射到0-255范围
    min_val = np.min(depth_map)
    max_val = np.max(depth_map)
    normalized_depth = ((depth_map - min_val) / (max_val - min_val) * 255).astype(np.uint8)
    
    # 应用伪彩色映射
    colored_map = cv2.applyColorMap(normalized_depth, cv2.COLORMAP_JET)
    return colored_map
    
def convert_js_array_to_numpy(js_array):
    """
    将JavaScript数组安全地转换为numpy数组
    """
    try:
        if isinstance(js_array, JsProxy):
            print(f"转换JsProxy对象，可用方法: {[m for m in dir(js_array) if not m.startswith('_')]}")
            try:
                # 尝试直接转换为列表
                data = list(js_array)
                print(f"成功转换为列表，长度: {len(data)}")
                return np.array(data, dtype=np.float32)
            except Exception as e:
                print(f"直接转换为列表失败: {str(e)}")
                try:
                    if hasattr(js_array, 'to_py'):
                        data = js_array.to_py()
                        print(f"使用to_py()转换成功，类型: {type(data)}")
                        return np.array(data, dtype=np.float32)
                except Exception as e2:
                    print(f"使用to_py()转换失败: {str(e2)}")
                    return None
        return np.array(js_array, dtype=np.float32)
    except Exception as e:
        print(f"转换数组失败: {str(e)}")
        return None

def extract_depth_data(output):
    """
    从模型输出中安全地提取深度数据
    """
    try:
        print(f"输出类型: {type(output)}")
        if isinstance(output, JsProxy):
            print(f"输出属性: {[attr for attr in dir(output) if not attr.startswith('_')]}")
            
            # 如果输出是数组且只有一个元素
            if hasattr(output, 'length') and output.length == 1:
                print("发现单元素数组输出")
                first_item = output[0]
                if isinstance(first_item, JsProxy):
                    # 检查是否有predicted_depth属性
                    if hasattr(first_item, 'predicted_depth'):
                        tensor = first_item.predicted_depth
                        print(f"找到predicted_depth: {type(tensor)}")
                        try:
                            # 直接获取数据和形状
                            data = np.array(list(tensor.data), dtype=np.float32)
                            dims = list(tensor.dims)
                            print(f"张量维度: {dims}")
                            if len(dims) >= 2:
                                print(f"成功提取深度数据：维度 {dims}")
                                return data, dims[1], dims[0]
                        except Exception as e:
                            print(f"处理predicted_depth数据时出错: {str(e)}")
            
            # 如果输出本身包含depth属性
            if hasattr(output, 'depth'):
                print("找到depth属性")
                depth_obj = output.depth
                try:
                    data = np.array(list(depth_obj.data), dtype=np.float32)
                    width = int(depth_obj.width)
                    height = int(depth_obj.height)
                    print(f"从depth对象提取数据：{width}x{height}")
                    return data, width, height
                except Exception as e:
                    print(f"处理depth数据时出错: {str(e)}")
                    
            # 尝试转换为Python对象
            try:
                output_data = output.to_py() if hasattr(output, 'to_py') else list(output)
                if isinstance(output_data, (list, tuple)) and len(output_data) > 0:
                    if isinstance(output_data[0], dict):
                        if 'predicted_depth' in output_data[0]:
                            depth_data = output_data[0]['predicted_depth']
                            print(f"深度数据字典: {depth_data.keys() if isinstance(depth_data, dict) else type(depth_data)}")
                            if isinstance(depth_data, dict):
                                if 'data' in depth_data and 'dims' in depth_data:
                                    data = np.array(depth_data['data'], dtype=np.float32)
                                    dims = depth_data['dims']
                                    return data, dims[1], dims[0]
                
            except Exception as e:
                print(f"Python对象转换失败: {str(e)}")
                
        print("无法从输出中提取深度数据")
        return None
    except Exception as e:
        print(f"提取深度数据过程中发生错误: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

`)

    return `# 检查必要条件
if 'depth_estimator' not in globals():
    raise Exception("请先加载深度估计模型")
if not image_list:
    raise Exception("请先加载图片")

depth_results = []

for idx, (image, name) in enumerate(zip(image_list, image_names)):
    print(f"正在处理第{idx + 1}张图片: {name}...")
    
    try:
        # 对当前图片估计深度图
        image_url = convert_to_url(image)
        print("开始深度估计...")
        output = await depth_estimator(image_url)
        print("深度估计完成，开始提取数据...")
        
        # 安全地提取深度数据
        depth_data = extract_depth_data(output)
        if depth_data is None:
            print(f"第{idx + 1}张图片 [{name}] 未能成功提取深度数据")
            continue
            
        # 解包深度数据
        depth_array, depth_width, depth_height = depth_data
        print(f"成功提取深度数据，形状: {depth_array.shape}")
        
        # 如果深度数组是一维的，重塑为二维图像
        if len(depth_array.shape) == 1:
            if depth_width is not None and depth_height is not None:
                try:
                    depth_image = depth_array.reshape(depth_height, depth_width)
                    print(f"重塑深度图为: {depth_height}x{depth_width}")
                except Exception as e:
                    print(f"重塑深度图失败: {str(e)}")
                    continue
            else:
                print("警告: 无法重塑深度图，缺少尺寸信息")
                continue
        else:
            depth_image = depth_array
        
        # 创建彩色深度图用于可视化
        try:
            colored_depth = colorize_depth_map(depth_image)
            
            # 记录深度估计结果
            depth_results.append({
                "image_index": idx,
                "image_name": name,
                "original_image": image,
                "depth_map": depth_image,
                "colored_depth": colored_depth
            })
            
            # 输出处理结果
            print(f"第{idx + 1}张图片 [{name}] - 深度估计完成，深度图尺寸: {depth_width}x{depth_height}")
        except Exception as e:
            print(f"生成彩色深度图失败: {str(e)}")
            continue
            
    except Exception as e:
        print(f"处理图片 {name} 时发生错误: {str(e)}")
        import traceback
        traceback.print_exc()
        continue

if not depth_results:
    print("警告：未能成功处理任何图片的深度估计")
else:
    print(f"成功完成 {len(depth_results)} 张图片的深度估计")`
  }

  // 添加保存深度估计结果的Block
  Blockly.defineBlocksWithJsonArray([{
    "type": "depth_save_result",
    "tooltip": "",
    "helpUrl": "",
    "message0": "保存深度估计结果",
    "previousStatement": null,
    "colour": '#FFAB91'  // 淡红色
  }])
  pythonGenerator.forBlock['depth_save_result'] = function (block, generator) {
    return `# 导入所需库
import os
import cv2
import numpy as np

if not depth_results:
    raise Exception("没有可保存的深度估计结果")

# 创建结果目录
results_dir = os.path.join(image_dir, "results")
if not os.path.exists(results_dir):
    os.makedirs(results_dir)
    print(f"创建结果目录: {results_dir}")

# 保存每个图像的深度图
for result in depth_results:
    original_name = result["image_name"]
    base_name = os.path.splitext(original_name)[0]
    
    # 保存彩色深度图
    colored_depth_path = os.path.join(results_dir, f"{base_name}_depth_colored.png")
    cv2.imwrite(colored_depth_path, result["colored_depth"])
    
    # 保存原始深度图 (归一化为8位灰度图)
    depth_map = result["depth_map"]
    normalized_depth = ((depth_map - np.min(depth_map)) / (np.max(depth_map) - np.min(depth_map)) * 255).astype(np.uint8)
    depth_path = os.path.join(results_dir, f"{base_name}_depth.png")
    cv2.imwrite(depth_path, normalized_depth)

print(f"深度估计结果已保存至: {results_dir}")`
  }
}
