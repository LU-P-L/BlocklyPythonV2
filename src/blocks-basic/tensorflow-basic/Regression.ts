import * as TmpBlockly from 'blockly'
import type { CodeGenerator } from "blockly/core/generator"
import { type PyodideGenerator } from "../PyodideGenerator";
import { Order } from 'blockly/python'

const REGRESSION_COLOR = 225;

export function addRegressionBlocksV2(blocks: typeof TmpBlockly.Blocks, pythonGenerator: PyodideGenerator, Blockly: typeof TmpBlockly, content: any) {
    // Training dataset block
    Blockly.defineBlocksWithJsonArray([{
        "type": "set_train_dataset",
        "message0": "%1 标签字段为 %2",
        "args0": [
            {
                "type": "field_label_serializable",
                "text": "(回归)选择训练数据集",
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
        "colour": REGRESSION_COLOR
    }]);

    pythonGenerator.forBlock['set_train_dataset'] = function(block,generator) {
        generator.addPyodidePreRunCode('set_train_dataset', `
# 导入必要的库
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, r2_score, log_loss
import os
import glob
import matplotlib.pyplot as plt
from js import tf
from pyodide.ffi import to_js


def load_train_data_from_dir(train_path,label_column):
    if os.path.isdir(train_path):
        # 如果是目录，找到第一个CSV文件
        csv_files = glob.glob(os.path.join(train_path, '*.csv'))
        if csv_files:
            train_path = csv_files[0]
            print(f"使用训练文件: {train_path}")
        else:
            raise FileNotFoundError(f"在{train_path}目录中未找到CSV文件")

    train_data = pd.read_csv(train_path)
    # 保存特征列名，用于后续测试数据对齐 - 排除id列和标签列
    train_features = [col for col in train_data.columns if col != label_column and col != 'id']
    # print(f"训练数据特征: {len(train_features)}个")

    # 从训练数据中移除id列和标签列
    X_train = train_data[train_features].values.astype('float32')
    y_train = train_data[label_column].values.astype('float32')

    # 确保X_train和y_train是正确的形状
    input_shape = [X_train.shape[1]]  # 特征维度
    # print(f"输入特征维度: {input_shape}")

    # Normalize the data
    scaler_X = MinMaxScaler()
    scaler_y = MinMaxScaler()
    X_train_scaled = scaler_X.fit_transform(X_train)
    y_train_scaled = scaler_y.fit_transform(y_train.reshape(-1, 1))

    X_train_tensor = tf.tensor(to_js(X_train_scaled.tolist()))
    y_train_tensor = tf.tensor(to_js(y_train_scaled.tolist()))
    # print("成功创建特征和标签张量")

    print(f"Training data shape: {X_train.shape}")
    print(f"Training labels shape: {y_train.shape}")

    return X_train_tensor,y_train_tensor,scaler_X,scaler_y,train_features,input_shape
        `);


        pythonGenerator.definitions_["imports"] = `
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, r2_score, log_loss
import os
import glob
import matplotlib.pyplot as plt
from js import tf
from pyodide.ffi import to_js`;

        // 移除label中的引号，因为后面会添加引号
        const label = pythonGenerator.valueToCode(block, 'label', Order.ATOMIC).replace(/['"]/g, '') || 'SalePrice';
        
        return `train_path = '/data/mount/regression/train'
X_train_tensor,y_train_tensor,scaler_X,scaler_y,train_features,input_shape = load_train_data_from_dir(train_path, '${label}')`;
    };

    // Test dataset block
    Blockly.defineBlocksWithJsonArray([{
        "type": "set_test_dataset",
        "message0": "%1",
        "args0": [
            {
                "type": "field_label_serializable",
                "text": "(回归)选择测试数据集",
                "name": "NAME"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": REGRESSION_COLOR
    }]);

    pythonGenerator.forBlock['set_test_dataset'] = function(block, generator) {
        generator.addPyodidePreRunCode('set_test_dataset', `
def load_test_data_from_dir(test_path):
    if os.path.isdir(test_path):
        # 如果是目录，找到第一个CSV文件
        csv_files = glob.glob(os.path.join(test_path, '*.csv'))
        if csv_files:
            test_path = csv_files[0]
            print(f"使用测试文件: {test_path}")
        else:
            raise FileNotFoundError(f"在{test_path}目录中未找到CSV文件")

    test_data = pd.read_csv(test_path)

    # 确保测试数据与训练数据具有相同的特征
    # print(f"测试数据原始特征: {len(test_data.columns)-1}个")  # 减去id列
    missing_features = [col for col in train_features if col not in test_data.columns]
    for feature in missing_features:
        test_data[feature] = 0  # 用0填充缺失特征
        print(f"添加缺失的特征: {feature}")

    extra_features = [col for col in test_data.columns if col not in train_features and col != 'id']
    if extra_features:
        print(f"测试数据中的额外特征(将被忽略): {extra_features}")

    # 提取与训练集相同的特征列
    X_test = test_data[train_features].values.astype('float32')
    X_test_scaled = scaler_X.transform(X_test)


    X_test_tensor = tf.tensor(to_js(X_test_scaled.tolist()))
    # print("成功创建测试数据张量")

    print(f"Test data shape: {X_test.shape}")   

    return X_test_tensor, test_data
                    `);
        
        return `
test_path = '/data/mount/regression/test'
X_test_tensor, test_data = load_test_data_from_dir(test_path)
`;
    };

    // Create model block
    Blockly.defineBlocksWithJsonArray([{
        "type": "create_model",
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
        "colour": REGRESSION_COLOR
    }]);

    pythonGenerator.forBlock['create_model'] = function(block) {
        let layersCode = pythonGenerator.statementToCode(block, 'layers');
        layersCode = layersCode.replace(/^\s+/gm, '');
        
        const lossCode = pythonGenerator.statementToCode(block, 'loss').trim();
        const batchSize = pythonGenerator.valueToCode(block, 'batch', Order.ATOMIC) || '32';
        const epochs = pythonGenerator.valueToCode(block, 'epoch', Order.ATOMIC) || '10';

        return `
model = tf.sequential()
# 记录层定义
layer_defs = []
# 添加输入层信息
${layersCode}
# 编译模型
model.compile(
    optimizer='adam',
    loss=${lossCode},
)
# 设置训练参数
batch_size = int(${batchSize})
epochs = int(${epochs})
for i, layer in enumerate(layer_defs):
    print(f"第{i+1}层: {layer}")
`;
    };

    // Train model block
    Blockly.defineBlocksWithJsonArray([{
        "type": "train_model",
        "message0": "（回归）训练模型 %1",
        "args0": [
            {
                "type": "input_end_row",
                "name": "NAME"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": REGRESSION_COLOR
    }]);

    pythonGenerator.forBlock['train_model'] = function(block) {
        return `
print("开始训练模型...")
model_history = model.fit(
    X_train_tensor, y_train_tensor, 
    dict(batchSize=batch_size, epochs=epochs,validationSplit=0.2,verbose=1,)
)
`;
    };

    // Use model block
    Blockly.defineBlocksWithJsonArray([{
        "type": "use_model",
        "message0": "（回归）测试模型并输出结果 %1",
        "args0": [
            {
                "type": "input_end_row",
                "name": "test_dataset"
            }
        ],
        "previousStatement": null,
        "colour": REGRESSION_COLOR
    }]);

    pythonGenerator.forBlock['use_model'] = function(block,generator) {
        generator.addPyodidePreRunCode('use_model', `
def save_csv(predictions_tensor):
    # 创建输出目录
    output_dir = "/data/mount/regression/output"
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, "regression_predictions.csv")
    # 将预测结果转换回Python数组
    predictions_array = np.array(predictions_tensor.arraySync())

    # 逆转归一化
    predictions = scaler_y.inverse_transform(predictions_array)

    # 将预测值四舍五入到两位小数
    predictions = np.round(predictions, decimals=2)

    # 创建结果DataFrame
    results_df = pd.DataFrame({
        'id': test_data['id'],
        'predicted_value': predictions.flatten()
    })

    # 保存预测结果
    results_df.to_csv(output_file, index=False)
    print(f"预测结果已保存至: {output_file}")

    # 显示部分预测结果
    print("\\n预测结果示例:")
    print(results_df.head())

                `);

        return `
print("进行预测...")
predictions_tensor = model.predict(X_test_tensor)
# 保存结果
save_csv(predictions_tensor)`;
    };
}