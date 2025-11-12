import * as TmpBlockly from 'blockly'
import type { BlockDefinition } from "blockly/core/blocks"
import type { CodeGenerator } from "blockly/core/generator"
import { Order } from 'blockly/python'
import { addLayerBlocksV2 } from './Layer'
import { addLossBlocksV2 } from './Loss'
import { addRegressionBlocksV2 } from './Regression'

const CNN_COLOR = 225;

export function addCNNBlocksV2(blocks: typeof TmpBlockly.Blocks, pythonGenerator: CodeGenerator, Blockly: typeof TmpBlockly, content: any) {
    // Add other block definitions
    addLayerBlocksV2(blocks, pythonGenerator, Blockly, content);
    addLossBlocksV2(blocks, pythonGenerator, Blockly, content);
    addRegressionBlocksV2(blocks, pythonGenerator, Blockly, content);

    // CNN Image Dataset blocks
    Blockly.defineBlocksWithJsonArray([{
        "type": "set_train_dataset_img",
        "tooltip": "",
        "helpUrl": "",
        "message0": "（分类）选择训练数据集（图像） %1",
        "args0": [
            {
                "type": "input_statement",
                "name": "dataset"
            }
        ],
        "nextStatement": null,
        "colour": CNN_COLOR
    }]);

    pythonGenerator.forBlock['set_train_dataset_img'] = function (block) {
        pythonGenerator.addPyodidePreRunCode('cnn_utils', `
import os
import glob
import numpy as np
import pandas as pd
from PIL import Image
from js import tf
import matplotlib.pyplot as plt
from pyodide.ffi import to_js, create_proxy
from sklearn.metrics import mean_squared_error, r2_score, log_loss
import json

def load_and_process_train_data(train_dir):
    # 检查目录是否存在
    if not os.path.exists(train_dir):
        raise Exception(f"训练图像目录 {train_dir} 不存在")
    # 获取所有子目录（类别）
    class_dirs = [d for d in os.listdir(train_dir) if os.path.isdir(os.path.join(train_dir, d))]
    if not class_dirs:
        raise Exception(f"在 {train_dir} 中没有找到任何类别文件夹")
    print(f"找到以下类别: {class_dirs}")
    # 创建类别映射
    class_to_idx = {class_name: i for i, class_name in enumerate(class_dirs)}
    idx_to_class = {i: class_name for class_name, i in class_to_idx.items()}
    num_classes = len(class_dirs)
    print(f"共有 {num_classes} 个分类")
    return class_dirs, class_to_idx, idx_to_class, num_classes

def get_sample_image_info(train_dir, class_dirs):
    # 查找示例图像以确定尺寸
    sample_found = False
    for class_name in class_dirs:
        class_dir = os.path.join(train_dir, class_name)
        for ext in ['*.jpg', '*.jpeg', '*.png']:
            sample_files = glob.glob(os.path.join(class_dir, ext))
            if sample_files:
                sample_image_path = sample_files[0]
                sample_found = True
                break
        if sample_found:
            break
    if not sample_found:
        raise Exception("无法找到样本图像以确定尺寸")
    # 加载样本图像确定尺寸
    img = Image.open(sample_image_path)
    img_width, img_height = img.size
    print(f"图像尺寸: {img_width}x{img_height}, 将调整为224x224")
    return 224, 224
`);

        let ret = `
import os
import glob
import numpy as np
import pandas as pd
from PIL import Image
from js import tf
import matplotlib.pyplot as plt
from pyodide.ffi import to_js, create_proxy
from sklearn.metrics import mean_squared_error, r2_score, log_loss
import json

# 指定训练数据集目录
train_dir = "/data/mount/cnn/train_images"

# 加载和处理训练数据
class_dirs, class_to_idx, idx_to_class, num_classes = load_and_process_train_data(train_dir)

# 获取图像尺寸信息
img_width, img_height = get_sample_image_info(train_dir, class_dirs)

# 创建输出目录
output_dir = "/data/mount/cnn/output"
os.makedirs(output_dir, exist_ok=True)

# 设置数据增强参数
train_data_augmentation = {
    'rescale': 1./255,
    'rotation_range': 40,
    'width_shift_range': 0.2,
    'height_shift_range': 0.2,
    'shear_range': 0.2,
    'zoom_range': 0.2,
    'horizontal_flip': True,
    'fill_mode': 'nearest'
}`;
        return ret;
    };

    // Test dataset block
    Blockly.defineBlocksWithJsonArray([{
        "type": "set_test_dataset_img",
        "tooltip": "",
        "helpUrl": "",
        "message0": "（分类）选择测试数据集（图像） %1",
        "args0": [
            {
                "type": "input_statement",
                "name": "dataset"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": CNN_COLOR
    }]);

    pythonGenerator.forBlock['set_test_dataset_img'] = function (block) {
        pythonGenerator.addPyodidePreRunCode('cnn_test_utils', `
def prepare_test_data(test_dir, train_dir, class_dirs, img_width, img_height):
    if not os.path.exists(test_dir):
        raise Exception(f"测试图像目录 {test_dir} 不存在")

    # 检查是否有类别文件夹
    test_has_subdirs = len([d for d in os.listdir(test_dir) if os.path.isdir(os.path.join(test_dir, d))]) > 0
    print("测试数据集有分类子目录结构" if test_has_subdirs else "测试数据集使用单一目录结构，将使用预测模式")

    # 收集训练图像信息
    train_images = []
    train_labels = []
    train_label_indices = []

    for class_idx, class_name in enumerate(class_dirs):
        class_dir = os.path.join(train_dir, class_name)
        for ext in ['*.jpg', '*.jpeg', '*.png']:
            for img_path in glob.glob(os.path.join(class_dir, ext)):
                img = Image.open(img_path).convert('RGB')
                img = img.resize((img_width, img_height))
                img_array = np.array(img) / 255.0
                train_images.append(img_array)
                train_labels.append(class_name)
                train_label_indices.append(class_idx)

    # 转换为numpy数组
    train_images = np.array(train_images)
    train_label_indices = np.array(train_label_indices)

    # 创建one-hot编码的标签
    train_labels_onehot = np.zeros((len(train_label_indices), len(class_dirs)))
    for i, label_idx in enumerate(train_label_indices):
        train_labels_onehot[i, label_idx] = 1

    # 转换为tf.js兼容的格式并创建张量
    train_images_tensor = tf.tensor(to_js(train_images.tolist()))
    train_labels_tensor = tf.tensor(to_js(train_labels_onehot.tolist()))
    print("成功创建训练数据和标签张量")

    return test_has_subdirs, train_images_tensor, train_labels_tensor, train_images.shape

def collect_test_data(test_dir, class_dirs, img_width, img_height, test_has_subdirs):
    test_images = []
    test_labels = []
    test_label_indices = []
    test_filenames = []
    
    if test_has_subdirs:
        for class_idx, class_name in enumerate(class_dirs):
            class_dir = os.path.join(test_dir, class_name)
            if os.path.exists(class_dir):
                for ext in ['*.jpg', '*.jpeg', '*.png']:
                    for img_path in glob.glob(os.path.join(class_dir, ext)):
                        img = Image.open(img_path).convert('RGB')
                        img = img.resize((img_width, img_height))
                        img_array = np.array(img) / 255.0
                        test_images.append(img_array)
                        test_labels.append(class_name)
                        test_label_indices.append(class_idx)
                        test_filenames.append(os.path.join(class_name, os.path.basename(img_path)))
    else:
        for ext in ['*.jpg', '*.jpeg', '*.png']:
            for img_path in glob.glob(os.path.join(test_dir, ext)):
                img = Image.open(img_path).convert('RGB')
                img = img.resize((img_width, img_height))
                img_array = np.array(img) / 255.0
                test_images.append(img_array)
                test_filenames.append(os.path.basename(img_path))

    test_images = np.array(test_images)
    test_images_tensor = tf.tensor(to_js(test_images.tolist()))
    
    if test_has_subdirs:
        test_label_indices = np.array(test_label_indices)
        test_labels_onehot = np.zeros((len(test_label_indices), len(class_dirs)))
        for i, label_idx in enumerate(test_label_indices):
            test_labels_onehot[i, label_idx] = 1
        test_labels_tensor = tf.tensor(to_js(test_labels_onehot.tolist()))
    else:
        test_labels_tensor = None
        test_label_indices = None

    return test_images_tensor, test_labels_tensor, test_label_indices, test_filenames, test_images.shape
`);

        return `
# 指定测试数据集目录
test_dir = "/data/mount/cnn/test_images"

# 准备测试数据
test_has_subdirs, train_images_tensor, train_labels_tensor, train_shape = prepare_test_data(test_dir, train_dir, class_dirs, img_width, img_height)

# 收集测试数据
test_images_tensor, test_labels_tensor, test_label_indices, test_filenames, test_shape = collect_test_data(test_dir, class_dirs, img_width, img_height, test_has_subdirs)

print(f"训练数据形状: {train_shape}")
print(f"测试数据形状: {test_shape}")

# 定义测试数据生成器的参数
test_data_augmentation = {'rescale': 1./255}`;
    };

    // Create model block
    Blockly.defineBlocksWithJsonArray([{
        "type": "create_model_img",
        "message0": "定义模型 %1 损失函数 %2 batch %3 epochs %4",
        "args0": [
            {
                "type": "input_statement",
                "name": "layers"
            },
            {
                "type": "input_statement",
                "name": "loss",
                "check": "String"
            },
            {
                "type": "input_value",
                "name": "batch",
                "check": "Number"
            },
            {
                "type": "input_value",
                "name": "epoch",
                "check": "Number"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": CNN_COLOR
    }]);

    pythonGenerator.forBlock['create_model_img'] = function (block) {
        let layersCode = pythonGenerator.statementToCode(block, 'layers');
        layersCode = layersCode.replace(/^\s+/gm, '');

        const lossCode = pythonGenerator.statementToCode(block, 'loss').trim();
        const batchSize = pythonGenerator.valueToCode(block, 'batch', Order.ATOMIC) || '32';
        const epochs = pythonGenerator.valueToCode(block, 'epoch', Order.ATOMIC) || '10';

        return `
# 创建模型
model = tf.sequential()
layer_defs = []

${layersCode}

# 编译模型
model.compile(
    optimizer='adam',
    loss=${lossCode},
)

# 设置训练参数
batch_size = int(${batchSize})
epochs = int(${epochs})

# 打印模型摘要
print("模型结构:")
for i, layer in enumerate(layer_defs):
    print(f"  第{i+1}层: {layer}")`;
    };

    // Train model block
    Blockly.defineBlocksWithJsonArray([{
        "type": "train_model_img",
        "tooltip": "",
        "helpUrl": "",
        "message0": "（分类）训练模型（图像） %1",
        "args0": [
            {
                "type": "input_end_row",
                "name": "NAME"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": CNN_COLOR
    }]);

    pythonGenerator.forBlock['train_model_img'] = function (block) {
        pythonGenerator.addPyodidePreRunCode('cnn_train_utils', `
def create_training_callbacks(epochs):
    train_loss_history = []
    train_acc_history = []
    val_loss_history = []
    val_acc_history = []
    
    def on_epoch_end(epoch, logs):
        try:
            train_loss = float(logs['loss']) if 'loss' in logs else None
            train_acc = float(logs['acc']) if 'acc' in logs else None
            val_loss = float(logs['val_loss']) if 'val_loss' in logs else None
            val_acc = float(logs['val_acc']) if 'val_acc' in logs else None
            
            if train_loss is not None: train_loss_history.append(train_loss)
            if train_acc is not None: train_acc_history.append(train_acc)
            if val_loss is not None: val_loss_history.append(val_loss)
            if val_acc is not None: val_acc_history.append(val_acc)
            
            print(f"Epoch {epoch+1}/{epochs} - "
                  f"loss: {train_loss:.4f if train_loss else 'N/A'} "
                  f"- acc: {train_acc:.4f if train_acc else 'N/A'} "
                  f"- val_loss: {val_loss:.4f if val_loss else 'N/A'} "
                  f"- val_acc: {val_acc:.4f if val_acc else 'N/A'}")
        except Exception as e:
            print(f"在收集训练历史时出现问题: {e}")
            print(f"logs对象: {logs}")
    
    return on_epoch_end, train_loss_history, train_acc_history

def plot_training_history(train_loss_history, train_acc_history, output_dir):
    # 确保输出目录存在
    os.makedirs(output_dir, exist_ok=True)
    
    # 在Pyodide环境中使用matplotlib
    import matplotlib.pyplot as plt
    plt.switch_backend('agg')  # 使用非交互式后端
    
    # 绘制损失曲线
    plt.figure(figsize=(10, 6))
    plt.plot(range(1, len(train_loss_history) + 1), train_loss_history, 'b-', label='Training Loss')
    plt.title('Model Loss')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.grid(True)
    plt.legend()
    plt.savefig(os.path.join(output_dir, "cnn_loss_history.png"))
    plt.clf()  # 清除当前图形
    plt.close('all')  # 关闭所有图形
    
    # 绘制准确率曲线
    plt.figure(figsize=(10, 6))
    plt.plot(range(1, len(train_acc_history) + 1), train_acc_history, 'b-', label='Training Accuracy')
    plt.title('Model Accuracy')
    plt.xlabel('Epoch')
    plt.ylabel('Accuracy')
    plt.grid(True)
    plt.legend()
    plt.savefig(os.path.join(output_dir, "cnn_accuracy_history.png"))
    plt.clf()  # 清除当前图形
    plt.close('all')  # 关闭所有图形

def save_model_config(model_config, output_dir):
    model_save_path = os.path.join(output_dir, "cnn_model.json")
    with open(model_save_path, "w") as f:
        json.dump(model_config, f, indent=2)
    print(f"模型配置已保存至: {model_save_path}")
`);

        return `
# 开始训练模型
try:
    # 创建回调函数
    on_epoch_end, train_loss_history, train_acc_history = create_training_callbacks(epochs)
    callback = create_proxy(on_epoch_end)
    callbacks = {'onEpochEnd': callback}

    # 训练模型
    fit_params = {
        'x': train_images_tensor,
        'y': train_labels_tensor,
        'epochs': epochs,
        'batchSize': batch_size,
        'callbacks': callbacks
    }

    if test_has_subdirs:
        fit_params['validationData'] = [test_images_tensor, test_labels_tensor]
    else:
        fit_params['validationSplit'] = 0.2

    history = model.fit(fit_params)
    print("模型训练完成")

    # 绘制训练历史
    plot_training_history(train_loss_history, train_acc_history, output_dir)

    # 保存模型配置
    model_config = {
        'layers': layer_defs,
        'num_classes': num_classes,
        'input_shape': [img_height, img_width, 3]
    }
    save_model_config(model_config, output_dir)

except Exception as e:
    print(f"模型训练过程中出错: {e}")
    raise e`;
    };

    // Use model block
    // Use model block - 简化版本，只输出四个核心指标
Blockly.defineBlocksWithJsonArray([{
    "type": "use_model_img",
    "tooltip": "",
    "helpUrl": "",
    "message0": "（分类）测试模型并输出结果 %1",
    "args0": [
        {
            "type": "input_end_row",
            "name": "test_dataset"
        }
    ],
    "previousStatement": null,
    "colour": CNN_COLOR
}]);

pythonGenerator.forBlock['use_model_img'] = function (block) {
    pythonGenerator.addPyodidePreRunCode('cnn_predict_utils', `
def calculate_simple_metrics(y_true, y_pred):
    """只计算四个核心指标：准确率、精确率、召回率、F1-Score"""
    from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
    import json
    
    metrics = {}
    
    # 准确率
    metrics['accuracy'] = accuracy_score(y_true, y_pred)
    
    # 处理二分类和多分类的指标计算
    average = 'binary' if len(np.unique(y_true)) == 2 else 'weighted'
    
    # 精确率、召回率、F1-Score
    metrics['precision'] = precision_score(y_true, y_pred, average=average, zero_division=0)
    metrics['recall'] = recall_score(y_true, y_pred, average=average, zero_division=0)
    metrics['f1_score'] = f1_score(y_true, y_pred, average=average, zero_division=0)
    
    return metrics

def print_simple_metrics(metrics):
    """只输出四个核心指标"""
    print("\\n===== CNN模型性能指标 =====")
    print(f"准确率 (Accuracy): {metrics['accuracy']:.4f}")
    print(f"精确率 (Precision): {metrics['precision']:.4f}")
    print(f"召回率 (Recall): {metrics['recall']:.4f}")
    print(f"F1-Score: {metrics['f1_score']:.4f}")
    print("==========================\\n")

def save_predictions(predictions, test_filenames, idx_to_class, test_has_subdirs, test_label_indices, output_dir):
    predicted_classes = np.argmax(predictions, axis=1)
    
    if test_has_subdirs and test_label_indices is not None:
        results_df = pd.DataFrame({
            'Filename': test_filenames,
            'TrueClass': [idx_to_class[i] for i in test_label_indices],
            'PredictedClass': [idx_to_class[i] for i in predicted_classes]
        })
    else:
        results_df = pd.DataFrame({
            'Filename': test_filenames,
            'PredictedClass': [idx_to_class[i] for i in predicted_classes],
            'Confidence': [np.max(predictions[i]) for i in range(len(predictions))]
        })
    
    results_path = os.path.join(output_dir, 'cnn_predictions.csv')
    results_df.to_csv(results_path, index=False)
    print(f"预测结果已保存至: {results_path}")
`);

    return `
# 测试模型并输出结果
try:
    print("开始评估模型...")
    
    # 获取预测结果
    predictions = model.predict(test_images_tensor).arraySync()
    predicted_classes = np.argmax(predictions, axis=1)
    
    if test_has_subdirs and test_label_indices is not None:
        # 只计算四个核心指标，避免复杂的回调函数
        y_true = test_label_indices
        y_pred = predicted_classes
        
        # 计算指标
        metrics = calculate_simple_metrics(y_true, y_pred)
        
        # 输出指标
        print_simple_metrics(metrics)
        
        # 保存指标到文件
        metrics_path = os.path.join(output_dir, "cnn_simple_metrics.json")
        with open(metrics_path, "w") as f:
            json.dump(metrics, f, indent=2)
        print(f"指标已保存至: {metrics_path}")
    
    # 保存预测结果
    save_predictions(predictions, test_filenames, idx_to_class, test_has_subdirs, test_label_indices, output_dir)

except Exception as e:
    print(f"评估模型时出错: {e}")
    raise e`;
};
}