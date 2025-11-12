import * as TmpBlockly from 'blockly'
import { addLossBlocksV2 } from './Loss';
import type { CodeGenerator } from "blockly/core/generator"
import { type PyodideGenerator } from "../PyodideGenerator";
import { Order } from 'blockly/python'

const FC_IMAGE_COLOR = 225;
const LAYER_COLOR = 260;

export function addFCImageClassificationBlocks(
  blocks: typeof TmpBlockly.Blocks, 
  pythonGenerator: PyodideGenerator, 
  Blockly: typeof TmpBlockly, 
  content: any
) {
    addLossBlocksV2(blocks, pythonGenerator, Blockly, content);
    
  // 训练数据集选择积木
  Blockly.defineBlocksWithJsonArray([{
    "type": "fc_set_train_dataset_img",
    "tooltip": "",
    "helpUrl": "",
    "message0": "（分类）选择训练数据集（图像） %1",
    "args0": [
      {
        "type": "input_dummy",
        "name": "dataset"
      }
    ],
    "nextStatement": null,
    "colour": FC_IMAGE_COLOR
  }]);

  pythonGenerator.forBlock['fc_set_train_dataset_img'] = function (block) {
    pythonGenerator.addPyodidePreRunCode('fc_image_utils', `
import os
import glob
import numpy as np
import pandas as pd
from PIL import Image
from js import tf
from pyodide.ffi import to_js, create_proxy
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, roc_curve, log_loss
import json

# 全局存储持久化代理，避免自动销毁
fc_training_proxies = []

def create_fc_persistent_proxy(func):
    """创建持久化代理"""
    proxy = create_proxy(func)
    fc_training_proxies.append(proxy)
    return proxy

def cleanup_fc_proxies():
    """清理代理资源"""
    for proxy in fc_training_proxies:
        try:
            proxy.destroy()
        except:
            pass
    fc_training_proxies.clear()

def fc_load_and_process_train_data(train_dir):
    if not os.path.exists(train_dir):
        raise Exception(f"训练图像目录 {train_dir} 不存在")
    class_dirs = [d for d in os.listdir(train_dir) if os.path.isdir(os.path.join(train_dir, d))]
    if not class_dirs:
        raise Exception(f"在 {train_dir} 中没有找到任何类别文件夹")
    print(f"找到以下类别: {class_dirs}")
    class_to_idx = {class_name: i for i, class_name in enumerate(class_dirs)}
    idx_to_class = {i: class_name for class_name, i in class_to_idx.items()}
    num_classes = len(class_dirs)
    print(f"共有 {num_classes} 个分类")
    
    # 收集所有图像路径和标签
    image_paths = []
    labels = []
    for class_name in class_dirs:
        class_dir = os.path.join(train_dir, class_name)
        class_idx = class_to_idx[class_name]
        for img_ext in ['*.jpg', '*.jpeg', '*.png']:
            class_images = glob.glob(os.path.join(class_dir, img_ext))
            for img_path in class_images:
                image_paths.append(img_path)
                labels.append(class_idx)
        print(f"类别 '{class_name}' (索引 {class_idx}): 找到 {len([p for p in image_paths if labels[image_paths.index(p)] == class_idx])} 张图片")
    
    return image_paths, labels, class_to_idx, idx_to_class, num_classes

def fc_get_sample_image_info(train_dir, class_dirs):
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
    img = Image.open(sample_image_path)
    img_width, img_height = img.size
    print(f"图像尺寸: {img_width}x{img_height}, 将调整为64x64（全连接网络使用较小尺寸）")
    return 64, 64

def fc_preprocess_image(img_path, img_width, img_height):
    img = Image.open(img_path).convert('RGB')
    img = img.resize((img_width, img_height))
    img_array = np.array(img) / 255.0
    return img_array

def calculate_classification_metrics(y_true, y_pred, y_pred_proba, num_classes):
    """计算分类任务的核心指标"""
    metrics = {}
    
    # 准确率
    metrics['accuracy'] = accuracy_score(y_true, y_pred)
    
    # 处理二分类和多分类的指标计算
    average = 'binary' if num_classes == 2 else 'weighted'
    
    # 精确率、召回率、F1-Score
    metrics['precision'] = precision_score(y_true, y_pred, average=average, zero_division=0)
    metrics['recall'] = recall_score(y_true, y_pred, average=average, zero_division=0)
    metrics['f1_score'] = f1_score(y_true, y_pred, average=average, zero_division=0)
    
    # AUC 和 ROC（仅支持二分类或多分类one-vs-rest）
    if num_classes == 2:
        # 二分类：直接使用正类概率
        if y_pred_proba.ndim == 2:
            pos_proba = y_pred_proba[:, 1]
        else:
            pos_proba = y_pred_proba
        metrics['auc'] = roc_auc_score(y_true, pos_proba)
        
        # ROC曲线：返回阈值和对应的TPR、FPR（仅输出关键信息）
        fpr, tpr, thresholds = roc_curve(y_true, pos_proba)
        metrics['roc'] = {
            'fpr': fpr.tolist()[:10],  # 只取前10个点避免输出过长
            'tpr': tpr.tolist()[:10],
            'thresholds': thresholds.tolist()[:10],
            'note': f'共 {len(fpr)} 个点，此处仅展示前10个'
        }
    else:
        # 多分类：使用one-vs-rest策略计算AUC
        metrics['auc'] = roc_auc_score(y_true, y_pred_proba, multi_class='ovr', average=average)
        metrics['roc'] = {'note': '多分类ROC曲线未单独输出，AUC已采用one-vs-rest策略计算'}
    
    return metrics

def print_metrics(metrics):
    """格式化输出指标"""
    print("\\n===== 模型分类性能指标 =====")
    print(f"准确率 (Accuracy): {metrics['accuracy']:.4f}")
    print(f"精确率 (Precision): {metrics['precision']:.4f}")
    print(f"召回率 (Recall): {metrics['recall']:.4f}")
    print(f"F1-Score: {metrics['f1_score']:.4f}")
    print(f"AUC: {metrics['auc']:.4f}")
    print(f"ROC 关键信息: {metrics['roc']['note']}")
    if 'fpr' in metrics['roc']:
        print(f"  - FPR前10个点: {[round(x,4) for x in metrics['roc']['fpr']]}")
        print(f"  - TPR前10个点: {[round(x,4) for x in metrics['roc']['tpr']]}")
    print("==========================\\n")
`);

    let ret = `
import os
import glob
import numpy as np
import pandas as pd
from PIL import Image
from js import tf
from pyodide.ffi import to_js, create_proxy
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, roc_curve, log_loss
import json

# 指定训练数据集目录
train_dir = "/data/mount/fcnn/train_images"

# 加载和处理训练数据
image_paths, labels, class_to_idx, idx_to_class, num_classes = fc_load_and_process_train_data(train_dir)

# 获取图像尺寸信息
img_width, img_height = fc_get_sample_image_info(train_dir, list(class_to_idx.keys()))

# 预处理所有训练图像
print("开始预处理训练图像...")
X_train = []
for img_path in image_paths:
    img_array = fc_preprocess_image(img_path, img_width, img_height)
    flattened_img = img_array.flatten()
    X_train.append(flattened_img)

X_train = np.array(X_train)
y_train = np.array(labels)

y_train_onehot = np.zeros((len(y_train), num_classes))
for i, label_idx in enumerate(y_train):
    y_train_onehot[i, label_idx] = 1

print(f"训练数据形状: {X_train.shape}")
print(f"训练标签形状（One-Hot）: {y_train_onehot.shape}")

# 转换为张量（使用持久化代理策略）
X_train_tensor = tf.tensor(to_js(X_train.tolist()))
y_train_tensor = tf.tensor(to_js(y_train_onehot.tolist()))

# 设置输入形状
input_shape = [img_width * img_height * 3]

# 创建输出目录
output_dir = "/data/mount/fcnn/output"
os.makedirs(output_dir, exist_ok=True)

print(f"输入特征维度: {input_shape}")
print(f"类别数量: {num_classes}")
`;
    return ret;
  };

  // 测试数据集选择积木
  Blockly.defineBlocksWithJsonArray([{
  "type": "fc_set_test_dataset_img",
  "tooltip": "",
  "helpUrl": "",
  "message0": "（分类）选择测试数据集（图像） %1",
  "args0": [
    {
      "type": "input_dummy",
      "name": "dataset"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": FC_IMAGE_COLOR
}]);

pythonGenerator.forBlock['fc_set_test_dataset_img'] = function (block) {
  pythonGenerator.addPyodidePreRunCode('fc_test_utils', `
def fc_prepare_test_data(test_dir, class_dirs, img_width, img_height):
    if not os.path.exists(test_dir):
        raise Exception(f"测试图像目录 {test_dir} 不存在")
    test_has_subdirs = len([d for d in os.listdir(test_dir) if os.path.isdir(os.path.join(test_dir, d))]) > 0
    print("测试数据集有分类子目录结构" if test_has_subdirs else "测试数据集使用单一目录结构，将使用预测模式")
    return test_has_subdirs

def fc_collect_test_data(test_dir, class_dirs, img_width, img_height, test_has_subdirs):
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
                        img_array = fc_preprocess_image(img_path, img_width, img_height)
                        flattened_img = img_array.flatten()
                        test_images.append(flattened_img)
                        test_labels.append(class_name)
                        test_label_indices.append(class_idx)
                        test_filenames.append(os.path.join(class_name, os.path.basename(img_path)))
    else:
        for ext in ['*.jpg', '*.jpeg', '*.png']:
            for img_path in glob.glob(os.path.join(test_dir, ext)):
                img_array = fc_preprocess_image(img_path, img_width, img_height)
                flattened_img = img_array.flatten()
                test_images.append(flattened_img)
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

# 全局变量存储测试数据
fc_test_data = None

def fc_initialize_test_data():
    """初始化测试数据（仅在需要时调用）"""
    global fc_test_data
    if fc_test_data is None:
        print("开始加载测试数据...")
        test_dir = "/data/mount/fcnn/test_images"
        test_has_subdirs = fc_prepare_test_data(test_dir, list(class_to_idx.keys()), img_width, img_height)
        
        fc_test_data = fc_collect_test_data(
            test_dir, list(class_to_idx.keys()), img_width, img_height, test_has_subdirs
        )
        print(f"测试数据加载完成，形状: {fc_test_data[4]}")
    return fc_test_data
`);

  return `
# 仅设置测试数据路径，不立即加载数据
test_dir = "/data/mount/fcnn/test_images"
print("测试数据集路径已设置，将在评估或预测时加载")
`;
};

  // 模型定义积木
  Blockly.defineBlocksWithJsonArray([{
    "type": "fc_create_model_img",
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
    "colour": FC_IMAGE_COLOR
  }]);

  pythonGenerator.forBlock['fc_create_model_img'] = function (block) {
    let layersCode = pythonGenerator.statementToCode(block, 'layers');
    layersCode = layersCode.replace(/^\s+/gm, '');

    const lossCode = pythonGenerator.statementToCode(block, 'loss').trim();
    const batchSize = pythonGenerator.valueToCode(block, 'batch', Order.ATOMIC) || '32';
    const epochs = pythonGenerator.valueToCode(block, 'epoch', Order.ATOMIC) || '10';

    const actualLoss = lossCode || "'categoricalCrossentropy'";

    return `
# 创建全连接分类模型
model = tf.sequential()
layer_defs = []

# 添加输入层信息
layer_defs.append(f"输入层: {input_shape[0]} 单元 (展平图像)")

${layersCode}

# 编译模型（移除to_js，直接使用字符串数组）
model.compile(
    optimizer='adam',
    loss=${actualLoss},
    metrics=['accuracy']
)

# 设置训练参数
batch_size = int(${batchSize})
epochs = int(${epochs})

# 打印模型摘要
print("全连接神经网络模型结构:")
for i, layer in enumerate(layer_defs):
    print(f"  第{i+1}层: {layer}")

print("开始编译模型...")
`;
};

  // 全连接层积木
  Blockly.defineBlocksWithJsonArray([{
    "type": "fc_dense_layer_img",
    "message0": "全连接层 神经元个数为 %1 激活函数 %2",
    "args0": [
      {
        "type": "input_value",
        "name": "units",
        "check": "Number"
      },
      {
        "type": "input_value",
        "name": "activation",
        "align": "RIGHT"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": LAYER_COLOR
  }]);

  pythonGenerator.forBlock['fc_dense_layer_img'] = function(block) {
    const units = pythonGenerator.valueToCode(block, 'units', Order.ATOMIC) || '256';
    const activation = pythonGenerator.valueToCode(block, 'activation', Order.ATOMIC);
    
    let actualActivation;
    if (!activation || activation === '""' || activation === "''") {
        actualActivation = 'None';
    } else if (activation === 'none') {
        actualActivation = 'None';
    } else {
        actualActivation = activation.replace(/['"]/g, '');
        actualActivation = `'${actualActivation}'`;
    }
    
    const previousBlock = block.previousConnection.targetBlock();
    const isFirstLayer = !previousBlock || previousBlock.type === 'fc_create_model_img';
    
    if (isFirstLayer) {
        return `layer_defs.append(f"全连接层: ${units} 单元, 激活: ${actualActivation}, 输入形状: {input_shape}")
model.add(tf.layers.dense(
    units=${units},
    activation=${actualActivation},
    inputShape=input_shape
))\n`;
    } else {
        return `layer_defs.append(f"全连接层: ${units} 单元, 激活: ${actualActivation}")
model.add(tf.layers.dense(
    units=${units},
    activation=${actualActivation}
))\n`;
    }
};

  // 训练模型积木 - 修正回调函数生命周期问题
  Blockly.defineBlocksWithJsonArray([{
    "type": "fc_train_model_img",
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
    "colour": FC_IMAGE_COLOR
  }]);

  pythonGenerator.forBlock['fc_train_model_img'] = function (block) {
  pythonGenerator.addPyodidePreRunCode('fc_train_utils', `
def fc_create_training_callbacks(epochs):
    """创建训练回调函数，使用持久化代理"""
    def on_epoch_end(epoch, logs):
        try:
            # 将日志对象转换为Python字典
            logs_dict = dict(logs)
            train_loss = logs_dict.get('loss', None)
            train_acc = logs_dict.get('acc', None)
            val_loss = logs_dict.get('val_loss', None)
            val_acc = logs_dict.get('val_acc', None)
            
            # 转换为浮点数
            train_loss = float(train_loss) if train_loss is not None else None
            train_acc = float(train_acc) if train_acc is not None else None
            val_loss = float(val_loss) if val_loss is not None else None
            val_acc = float(val_acc) if val_acc is not None else None
            
            print(f"Epoch {epoch+1}/{epochs} - "
                  f"loss: {train_loss:.4f if train_loss else 'N/A'} "
                  f"- acc: {train_acc:.4f if train_acc else 'N/A'} "
                  f"- val_loss: {val_loss:.4f if val_loss else 'N/A'} "
                  f"- val_acc: {val_acc:.4f if val_acc else 'N/A'}")
        except Exception as e:
            print(f"在收集训练历史时出现问题: {e}")
    
    # 创建持久化代理
    return create_fc_persistent_proxy(on_epoch_end)

def fc_save_model_config(model_config, output_dir):
    model_save_path = os.path.join(output_dir, "fcn_model.json")
    with open(model_save_path, "w") as f:
        json.dump(model_config, f, indent=2)
    print(f"模型配置已保存至: {model_save_path}")
`);

  return `
# 开始训练全连接神经网络模型
try:
    # 创建回调函数 - 使用持久化代理
    on_epoch_end = fc_create_training_callbacks(epochs)
    
    # 使用持久化代理创建回调
    callbacks = {'onEpochEnd': on_epoch_end}

    # 训练模型 - 仅使用训练数据和验证分割
    print(f"开始训练模型，共 {epochs} 个epochs，批次大小: {batch_size}")
    
    fit_params = {
        'x': X_train_tensor,
        'y': y_train_tensor,
        'epochs': epochs,
        'batchSize': batch_size,
        'callbacks': callbacks,
        'validationSplit': 0.2
    }

    history = model.fit(fit_params)
    print("全连接神经网络模型训练完成")

    # 保存模型配置
    model_config = {
        'layers': layer_defs,
        'num_classes': num_classes,
        'input_shape': input_shape
    }
    fc_save_model_config(model_config, output_dir)

except Exception as e:
    print(f"全连接神经网络模型训练过程中出错: {e}")
    raise e
`;
};

  // 合并评估和预测积木
  Blockly.defineBlocksWithJsonArray([{
"type": "fc_evaluate_and_predict_img",
"tooltip": "评估模型性能并输出预测结果",
"helpUrl": "",
"message0": "（分类）评估模型并输出预测结果 %1",
"args0": [
  {
    "type": "input_end_row",
    "name": "NAME"
  }
],
"previousStatement": null,
"colour": FC_IMAGE_COLOR
}]);

pythonGenerator.forBlock['fc_evaluate_and_predict_img'] = function (block) {
pythonGenerator.addPyodidePreRunCode('fc_eval_predict_utils', `
def fc_save_predictions(predictions, test_filenames, idx_to_class, test_has_subdirs, test_label_indices, output_dir):
    predicted_classes = np.argmax(predictions, axis=1)
    predicted_probs = np.max(predictions, axis=1)
    
    if test_has_subdirs and test_label_indices is not None:
        results_df = pd.DataFrame({
            'Filename': test_filenames,
            'TrueClass': [idx_to_class[i] for i in test_label_indices],
            'PredictedClass': [idx_to_class[i] for i in predicted_classes],
            'Confidence': predicted_probs,
            'Correct': [test_label_indices[i] == predicted_classes[i] for i in range(len(predicted_classes))]
        })
        
        # 计算准确率
        accuracy = np.mean(results_df['Correct'])
        print(f"预测准确率: {accuracy:.4f}")
        
        # 计算其他简单指标
        from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
        y_true = test_label_indices
        y_pred = predicted_classes
        
        accuracy_simple = accuracy_score(y_true, y_pred)
        precision_simple = precision_score(y_true, y_pred, average='weighted', zero_division=0)
        recall_simple = recall_score(y_true, y_pred, average='weighted', zero_division=0)
        f1_simple = f1_score(y_true, y_pred, average='weighted', zero_division=0)
        
        print(f"简单评估指标:")
        print(f"  准确率: {accuracy_simple:.4f}")
        print(f"  精确率: {precision_simple:.4f}")
        print(f"  召回率: {recall_simple:.4f}")
        print(f"  F1-Score: {f1_simple:.4f}")
        
        # 保存简单指标
        simple_metrics = {
            'accuracy': float(accuracy_simple),
            'precision': float(precision_simple),
            'recall': float(recall_simple),
            'f1_score': float(f1_simple)
        }
        
        metrics_path = os.path.join(output_dir, "simple_metrics.json")
        with open(metrics_path, "w") as f:
            json.dump(simple_metrics, f, indent=2)
        print(f"简单指标已保存至: {metrics_path}")
        
    else:
        results_df = pd.DataFrame({
            'Filename': test_filenames,
            'PredictedClass': [idx_to_class[i] for i in predicted_classes],
            'Confidence': predicted_probs
        })
    
    results_path = os.path.join(output_dir, 'fcnn_predictions.csv')
    results_df.to_csv(results_path, index=False)
    print(f"全连接神经网络预测结果已保存至: {results_path}")
    print("预测结果示例:")
    print(results_df.head(10))  # 只显示前10行
    
    return results_df

def fc_perform_simple_evaluation(model, test_images_tensor, test_labels_tensor, test_label_indices, test_filenames, idx_to_class, num_classes, output_dir):
    """执行简化的模型评估和预测，避免复杂的回调函数"""
    results = {}
    
    # 检查是否有标签用于评估
    has_labels = test_labels_tensor is not None and test_label_indices is not None
    
    print("=== 开始模型预测 ===")
    # 直接进行预测，避免使用evaluate方法
    predictions_proba = model.predict(test_images_tensor).arraySync()
    predictions = np.argmax(predictions_proba, axis=1)
    
    if has_labels:
        print("测试数据集包含标签，进行简单评估...")
        y_true = test_label_indices
        
        # 计算简单准确率
        correct_predictions = np.sum(predictions == y_true)
        total_predictions = len(y_true)
        accuracy = correct_predictions / total_predictions
        
        print(f"测试准确率: {accuracy:.4f} ({correct_predictions}/{total_predictions})")
        
        results['test_accuracy'] = accuracy
        results['correct_predictions'] = int(correct_predictions)
        results['total_predictions'] = int(total_predictions)
    
    print("=== 开始生成预测结果 ===")
    # 保存预测结果
    test_has_subdirs = has_labels
    predictions_df = fc_save_predictions(
        predictions_proba, test_filenames, idx_to_class, 
        test_has_subdirs, test_label_indices if has_labels else None, output_dir
    )
    
    results['predictions'] = predictions_df
    return results
`);

return `
# 执行简化的模型评估和预测
try:
    print("开始全连接神经网络模型评估和预测...")
    
    # 在评估时加载测试数据
    test_images_tensor, test_labels_tensor, test_label_indices, test_filenames, test_shape = fc_initialize_test_data()
    
    # 执行简化评估和预测
    evaluation_results = fc_perform_simple_evaluation(
        model, test_images_tensor, test_labels_tensor, test_label_indices, 
        test_filenames, idx_to_class, num_classes, output_dir
    )
    
    print("全连接神经网络模型评估和预测完成")

except Exception as e:
    print(f"全连接神经网络模型评估和预测时出错: {e}")
    raise
`;
}
}