import * as TmpBlockly from 'blockly'
import { Order } from 'blockly/python'
import { type PyodideGenerator } from "../PyodideGenerator";

const LSTM_COLOR = 45;

export function addLSTMBlocksV2(blocks: typeof TmpBlockly.Blocks, pythonGenerator: PyodideGenerator, Blockly: typeof TmpBlockly, content: any) {
    // LSTM 参数设置区块
    Blockly.defineBlocksWithJsonArray([{
        "type": "lstm_set_params",
        "message0": "设置参数    取样数量 %1 取样步幅 %2 Epochs %3 examplesBatch %4 batch %5",
        "args0": [
            {
                "type": "input_value",
                "name": "sample_len",
                "align": "RIGHT",
                "check": "Number"
            },
            {
                "type": "input_value",
                "name": "sample_step",
                "align": "RIGHT",
                "check": "Number"
            },
            {
                "type": "input_value",
                "name": "epoch",
                "align": "RIGHT",
                "check": "Number"
            },
            {
                "type": "input_value",
                "name": "examples_batch",
                "align": "RIGHT",
                "check": "Number"
            },
            {
                "type": "input_value",
                "name": "batch",
                "align": "RIGHT",
                "check": "Number"
            }
        ],
        "nextStatement": null,
        "colour": LSTM_COLOR
    }]);

    pythonGenerator.forBlock['lstm_set_params'] = function(block: TmpBlockly.Block) {
        const sampleLen = pythonGenerator.valueToCode(block, 'sample_len', Order.ATOMIC) || '64';
        const sampleStep = pythonGenerator.valueToCode(block, 'sample_step', Order.ATOMIC) || '10';
        const epoch = pythonGenerator.valueToCode(block, 'epoch', Order.ATOMIC) || '10';
        const examplesBatch = pythonGenerator.valueToCode(block, 'examples_batch', Order.ATOMIC) || '32';
        const batch = pythonGenerator.valueToCode(block, 'batch', Order.ATOMIC) || '16';

        return `sample_len = ${sampleLen}
sample_step = ${sampleStep}
num_epochs = ${epoch}
examples_per_epoch = ${examplesBatch}
batch_size = ${batch}
`;
    };

    // LSTM 训练数据集区块
    Blockly.defineBlocksWithJsonArray([{
        "type": "lstm_set_train_dataset",
        "message0": "（LSTM）选择训练数据集",
        "args0": [

        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": LSTM_COLOR
    }]);

    pythonGenerator.forBlock['lstm_set_train_dataset'] = function(block: TmpBlockly.Block, generator) {
        generator.addPyodidePreRunCode('lstm_set_train_dataset', `
# 导入必要的库
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import os
import glob
from js import tf
from sklearn.metrics import mean_squared_error, r2_score, log_loss
from pyodide.ffi import to_js, create_proxy


def load_train_data_from_dir(train_data_dir):
    train_file_list = []

    # 读取所有CSV文件
    for csv_path in glob.glob(os.path.join(train_data_dir, "*.csv")):
        train_file_list.append(csv_path)
        # print(f"已找到训练数据文件: {os.path.basename(csv_path)}")
    if not train_file_list:
        raise Exception("未找到任何训练数据文件")

    # 选择第一个CSV文件作为训练数据
    train_file = train_file_list[0]
    print(f"使用训练数据文件: {os.path.basename(train_file)}")

    # 加载训练数据
    train_data_raw = pd.read_csv(train_file)
    # print(f"原始训练数据集形状: {train_data_raw.shape}")

    # 处理数据 - 第一列是ID，我们只使用第二列作为标签
    train_data = train_data_raw.iloc[:, 1:2]  # 只保留第二列作为数据（索引为1）
    print(f"处理后训练数据集形状: {train_data.shape}")

    # 数据预处理
    X_train = []
    y_train = []

    # 根据sample_len和sample_step创建序列数据
    for i in range(0, len(train_data) - sample_len, sample_step):
        X_train.append(train_data.iloc[i:i+sample_len].values)
        y_train.append(train_data.iloc[i+sample_len].values)

    X_train = np.array(X_train)
    y_train = np.array(y_train)

    # 归一化数据
    scaler_X = MinMaxScaler()
    scaler_y = MinMaxScaler()

    # 记住输入特征的形状
    n_samples = X_train.shape[0]
    n_timesteps = X_train.shape[1]
    n_features = X_train.shape[2]

    # 重塑数据以便归一化
    X_train_reshaped = X_train.reshape(n_samples * n_timesteps, n_features)
    X_train_scaled = scaler_X.fit_transform(X_train_reshaped)
    X_train_scaled = X_train_scaled.reshape(n_samples, n_timesteps, n_features)

    # 归一化y
    y_train_scaled = scaler_y.fit_transform(y_train)

    X_train_tensor = tf.tensor3d(to_js(X_train_scaled.tolist()))
    y_train_tensor = tf.tensor2d(to_js(y_train_scaled.tolist()))
    # print("成功创建特征和标签张量")

    print(f"处理后的训练数据形状: X={X_train.shape}, y={y_train.shape}")
    input_shape = [n_timesteps, n_features]  # 用于模型输入
    print(f"模型输入形状: {input_shape}")

    return X_train_tensor,y_train_tensor,n_timesteps,n_features,scaler_X,scaler_y,input_shape
        `);


        pythonGenerator.definitions_["imports"] = `
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import os
import glob
from js import tf
from sklearn.metrics import mean_squared_error, r2_score, log_loss
from pyodide.ffi import to_js, create_proxy`;

        return `
train_data_dir = "/data/mount/lstm/train"
X_train_tensor,y_train_tensor,n_timesteps,n_features,scaler_X,scaler_y,input_shape = load_train_data_from_dir(train_data_dir)
`;
    };

    // LSTM 测试数据集区块
    Blockly.defineBlocksWithJsonArray([{
        "type": "lstm_set_test_dataset",
        "message0": "（LSTM）选择测试数据集",
        "args0": [

        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": LSTM_COLOR
    }]);

    pythonGenerator.forBlock['lstm_set_test_dataset'] = function(block: TmpBlockly.Block, generator) {
        generator.addPyodidePreRunCode('lstm_set_test_dataset', `
def load_test_data_from_dir(test_data_dir):
    test_file_list = []

    # 读取所有CSV文件
    for csv_path in glob.glob(os.path.join(test_data_dir, "*.csv")):
        test_file_list.append(csv_path)
        # print(f"已找到测试数据文件: {os.path.basename(csv_path)}")
    if not test_file_list:
        raise Exception("未找到任何测试数据文件")

    # 选择第一个CSV文件作为测试数据
    test_file = test_file_list[0]
    print(f"使用测试数据文件: {os.path.basename(test_file)}")

    # 加载测试数据
    test_data_raw = pd.read_csv(test_file)
    # print(f"原始测试数据集形状: {test_data_raw.shape}")

    # 处理数据 - 第一列是ID，我们只使用第二列作为标签
    test_data = test_data_raw.iloc[:, 1:2]  # 只保留第二列作为数据（索引为1）
    print(f"处理后测试数据集形状: {test_data.shape}")

    # 数据预处理
    X_test = []
    y_test = []

    # 根据sample_len和sample_step创建序列数据
    for i in range(0, len(test_data) - sample_len, sample_step):
        X_test.append(test_data.iloc[i:i+sample_len].values)
        y_test.append(test_data.iloc[i+sample_len].values)

    X_test = np.array(X_test)
    y_test = np.array(y_test)

    # 归一化数据，使用训练集的归一化器
    n_test_samples = X_test.shape[0]
    X_test_reshaped = X_test.reshape(n_test_samples * n_timesteps, n_features)
    X_test_scaled = scaler_X.transform(X_test_reshaped)
    X_test_scaled = X_test_scaled.reshape(n_test_samples, n_timesteps, n_features)

    # 归一化y测试数据
    y_test_scaled = scaler_y.transform(y_test)

    # 转换为张量
    try:
        # 确保数据是正确的格式
        X_test_js = to_js(X_test_scaled.tolist())
        y_test_js = to_js(y_test_scaled.tolist())
        
        # 使用正确的张量创建函数
        X_test_tensor = tf.tensor3d(X_test_js)
        y_test_tensor = tf.tensor2d(y_test_js)
        # print("成功创建测试数据张量")
    except Exception as e:
        print(f"创建测试数据张量时出错: {e}")
        print("X_test_scaled shape:", X_test_scaled.shape)
        print("y_test_scaled shape:", y_test_scaled.shape)
        raise e

    print(f"处理后的测试数据形状: X={X_test.shape}, y={y_test.shape}")
    return X_test_scaled
        `);


        return `
test_data_dir = "/data/mount/lstm/test"
X_test_scaled = load_test_data_from_dir(test_data_dir)
`;
    };

    // LSTM 创建模型区块
    Blockly.defineBlocksWithJsonArray([{
        "type": "lstm_create_model",
        "message0": "（LSTM）定义模型 %1 损失函数 %2",
        "args0": [
            {
                "type": "input_statement",
                "name": "layers"
            },
            {
                "type": "input_statement",
                "name": "loss",
                "align": "RIGHT",
                "check": "String"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": LSTM_COLOR
    }]);

    pythonGenerator.forBlock['lstm_create_model'] = function(block: TmpBlockly.Block) {
        let layersCode = pythonGenerator.statementToCode(block, 'layers');
        layersCode = layersCode.replace(/^\s+/gm, '');
        
        const loss = (pythonGenerator.statementToCode(block, 'loss') || 'mse').trim();
        
        return `
# 创建LSTM模型
model = tf.sequential()
layer_defs = []
${layersCode}
# 编译模型
model.compile(
    optimizer= 'adam',
    loss= ${loss},
    metrics= ['mae']
)
print("模型结构:")
for i, layer in enumerate(layer_defs):
    print(f"  第{i+1}层: {layer}")
`;
    };

    // LSTM 训练模型区块
    Blockly.defineBlocksWithJsonArray([{
        "type": "lstm_train_model",
        "message0": "（LSTM）训练模型 %1",
        "args0": [
            {
                "type": "input_end_row",
                "name": "NAME"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": LSTM_COLOR
    }]);

    pythonGenerator.forBlock['lstm_train_model'] = function(block: TmpBlockly.Block) {
        return `
# 定义训练参数
batch_size = batch_size  # 来自参数设置区块
epochs = num_epochs  # 来自参数设置区块
# 训练模型
model.fit(
    X_train_tensor, y_train_tensor,
    dict(
        batchSize=batch_size,
        epochs=epochs,
        validationSplit=0.2,
        verbose=1
    )
)
print("模型训练完成")
`;
    };

    // LSTM 使用模型区块
    Blockly.defineBlocksWithJsonArray([{
        "type": "lstm_use_model",
        "message0": "（LSTM）测试模型并展示结果 %1 输入生成数据的数量 %2",
        "args0": [
            {
                "type": "input_dummy",
                "name": "test_dataset"
            },
            {
                "type": "input_value",
                "name": "length",
                "align": "RIGHT",
                "check": "Number"
            }
        ],
        "previousStatement": null,
        "colour": LSTM_COLOR
    }]);

    pythonGenerator.forBlock['lstm_use_model'] = function(block: TmpBlockly.Block,generator) {
        generator.addPyodidePreRunCode('lstm_use_model', `
def save_csv(generated_sequences):
    # 创建输出目录
    output_dir = "/data/mount/lstm/output"
    os.makedirs(output_dir, exist_ok=True)

    # 转换生成的序列为numpy数组
    generated_sequences = np.array(generated_sequences)
    # 逆转归一化
    generated_sequences_original = scaler_y.inverse_transform(generated_sequences)
    # 保存生成的序列
    generated_df = pd.DataFrame(generated_sequences_original)
    generated_file = os.path.join(output_dir, "lstm_generated_sequences.csv")
    generated_df.to_csv(generated_file, index=False)
    print(f"生成的序列数据已保存至: {generated_file}")

def generate_data(length):
    # 生成新的序列数据
    last_sequence = X_test_scaled[-1].copy()  # 确保使用副本
    generated_sequences = []

    # 添加批次维度
    last_seq_reshaped = np.expand_dims(last_sequence, axis=0)
    last_seq_js = to_js(last_seq_reshaped.tolist())
    last_sequence_tensor = tf.tensor3d(last_seq_js)

    # 使用create_proxy包装predict的回调函数
    predict_callback = create_proxy(lambda x: np.array(x.arraySync()))

    for _ in range(length):
        # 预测下一个值
        next_value_tensor = model.predict(last_sequence_tensor)
        next_value_array = predict_callback(next_value_tensor)[0]
        generated_sequences.append(next_value_array)
        # 更新序列 - 移除第一个时间步，添加预测值作为新的时间步
        last_sequence_np = last_sequence.copy()  # n_timesteps x n_features
        last_sequence_np = np.vstack((last_sequence_np[1:], next_value_array.reshape(1, -1)))
        # 添加少量噪声以避免过早收敛
        noise_level = 0.0001  # 根据需要调整
        last_sequence_np += np.random.normal(0, noise_level, last_sequence_np.shape)
        # 更新全局序列
        last_sequence = last_sequence_np.copy()
        # 创建新的张量
        last_seq_reshaped = np.expand_dims(last_sequence_np, axis=0)
        last_seq_js = to_js(last_seq_reshaped.tolist())
        last_sequence_tensor = tf.tensor3d(last_seq_js)
    
    return generated_sequences

        `);
        
        const length = pythonGenerator.valueToCode(block, 'length', Order.ATOMIC) || '10';

        return `
# 生成序列数据
generated_sequences = generate_data(int(${length}))
save_csv(generated_sequences)`;
    };
}