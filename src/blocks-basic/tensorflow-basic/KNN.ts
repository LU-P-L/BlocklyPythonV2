import * as TmpBlockly from 'blockly'
import type { BlockDefinition } from "blockly/core/blocks"
import type { CodeGenerator } from "blockly/core/generator"
import { type PyodideGenerator } from "../PyodideGenerator";
import { Order } from 'blockly/python'

const KNN_COLOR = 250;

export function addKNNBlocksV2(blocks: typeof TmpBlockly.Blocks, pythonGenerator: PyodideGenerator, Blockly: typeof TmpBlockly, content: any) {
    // Distance Metric block
    Blockly.defineBlocksWithJsonArray([{
        "type": "distance_metric",
        "message0": "%1",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "metric",
                "options": [
                    ["欧氏距离", "euclidean"],
                    ["曼哈顿距离", "manhattan"],
                    ["切比雪夫距离", "chebyshev"],
                    ["闵可夫斯基距离", "minkowski"]
                ]
            }
        ],
        "output": null,
        "colour": KNN_COLOR
    }]);

    pythonGenerator.forBlock['distance_metric'] = function (block) {
        const metric = block.getFieldValue('metric');
        return [metric, Order.ATOMIC];
    };

    // KNN 训练数据集区块
    Blockly.defineBlocksWithJsonArray([{
        "type": "knn_set_train_dataset",
        "message0": "%1 标签字段为 %2",
        "args0": [
            {
                "type": "field_label_serializable",
                "text": "(KNN)选择训练数据集",
                "name": "NAME"
            },
            {
                "type": "input_value",
                "name": "label",
                "align": "RIGHT",
                "check": "String"
            }
        ],
        "nextStatement": null,
        "colour": KNN_COLOR
    }]);

    pythonGenerator.forBlock['knn_set_train_dataset'] = function (block, generator) {
        generator.addPyodidePreRunCode('knn_set_train_dataset', `
# 导入必要的库
import pandas as pd
from js import tf
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import accuracy_score
import numpy as np
import os
import glob
from pyodide.ffi import to_js
import matplotlib.pyplot as plt


def load_train_data_from_dir(train_data_dir):
    train_file_list = []

    # 读取所有CSV文件
    for csv_path in glob.glob(os.path.join(train_data_dir, "*.csv")):
        train_file_list.append(csv_path)
        print(f"已找到训练数据文件: {os.path.basename(csv_path)}")

    # 选择第一个CSV文件作为训练数据
    train_file = train_file_list[0]
    print(f"使用训练数据文件: {os.path.basename(train_file)}")

    # 加载训练数据
    train_data = pd.read_csv(train_file)
    
    return train_data
        `);

        let ret = `# 导入必要的库
import pandas as pd
from js import tf
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import accuracy_score
import numpy as np
import os
import glob
from pyodide.ffi import to_js
import matplotlib.pyplot as plt
# 设置数据类型为CSV
data_type = "csv"
# 指定训练数据集目录
train_data_dir = "/data/mount/knn/train"
train_data = load_train_data_from_dir(train_data_dir)
`;

        const conn = block.getInput('label').connection;
        let labelColumn = 'label'; // 默认标签字段名
        if (conn && conn.targetBlock()) {
            const connBlock = conn.targetBlock();
            const txt = connBlock?.getFieldValue('TEXT').trim();
            if (txt) {
                labelColumn = txt;
            }
        }
        ret += `label_column = '${labelColumn}'\n`;

        ret += `# 准备训练数据
X_train = train_data.drop(columns=[label_column]).values.astype(np.float32)
y_train = train_data[label_column].values.astype(np.int32)
# 特征缩放
scaler = MinMaxScaler()
X_train_scaled = scaler.fit_transform(X_train)
# 转换为张量
X_train_tensor = tf.tensor(to_js(X_train_scaled.tolist()))
y_train_tensor = tf.tensor(to_js(y_train.tolist()))
print(f"训练数据形状: {X_train.shape} 成功创建特征和标签张量")
# 为后续预测准备类别映射
class_to_idx = {}
idx_to_class = {i: str(i) for i in np.unique(y_train)}`;

        return ret;
    };

    // KNN 测试数据集区块
    Blockly.defineBlocksWithJsonArray([{
        "type": "knn_set_test_dataset",
        "message0": "%1",
        "args0": [
            {
                "type": "field_label_serializable",
                "text": "(KNN)选择测试数据集",
                "name": "NAME"
            }
        ],
        "nextStatement": null,
        "previousStatement": null,
        "colour": KNN_COLOR
    }]);

    pythonGenerator.forBlock['knn_set_test_dataset'] = function (block, generator) {
        generator.addPyodidePreRunCode('knn_set_test_dataset', `

def load_test_data_from_dir(test_data_dir):
    test_file_list = []

    # 读取所有CSV文件
    for csv_path in glob.glob(os.path.join(test_data_dir, "*.csv")):
        test_file_list.append(csv_path)
        print(f"已找到测试数据文件: {os.path.basename(csv_path)}")
    if not test_file_list:
        raise Exception("未找到任何测试数据文件")

    # 选择第一个CSV文件作为测试数据
    test_file = test_file_list[0]
    print(f"使用测试数据文件: {os.path.basename(test_file)}")

    # 加载测试数据
    test_data = pd.read_csv(test_file)

    # 如果存在id列，则排除它
    id_column = test_data['id'] if 'id' in test_data.columns else pd.Series(range(len(test_data)))
    feature_columns = [col for col in test_data.columns if col != 'id']
    X_test = test_data[feature_columns].values.astype(np.float32)
    
    return X_test, id_column
        `);


        return `# 指定测试数据集目录
test_data_dir = "/data/mount/knn/test"
X_test,id_column = load_test_data_from_dir(test_data_dir)
# 使用相同的缩放器对测试特征进行缩放
X_test_scaled = scaler.transform(X_test)
X_test_tensor = tf.tensor(to_js(X_test_scaled.tolist()))
print(f"测试数据形状: {X_test.shape} 成功创建测试数据张量")
`;
    };

    // KNN 图像训练数据集区块
    Blockly.defineBlocksWithJsonArray([{
        "type": "knn_set_train_images",
        "message0": "%1 %2 使用模型 %3",
        "args0": [
            {
                "type": "field_label_serializable",
                "text": "(KNN)加载训练图像",
                "name": "NAME"
            },
            {
                "type": "input_end_row",
                "name": "NAME"
            },
            {
                "type": "input_value",
                "name": "model_type",
                "check": "String"
            }
        ],
        "nextStatement": null,
        "colour": KNN_COLOR
    }]);

    pythonGenerator.forBlock['knn_set_train_images'] = function (block, generator) {
        generator.addPyodidePreRunCode('knn_set_train_images', `
import pandas as pd
import numpy as np
import os
import glob
from PIL import Image
import io
from js import tf
from pyodide.ffi import to_js, create_proxy
import matplotlib.pyplot as plt
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import accuracy_score
import json
from scipy import ndimage

# 简单特征提取函数
def extract_features_simple(img_array, target_size=(32, 32), use_hog=True, use_edges=True, use_color=True):
    features = []
    
    # 1. 基础特征 - 调整大小的灰度图像
    gray = np.mean(img_array, axis=2)  # 转为灰度
    resized_gray = np.resize(gray, target_size)
    features.append(resized_gray.flatten())
    
    # 2. 边缘特征
    if use_edges:
        # 使用Sobel算子提取边缘
        sobel_h = ndimage.sobel(gray, axis=0)
        sobel_v = ndimage.sobel(gray, axis=1)
        edges = np.hypot(sobel_h, sobel_v)
        edges = edges / edges.max()  # 归一化
        edges_resized = np.resize(edges, target_size)
        features.append(edges_resized.flatten())
    
    # 3. 颜色直方图特征
    if use_color:
        # 创建简化版的颜色直方图 (每通道4个bins)
        color_features = []
        for channel in range(3):
            hist, _ = np.histogram(img_array[:,:,channel], bins=4, range=(0, 1))
            color_features.extend(hist / np.sum(hist))  # 归一化直方图
        features.append(color_features)
    
    # 4. 简化版HOG特征
    if use_hog:
        # 计算梯度
        gy, gx = np.gradient(resized_gray)
        
        # 计算梯度大小和方向
        mag = np.sqrt(gx**2 + gy**2)
        ang = np.arctan2(gy, gx) * 180 / np.pi % 180
        
        # 简化的HOG: 将方向分成8个bin
        hog_features = []
        bins = 8
        bin_size = 180 / bins
        
        for bin_i in range(bins):
            bin_lower = bin_i * bin_size
            bin_upper = (bin_i + 1) * bin_size
            bin_mask = (ang >= bin_lower) & (ang < bin_upper)
            hog_features.append(np.sum(mag * bin_mask))
        
        # 归一化HOG特征
        if np.sum(hog_features) > 0:
            hog_features = hog_features / np.sum(hog_features)
        
        features.append(hog_features)
    
    # 合并所有特征
    return np.concatenate(features)

def load_train_image_from_dir(train_images_dir):
    # 获取所有子目录（类别）
    class_dirs = [d for d in os.listdir(train_images_dir) if os.path.isdir(os.path.join(train_images_dir, d))]
    if not class_dirs:
        raise Exception(f"在 {train_images_dir} 中没有找到任何类别文件夹")

    print(f"找到以下类别: {class_dirs}")

    # 创建类别映射
    class_to_idx = {class_name: i for i, class_name in enumerate(class_dirs)}
    idx_to_class = {i: class_name for class_name, i in class_to_idx.items()}

    # 获取类别数量用于自动设置K值
    num_classes = len(class_dirs)

    # 收集所有图像路径和标签
    image_paths = []
    labels = []

    for class_name in class_dirs:
        class_dir = os.path.join(train_images_dir, class_name)
        class_idx = class_to_idx[class_name]
        
        # 支持的图像格式
        for img_ext in ['*.jpg', '*.jpeg', '*.png']:
            class_images = glob.glob(os.path.join(class_dir, img_ext))
            for img_path in class_images:
                image_paths.append(img_path)
                labels.append(class_idx)
        
        print(f"类别 '{class_name}' (索引 {class_idx}): 找到 {len([p for p in image_paths if labels[image_paths.index(p)] == class_idx])} 张图片")
    return image_paths,labels,class_to_idx,idx_to_class,num_classes

async def get_model(model_type):
    MOBILENET_V1_URL = 'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json'
    # 选择模型类型
    if model_type == "mobilenet_v1":
        model = await tf.loadLayersModel(MOBILENET_V1_URL)
        print("使用MobileNet V1模型")   
    else:
        model = None
        print("使用优化的简单特征提取方法")
    return model
        `);




        // Get model type for feature extraction
        const modelValue = pythonGenerator.valueToCode(block, 'model_type', Order.ATOMIC);
        const modelType = modelValue.replace(/'/g, '') || "mobilenet"; // Default to MobileNet if not specified

        let ret = `# 导入必要的库
import pandas as pd
import numpy as np
import os
import glob
from PIL import Image
import io
from js import tf
from pyodide.ffi import to_js, create_proxy
import matplotlib.pyplot as plt
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import accuracy_score
import json
from scipy import ndimage

data_type = "image"
# 定义训练图像目录
train_images_dir = "/data/mount/knn/train_images"
image_paths,labels,class_to_idx,idx_to_class,num_classes = load_train_image_from_dir(train_images_dir)
print("开始处理训练图像并提取特征...")
# 图像预处理函数
def preprocess_image(img_path):
    img = Image.open(img_path).convert('RGB')
    img = img.resize((224, 224))  # 调整图像大小为224x224
    img_array = np.array(img)
    img_array = img_array / 255.0  # 归一化
    img_array = img_array.astype(np.float32)
    return img_array

X_train = []
batch_size = 16
model = await get_model("${modelType}")
for i in range(0, len(image_paths), batch_size):
    batch_paths = image_paths[i:i + batch_size]
    batch_features = []
    for img_path in batch_paths:
        # 加载图像并进行预处理
        img_array = preprocess_image(img_path)
        if model is not None:
            # 转换为张量并添加批次维度
            img_tensor = tf.tensor(to_js([img_array]))
            # 使用模型进行预测
            features = model.predict(img_tensor)
            # 获取特征向量（平均池化层输出）
            feature_vector = features.arraySync()[0]
        else:
            # 如果模型未加载，使用简单特征提取
            feature_vector = extract_features_simple(img_array)
        batch_features.append(feature_vector)
    X_train.extend(batch_features)
X_train = np.array(X_train)
y_train = np.array(labels).astype(np.float32)
# 特征缩放
scaler = MinMaxScaler()
X_train_scaled = scaler.fit_transform(X_train).astype(np.float32)
# 转换为张量
X_train_tensor = tf.tensor(to_js(X_train_scaled.tolist()))
y_train_tensor = tf.tensor(to_js(y_train.tolist()))
print(f"训练数据形状: {X_train_scaled.shape} 成功创建特征和标签张量")`;

        return ret;
    };

    // KNN 图像测试数据集区块
    Blockly.defineBlocksWithJsonArray([{
        "type": "knn_set_test_images",
        "message0": "%1",
        "args0": [
            {
                "type": "field_label_serializable",
                "text": "(KNN)选择测试图像",
                "name": "NAME"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": KNN_COLOR
    }]);

    pythonGenerator.forBlock['knn_set_test_images'] = function (block, generator) {
        generator.addPyodidePreRunCode('knn_set_test_images', `
def load_test_image_from_dir(test_images_dir):
    # 检查目录是否存在
    if not os.path.exists(test_images_dir):
        raise Exception(f"测试图像目录 {test_images_dir} 不存在")

    # 收集所有测试图像路径
    image_paths = []
    image_ids = []

    # 支持的图像格式
    i = 0
    for img_ext in ['*.jpg', '*.jpeg', '*.png']:
        for img_path in glob.glob(os.path.join(test_images_dir, img_ext)):
            image_paths.append(img_path)
            image_ids.append(os.path.basename(img_path))
        i += 1

    if not image_paths:
        raise Exception(f"在 {test_images_dir} 中没有找到任何图像")

    print(f"找到 {len(image_paths)} 张测试图像")

    return image_paths,image_ids
        `);

        return `
# 定义测试图像目录
test_images_dir = "/data/mount/knn/test_images"
image_paths,image_ids = load_test_image_from_dir(test_images_dir)
# 提取测试图像的特征向量
X_test = []
batch_size = 16
for i in range(0, len(image_paths), batch_size):
    batch_paths = image_paths[i:i + batch_size]
    batch_features = []
    for img_path in batch_paths:
        # 加载图像并进行预处理
        img_array = preprocess_image(img_path)
        if model is not None:
            # 转换为张量并添加批次维度
            img_tensor = tf.tensor(to_js([img_array]))
            # 使用模型进行预测
            features = model.predict(img_tensor)
            # 获取特征向量（平均池化层输出）
            feature_vector = features.arraySync()[0]
        else:
            # 如果模型未加载，使用优化的简单特征提取
            feature_vector = extract_features_simple(img_array)
        batch_features.append(feature_vector)
    X_test.extend(batch_features)
X_test = np.array(X_test)
X_test_scaled = scaler.transform(X_test)
X_test_scaled = X_test_scaled.astype(np.float32)
X_test_tensor = tf.tensor(to_js(X_test_scaled.tolist()))
print(f"测试数据形状: {X_test_scaled.shape} 成功创建测试数据张量")
# 保存ID信息用于结果输出
id_column = image_ids
`;
    };

    // 模型类型选择块
    Blockly.defineBlocksWithJsonArray([{
        "type": "feature_extraction_model",
        "message0": "%1",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "model",
                "options": [
                    ["MobileNetV1", "mobilenet_v1"],
                    ["简单特征", "simple"]
                ]
            }
        ],
        "output": "String",
        "colour": KNN_COLOR
    }]);

    pythonGenerator.forBlock['feature_extraction_model'] = function (block) {
        const model = block.getFieldValue('model');
        return [`'${model}'`, Order.ATOMIC];
    };

    // KNN 分类器区块
    Blockly.defineBlocksWithJsonArray([{
        "type": "knn_classifier",
        "message0": "创建knn分类器，k值为 %1 距离算法 %2",
        "args0": [
            {
                "type": "input_value",
                "name": "k_value",
                "check": "Number"
            },
            {
                "type": "input_value",
                "name": "distance_metric",
                "check": null
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": KNN_COLOR
    }]);

    pythonGenerator.forBlock['knn_classifier'] = function (block) {
        const k = pythonGenerator.valueToCode(block, 'k_value', Order.ATOMIC) || '3'; // 设置默认k值为3
        const metric = pythonGenerator.valueToCode(block, 'distance_metric', Order.ATOMIC) || 'euclidean'; // 默认为欧氏距离
        return `# 设置K值和距离度量
k = ${k}
if data_type == "image":
    k = num_classes
distance_metric = "${metric}"
print(f"设置KNN参数: k={k}, 距离度量={distance_metric}")`;
    };

    // KNN 训练/预测区块
    Blockly.defineBlocksWithJsonArray([{
        "type": "fit_knn_classifier",
        "message0": "开始训练knn分类器并输出结果 %1",
        "args0": [
            {
                "type": "input_end_row",
                "name": "NAME"
            }
        ],
        "previousStatement": null,
        "colour": KNN_COLOR
    }]);



    pythonGenerator.forBlock['fit_knn_classifier'] = function (block, generator) {
        generator.addPyodidePreRunCode('fit_knn_classifier', `
def save_csv_results(output_file, id_column, y_pred, data_type, idx_to_class=None):
    import pandas as pd
    if data_type == "csv":
        # CSV 数据预测结果
        results_df = pd.DataFrame({
            'id': id_column,
            'predicted_label': y_pred
        })
        results_df.to_csv(output_file, index=False)
        print(f"预测结果已保存至: {output_file}")
    elif data_type == "image":
        # 图像数据预测结果
        results = []
        for i in range(len(id_column)):
            # 获取图像ID和预测的类别标签
            image_id = id_column[i]
            pred_idx = y_pred[i]
            pred_class = idx_to_class.get(pred_idx, f"未知类别_{pred_idx}")
            
            results.append({
                'image_id': image_id,
                'predicted_class': pred_class,
                'predicted_idx': int(pred_idx)
            })
        
        # 创建结果DataFrame
        results_df = pd.DataFrame(results)
        results_df.to_csv(output_file, index=False)
        
        print(f"预测结果已保存至: {output_file}")
        print("\\n预测结果示例:")
        for i in range(min(5, len(results))):
            print(f"图像: {results[i]['image_id']}, 预测类别: {results[i]['predicted_class']}")

def calculate_distances(X_train_tensor, diff, distance_metric):
    if distance_metric == "euclidean":
        # 欧氏距离 - L2范数
        distances = tf.sum(tf.pow(diff, 2), 1)
    elif distance_metric == "manhattan":
        # 曼哈顿距离 - L1范数
        distances = tf.sum(tf.abs(diff), 1)
    elif distance_metric == "chebyshev":
        # 切比雪夫距离 - L∞范数
        distances = tf.max(tf.abs(diff), 1)
    elif distance_metric == "minkowski":
        # 闵可夫斯基距离（p=3）
        distances = tf.sum(tf.pow(tf.abs(diff), 3), 1)
    else:
        # 默认使用欧氏距离
        distances = tf.sum(tf.pow(diff, 2), 1)

    return distances
        `);
        return `# 进行预测
output_dir = "/data/mount/knn/output"
os.makedirs(output_dir, exist_ok=True)
output_file = os.path.join(output_dir, "knn_predictions.csv")
print(f"使用 KNN 进行预测 (数据类型: {data_type}, K值: {k})...")
y_pred = []
for i in range(len(X_test_scaled)):
    test_sample = tf.tensor(to_js([X_test_scaled[i].tolist()]))
    # 计算与所有训练样本的距离
    diff = tf.sub(X_train_tensor, tf.broadcastTo(test_sample, X_train_tensor.shape))
    distances = calculate_distances(X_train_tensor, diff, distance_metric)
    # 获取最近的k个样本的索引
    neg_distances = tf.neg(distances)
    topk_result = tf.topk(neg_distances, k)
    top_k_indices = topk_result.indices.arraySync()
    # 获取这些样本的标签
    k_nearest_labels = tf.gather(y_train_tensor, top_k_indices).arraySync()
    # 统计标签频率
    label_counts = {}
    for label in k_nearest_labels:
        label = int(label)  # 确保标签是整数
        if label in label_counts:
            label_counts[label] += 1
        else:
            label_counts[label] = 1
    # 找出出现最多的标签
    predicted_label = max(label_counts.items(), key=lambda x: x[1])[0]
    y_pred.append(int(predicted_label))
# 调用保存函数
save_csv_results(output_file, id_column, y_pred, data_type, idx_to_class if data_type == "image" else None)`;
    }
}