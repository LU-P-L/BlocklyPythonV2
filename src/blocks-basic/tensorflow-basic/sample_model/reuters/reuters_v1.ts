import { LOADER_STATE, LOADER_ICON, FLUSH_ICON, OK_ICON, TfKerasDatasetsData } from "../../dataset/tf_keras_datasets";
import type * as TmpBlockly from "blockly";

export function addTFExampleReutersV2(blocks: typeof TmpBlockly.Blocks, pythonGenerator: TmpBlockly.Generator, Blockly: typeof TmpBlockly, content: any) {
    window.tf_keras_dataset.reuters_data = window.tf_keras_dataset.reuters_data || new TfKerasDatasetsData(
        "reuters", "tf_keras_dataset/reuters.npz", "/reuters.npz"
    );
    const reuters_data = window.tf_keras_dataset.reuters_data;

    window.tf_keras_dataset.reuters_word_index_data = window.tf_keras_dataset.reuters_word_index_data || new TfKerasDatasetsData(
        "reuters_word_index", "tf_keras_dataset/reuters_word_index.json", "/reuters_word_index.json"
    );
    const reuters_word_index_data = window.tf_keras_dataset.reuters_word_index_data;

    blocks["tf_sample_model_reuters_v1"] = {
        init: function() {
            let that = this;
            this.reuters_load_state_icon = new Blockly.FieldImage(LOADER_ICON, 20, 20, "reuters", function() {
                if(reuters_data.load_state == LOADER_STATE.PENDING || reuters_data.load_state == LOADER_STATE.FAIL) {
                    that.get_reuters_data();
                } else if(reuters_data.load_state == LOADER_STATE.LOADING) {
                    alert("加载中, 请不要重复点击");
                } else if(reuters_data.load_state == LOADER_STATE.SUCCESSFUL) {
                    alert("加载完成, 请不要重复点击");
                }
            });
            this.reuters_word_index_data_load_state_icon = new Blockly.FieldImage(LOADER_ICON, 20, 20, "reuters_word_index", function() {
                if(reuters_word_index_data.load_state == LOADER_STATE.PENDING || reuters_word_index_data.load_state == LOADER_STATE.FAIL) {
                    that.get_reuters_word_index_data();
                } else if(reuters_word_index_data.load_state == LOADER_STATE.LOADING) {
                    alert("加载中, 请不要重复点击");
                } else if(reuters_word_index_data.load_state == LOADER_STATE.SUCCESSFUL) {
                    alert("加载完成, 请不要重复点击");
                }
            });
            this.appendDummyInput()
                .appendField("新闻标签多分类");
            this.appendDummyInput()
                .appendField("路透社数据")
                .appendField("", "reuters_load_state_tips")
                .appendField(this.reuters_load_state_icon);
            this.appendDummyInput()
                .appendField("路透社 Word Index")
                .appendField("", "reuters_word_index_load_state_tips")
                .appendField(this.reuters_word_index_data_load_state_icon);
            this.setInputsInline(false);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour("#7FB6FF");
            this.updateShape_();
        },
        get_reuters_data() {
            reuters_data.pre_load();
            this.updateShape_();
            reuters_data.load(Pyodide.FS.writeFile).then(() => {
                this.updateShape_();
            });
        },
        get_reuters_word_index_data() {
            reuters_word_index_data.pre_load();
            this.updateShape_();
            reuters_word_index_data.load(Pyodide.FS.writeFile).then(() => {
                this.updateShape_();
            });
        },
        updateShape_() {
            if (reuters_data.load_state == LOADER_STATE.PENDING) {
                this.setFieldValue("(点击开始加载)", "reuters_load_state_tips");
                this.reuters_load_state_icon.doValueUpdate_(FLUSH_ICON);
            } else if (reuters_data.load_state == LOADER_STATE.LOADING) {
                this.setFieldValue("(加载中)", "reuters_load_state_tips");
                this.reuters_load_state_icon.doValueUpdate_(LOADER_ICON);
            } else if (reuters_data.load_state == LOADER_STATE.FAIL) {
                this.setFieldValue("(加载失败)", "reuters_load_state_tips");
                this.reuters_load_state_icon.doValueUpdate_(FLUSH_ICON);
            } else if (reuters_data.load_state == LOADER_STATE.SUCCESSFUL) {
                this.setFieldValue("(加载完成)", "reuters_load_state_tips");
                this.reuters_load_state_icon.doValueUpdate_(OK_ICON);
            }
            if (reuters_word_index_data.load_state == LOADER_STATE.PENDING) {
                this.setFieldValue("(点击开始加载)", "reuters_word_index_load_state_tips");
                this.reuters_word_index_data_load_state_icon.doValueUpdate_(FLUSH_ICON);
            } else if (reuters_word_index_data.load_state == LOADER_STATE.LOADING) {
                this.setFieldValue("(加载中)", "reuters_word_index_load_state_tips");
                this.reuters_word_index_data_load_state_icon.doValueUpdate_(LOADER_ICON);
            } else if (reuters_word_index_data.load_state == LOADER_STATE.FAIL) {
                this.setFieldValue("(加载失败)", "reuters_word_index_load_state_tips");
                this.reuters_word_index_data_load_state_icon.doValueUpdate_(FLUSH_ICON);
            } else if (reuters_word_index_data.load_state == LOADER_STATE.SUCCESSFUL) {
                this.setFieldValue("(加载完成)", "reuters_word_index_load_state_tips");
                this.reuters_word_index_data_load_state_icon.doValueUpdate_(OK_ICON);
            }
        }
    };
    pythonGenerator.forBlock["tf_sample_model_reuters_v1"] = function(block) {
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
        return `
from js import tf, tfvis, blockly_tensorflow
import numpy as np
from pyodide.ffi import to_js
import json
# 数据获取
with np.load("/reuters.npz", allow_pickle=True) as f:
  xs, labels = f["x"], f["y"]

seed = 113
rng = np.random.RandomState(seed)
indices = np.arange(len(xs))
rng.shuffle(indices)
xs = xs[indices]
labels = labels[indices]
skip_top, num_words = 0, 1000
test_split=0.2
xs = [[w for w in x if skip_top <= w < num_words] for x in xs]
idx = int(len(xs) * (1 - test_split))
train_data, train_label = np.array(xs[:idx], dtype="object"), np.array(labels[:idx])
test_data, test_label = np.array(xs[idx:], dtype="object"), np.array(labels[idx:])
# 展示训练数据
print("训练数据 特征:\\n", train_data)
print("训练数据 标签:\\n", train_label)
print("测试数据 特征:\\n", test_data)
print("测试数据 标签:\\n", test_label)
# word index 获取
w = json.load(open("/reuters_word_index.json"))
rw=dict([(v,k) for (k,v) in w.items()])
text=' '.join([rw.get(i-3,'?') for i in train_data[0]])

# word2vec
def one_hot(s,d):
    res=np.zeros((len(s),d))
    for i,s in enumerate(s):
        res[i,s]=1.
    return res
x_train=one_hot(train_data,num_words)
x_test=one_hot(test_data,num_words)

y_train=np.array(train_label, dtype="int")
y_test=np.array(test_label, dtype="int")

# 建立模型
model=tf.sequential()
model.add(tf.layers.dense(units=16,activation='relu', inputShape=to_js([num_words])))
model.add(tf.layers.dense(units=46,activation='softmax'))
model.compile(optimizer='adam',loss="sparseCategoricalCrossentropy", metrics=to_js(["acc"]))
# 训练
await blockly_tensorflow.fit(to_js(model), to_js(x_train[1000:]),to_js(y_train[1000:]), to_js(x_train[:1000]), to_js(y_train[:1000]))
`;
    };
}

  
