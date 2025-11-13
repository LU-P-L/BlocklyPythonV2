import * as Blockly from "blockly";
import { pythonGenerator } from "blockly/python";

Blockly.Blocks["tf_sample_model_boston_housing_v2_get_data"] = {
  init: function() {
      this.appendDummyInput()
          .appendField("线性回归 数据获取");
      this.appendValueInput("data").appendField("获取数据");
      this.appendValueInput("train_data").appendField("训练特征");
      this.appendValueInput("train_label").appendField("训练标签");
      this.appendValueInput("test_data").appendField("测试特征");
      this.appendValueInput("test_label").appendField("测试标签");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.initialized_ = true;
      this.setColour("#7FB6FF");
  }
};
pythonGenerator.forBlock["tf_sample_model_boston_housing_v2_get_data"] = function(block) {
  const train_data = pythonGenerator.valueToCode(block, "train_data", pythonGenerator.ORDER_NONE) || pythonGenerator.None;
  const train_label = pythonGenerator.valueToCode(block, "train_label", pythonGenerator.ORDER_NONE) || pythonGenerator.None;
  const test_data = pythonGenerator.valueToCode(block, "test_data", pythonGenerator.ORDER_NONE) || pythonGenerator.None;
  const test_label= pythonGenerator.valueToCode(block, "test_label", pythonGenerator.ORDER_NONE) || pythonGenerator.None;

  return `
# 数据获取 加载npz文件数据
data = ${pythonGenerator.valueToCode(block, "data", pythonGenerator.ORDER_NONE) || pythonGenerator.None}
# 切分训练数据， 使用7:3的规则切分训练和测试
num_of_train = int(len(data["x"]) * 0.7)
${train_data}, ${train_label} = data["x"][:num_of_train], data["y"][:num_of_train]
${test_data}, ${test_label} = data["x"][num_of_train:], data["y"][num_of_train:]
# 展示训练数据
print("训练数据 特征:\\n", ${train_data})
print("训练数据 标签:\\n", ${train_label})
print("测试数据 特征:\\n", ${test_data})
print("测试数据 标签:\\n", ${test_label})
`
};
Blockly.Blocks["tf_sample_model_boston_housing_v2_normalization"] = {
  init: function() {
      this.appendDummyInput()
          .appendField("线性回归 归一化");
      this.appendValueInput("train_data").appendField("获取数据");
      this.appendValueInput("test_data").appendField("获取数据");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.initialized_ = true;
      this.setColour("#7FB6FF");
  }
};
pythonGenerator.forBlock["tf_sample_model_boston_housing_v2_normalization"] = function(block) {
  const train_data = pythonGenerator.valueToCode(block, "train_data", pythonGenerator.ORDER_NONE) || pythonGenerator.None;
  const test_data = pythonGenerator.valueToCode(block, "test_data", pythonGenerator.ORDER_NONE) || pythonGenerator.None;
  return `
# 归一化
mean=${train_data}.mean(axis=0)
std=${train_data}.std(axis=0)

${train_data}-=mean
${train_data}/=std
${test_data}-=mean
${test_data}/=std
`
};
Blockly.Blocks["tf_sample_model_boston_housing_v2_model_builder"] = {
  init: function() {
      this.appendDummyInput()
          .appendField("线性回归 模型构建");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.initialized_ = true;
      this.setColour("#7FB6FF");
  }
};
pythonGenerator.forBlock["tf_sample_model_boston_housing_v2_model_builder"] = function(block) {
  pythonGenerator.definitions_["from js import tf"] = "from js import tf";
  pythonGenerator.definitions_["from pyodide.ffi import to_js"] = "from pyodide.ffi import to_js";

  return `
# 模型构建
def build_model():
    model=tf.sequential()
    model.add(tf.layers.dense(units=16,activation='relu',inputShape=to_js([13,])))
    model.add(tf.layers.dense(units=16,activation='relu'))
    model.add(tf.layers.dense(units=1))
    model.compile(optimizer='adam',loss=tf.losses.meanSquaredError, metrics=to_js([tf.losses.meanSquaredError]))
    return model
`
};
Blockly.Blocks["tf_sample_model_boston_housing_v2_fit"] = {
  init: function() {
      this.appendDummyInput()
          .appendField("线性回归 模型训练");
      this.appendValueInput("ks").appendField("获取数据");
      this.appendValueInput("train_data").appendField("获取数据");
      this.appendValueInput("train_label").appendField("获取数据");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.initialized_ = true;
      this.setColour("#7FB6FF");
  }
};
pythonGenerator.forBlock["tf_sample_model_boston_housing_v2_fit"] = function(block) {
  pythonGenerator.definitions_["from js import blockly_tensorflow"] = "from js import blockly_tensorflow";

  const ks = pythonGenerator.valueToCode(block, "ks", pythonGenerator.ORDER_NONE) || pythonGenerator.None;
  const train_data = pythonGenerator.valueToCode(block, "train_data", pythonGenerator.ORDER_NONE) || pythonGenerator.None;
  const train_label = pythonGenerator.valueToCode(block, "train_label", pythonGenerator.ORDER_NONE) || pythonGenerator.None;
  window.blockly_tensorflow = window.blockly_tensorflow || {};

  window.blockly_tensorflow.show_model_summary = function(model) {
    window.tfvis.show.modelSummary({name: 'Model Architecture', tab: 'Model'}, model);
  }
  window.blockly_tensorflow.fit = async function(model, train_x, train_y, test_x, test_y) {
    const metrics = ['loss', 'val_loss', 'acc', 'val_acc'];
    const container = {
      name: 'Model Training', tab: 'Model', styles: { height: '1000px' }
    };
    const fitCallbacks = tfvis.show.fitCallbacks(container, metrics);

    const [trainXs, trainYs] = tf.tidy(() => {
      return [
        tf.tensor2d(Array.from(train_x, arr => Array.from(arr))),
        tf.tensor2d(Array.from(train_y), [train_y.length, 1])
      ];
    });
    const [testXs, testYs] = tf.tidy(() => {
      return [
        tf.tensor2d(Array.from(test_x, arr => Array.from(arr))),
        tf.tensor2d(Array.from(test_y), [test_y.length, 1])
      ];
    });
    let res = model.fit(trainXs, trainYs, {
      batchSize: 32,
      validationData: [testXs, testYs],
      epochs: 80,
      shuffle: true,
      callbacks: fitCallbacks
    });
    return res
  }
  return `# 模型训练
val_x=${train_data}[i*${ks}:(i+1)*${ks}]
val_y=${train_label}[i*${ks}:(i+1)*${ks}]
train_x=np.concatenate([${train_data}[:i*${ks}],${train_data}[(i+1)*${ks}:]],axis=0)
train_y=np.concatenate([${train_label}[:i*${ks}],${train_label}[(i+1)*${ks}:]],axis=0)
print("train_x", train_x, train_x.shape)
model=build_model()
await blockly_tensorflow.fit(to_js(model), to_js(train_x),to_js(train_y), to_js(val_x), to_js(val_y))
`
};

