import * as Blockly from "blockly";
import { pythonGenerator } from "blockly/python";

Blockly.Blocks["tf_sample_model_boston_housing_v1"] = {
    init: function() {
        this.appendDummyInput()
            .appendField("线性回归");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.initialized_ = true;
        this.setColour("#7FB6FF");
    }
};
pythonGenerator.forBlock["tf_sample_model_boston_housing_v1"] = function(block) {
    window.blockly_tensorflow = window.blockly_tensorflow || {};

    window.blockly_tensorflow.show_model_summary = function(model) {
      window.tfvis.show.modelSummary({name: 'Model Architecture', tab: 'Model'}, model);
    }
    window.blockly_tensorflow.fit = async function(model, train_x, train_y, test_x, test_y) {
      // console.log(train_x, train_y, test_x, test_y);
      // console.log(model.summary());
      const metrics = ['loss', 'val_loss', 'acc', 'val_acc'];
      const container = {
        name: 'Model Training', tab: 'Model', styles: { height: '1000px' }
      };
      const fitCallbacks = tfvis.show.fitCallbacks(container, metrics);

      const [trainXs, trainYs] = tf.tidy(() => {
        // console.log("tf raw");
        // console.log(train_x, train_y);
        // console.log("tf tensor");
        // console.log(Array.from(train_x, arr => Array.from(arr)));
        // console.log(tf.tensor2d(Array.from(train_x, arr => Array.from(arr))));
        // console.log(Array.from(train_y));
        // console.log(tf.tensor2d(Array.from(train_y), [236, 1]));

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
    return `
from js import tf, tfvis, blockly_tensorflow
import numpy as np
from pyodide.ffi import to_js

# 数据获取
data = np.load("/boston_housing.npz")
num_of_train = int(len(data["x"]) * 0.7)
train_data, train_label = data["x"][:num_of_train], data["y"][:num_of_train]
test_data, test_label = data["x"][num_of_train:], data["y"][num_of_train:]
print(train_data, train_label, test_data, test_label)
# 归一化
mean=train_data.mean(axis=0)
std=train_data.std(axis=0)

train_data-=mean
train_data/=std
test_data-=mean
test_data/=std

# 模型构建
def build_model():
    model=tf.sequential()
    model.add(tf.layers.dense(units=16,activation='relu',inputShape=to_js([13,])))
    model.add(tf.layers.dense(units=16,activation='relu'))
    model.add(tf.layers.dense(units=1))
    model.compile(optimizer='adam',loss=tf.losses.meanSquaredError,metrics=to_js([tf.losses.meanSquaredError]))
    return model

K=3
ks=len(train_data)//K
history={'mse':[],'mae':[],'val_mse':[],'val_mae':[]}

for i in range(K):
    val_x=train_data[i*ks:(i+1)*ks]
    val_y=train_label[i*ks:(i+1)*ks]
    train_x=np.concatenate([train_data[:i*ks],train_data[(i+1)*ks:]],axis=0)
    train_y=np.concatenate([train_label[:i*ks],train_label[(i+1)*ks:]],axis=0)
    print("train_x", train_x, train_x.shape)
    model=build_model()
    # h=model.fit(to_js(train_x),to_js(train_y), to_js(val_x), to_js(val_y))
    h = blockly_tensorflow.fit(to_js(model), to_js(train_x),to_js(train_y), to_js(val_x), to_js(val_y))
    await h
    print(h)
`;
};
  
