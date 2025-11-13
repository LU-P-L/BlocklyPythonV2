import type * as TmpBlockly from 'blockly';
import {Order} from "blockly/python";
import { MnistData } from "./mnist_data";

declare global {
    interface Window {
        tf_exp: any;
        tf: any;
        tfvis: any;
    }
}
const MNIST_COLOR = '#7d4136'

export function addTFExampleMnistV2(blocks: typeof TmpBlockly.Blocks, pythonGenerator: TmpBlockly.Generator, Blockly: typeof TmpBlockly, content: any) {
    window.tf_exp = window.tf_exp || {};
    window.tf_exp.mnist_data = window.tf_exp.mnist_data || new MnistData();
    window.tf_exp.show_model_summary = function(model: any) {
        window.tfvis.show.modelSummary({name: 'Model Architecture', tab: 'Model'}, model);
    }
    window.tf_exp.mnist_v2_train_tidy = function(data: MnistData, trainDataSize: number = 5500) {
        const [trainXs, trainYs] = window.tf.tidy(() => {
            const d = data.nextTrainBatch(5500);
            return [
                d.xs.reshape([trainDataSize, 28, 28, 1]),
                d.labels
            ];
        });
        return [trainXs, trainYs]
    }
    window.tf_exp.mnist_v2_test_tidy = function(data: MnistData, testDataSize: number = 1000) {
        const [testXs, testYs] = window.tf.tidy(() => {
            const d = data.nextTestBatch(1000);
            return [
                d.xs.reshape([testDataSize, 28, 28, 1]),
                d.labels
            ];
        });
        return [testXs, testYs]
    }
    window.tf_exp.mnist_v2_train = function(model: any, trainXs: any, trainYs:any, testXs: any, testYs: any, batchSize: number = 512, epochs: number = 10) {
        console.log(model, trainXs, trainYs, testXs, testYs, batchSize, epochs)
        const metrics = ['loss', 'val_loss', 'acc', 'val_acc'];
        const container = {
            name: 'Model Training', tab: 'Model', styles: { height: '1000px' }
        };
        const fitCallbacks = window.tfvis.show.fitCallbacks(container, metrics);

        return  model.fit(trainXs, trainYs, {
            batchSize: batchSize,
            validationData: [testXs, testYs],
            epochs: epochs,
            shuffle: true,
            callbacks: fitCallbacks
        })
    }
    window.tf_exp.mnist_v2_doPrediction = async function (model: any, data: any, testDataSize: any) {
        const classNames = [
            'Zero',
            'One',
            'Two',
            'Three',
            'Four',
            'Five',
            'Six',
            'Seven',
            'Eight',
            'Nine'
        ]
        const IMAGE_WIDTH = 28
        const IMAGE_HEIGHT = 28
        const testData = data.nextTestBatch(testDataSize)
        const testXs = testData.xs.reshape([testDataSize, IMAGE_WIDTH, IMAGE_HEIGHT, 1])
        const labels = testData.labels.argMax(-1)
        const pred = model.predict(testXs).argMax(-1)

        // show perClassAccuracy
        const classAccuracy = await window.tfvis.metrics.perClassAccuracy(labels, pred)
        const accuracyContainer = { name: 'Accuracy', tab: 'Evaluation' }
        window.tfvis.show.perClassAccuracy(accuracyContainer, classAccuracy, classNames)
        // show confusionMatrix
        const confusionMatrix = await window.tfvis.metrics.confusionMatrix(labels, pred)
        const confusionContainer = { name: 'Confusion Matrix', tab: 'Evaluation' }
        window.tfvis.render.confusionMatrix(confusionContainer, {
            values: confusionMatrix,
            tickLabels: classNames
        })
        labels.dispose()
    }
    blocks["tf_example_mnist_v2"] = {
        init: function() {
            this.appendDummyInput()
                .appendField("手写体识别 V2, 仅可以通过 pyodide 执行");
            this.setInputsInline(true);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour("#7FB6FF");
        }
    };
    pythonGenerator.forBlock["tf_example_mnist_v2"] = function() {
        return `from js import tf, tfvis, tf_exp
from pyodide.ffi import to_js

# 获取数据
data = tf_exp.mnist_data
if not data.finish:
    await data.load()
# 构建模型
model = tf.sequential()
model.add(tf.layers.conv2d(
    inputShape=to_js([28, 28, 1]),
    kernelSize=5,
    filters=8,
    strides=1,
    activation='relu',
    kernelInitializer='varianceScaling'
))
model.add(tf.layers.maxPooling2d(poolSize=to_js([2, 2]), strides=to_js([2, 2])))
model.add(tf.layers.conv2d(
    kernelSize=5,
    filters=16,
    strides=1,
    activation='relu',
    kernelInitializer='varianceScaling'
))
model.add(tf.layers.maxPooling2d(poolSize=to_js([2, 2]), strides=to_js([2, 2])))
model.add(tf.layers.flatten())
model.add(tf.layers.dense(
    units=10,
    kernelInitializer='varianceScaling',
    activation='softmax'
))
# 处理模型
optimizer = tf.train.adam()
model.compile(
    optimizer=optimizer,
    loss='categoricalCrossentropy',
    metrics=['accuracy'],
)
tf_exp.show_model_summary(model)
# 处理训练数据
trainXs, trainYs = tf_exp.mnist_v2_train_tidy(data)
testXs, testYs = tf_exp.mnist_v2_test_tidy(data)
# 训练
await tf_exp.mnist_v2_train(model, trainXs, trainYs, testXs, testYs)
print("完成")
`;
    };

    blocks['tf_example_mnist_v2_import_tf'] = {
        init: function () {
            this.setPreviousStatement(false, null);
            this.setNextStatement(true, null);
            this.setColour(MNIST_COLOR);
            this.appendDummyInput('dummyInput')
                .appendField('Mnist 导入相关库')
        }
    }
    pythonGenerator.forBlock['tf_example_mnist_v2_import_tf'] = function () {
        (pythonGenerator as any).definitions_["tf_mnist_v3"] = `from js import tf, tfvis, tf_exp
from pyodide.ffi import to_js\n\n`
        return ''
    }

    blocks['tf_example_mnist_v2_load_data'] = {
        init: function () {
            this.setPreviousStatement(true, null)
            this.setNextStatement(true, null)
            this.setColour(MNIST_COLOR)
            this.appendDummyInput('dummyInput').appendField('加载数据')
        }
    }
    pythonGenerator.forBlock['tf_example_mnist_v2_load_data'] = function () {
        return `
# 获取 手写体识别 的数据
data = tf_exp.mnist_data
if not data.finish:
    await data.load()
`
    }

    blocks['tf_example_mnist_v2_show_data'] = {
        init: function () {
            this.appendDummyInput('dummyInput').appendField('展示手写体数字')
            this.setPreviousStatement(true, null)
            this.setNextStatement(true, null)
            this.setColour(MNIST_COLOR)
        }
    }
    pythonGenerator.forBlock['tf_example_mnist_v2_show_data'] = function () {
        return `
# 展示手写体识别的部分数据
tf_exp.mnist_data_show(data)
`
    }

    blocks['tf_example_mnist_v2_create_model'] = {
        init: function () {
            this.appendDummyInput().appendField('构建手写体识别模型')
            this.setPreviousStatement(true, null)
            this.setNextStatement(true, null)
            this.setColour(MNIST_COLOR)
        }
    }
    pythonGenerator.forBlock['tf_example_mnist_v2_create_model'] = function () {
        return `# 构建模型
model = tf.sequential()
model.add(tf.layers.conv2d(
    inputShape=to_js([28, 28, 1]),
    kernelSize=5,
    filters=8,
    strides=1,
    activation='relu',
    kernelInitializer='varianceScaling'
))
model.add(tf.layers.maxPooling2d(poolSize=to_js([2, 2]), strides=to_js([2, 2])))
model.add(tf.layers.conv2d(
    kernelSize=5,
    filters=16,
    strides=1,
    activation='relu',
    kernelInitializer='varianceScaling'
))
model.add(tf.layers.maxPooling2d(poolSize=to_js([2, 2]), strides=to_js([2, 2])))
model.add(tf.layers.flatten())
model.add(tf.layers.dense(
    units=10,
    kernelInitializer='varianceScaling',
    activation='softmax'
))
# 处理模型
optimizer = tf.train.adam()
model.compile(
    optimizer=optimizer,
    loss='categoricalCrossentropy',
    metrics=['accuracy'],
)
`
    }

    blocks['tf_example_mnist_v2_create_model2'] = {
        init: function () {
            this.appendDummyInput().appendField('构建手写体识别模型')
            this.appendValueInput('kernelSize')
                .setCheck(null)
                .setAlign(Blockly.inputs.Align.RIGHT)
                .appendField('设置卷积层参数：kernelSize=')
            this.appendValueInput('filter')
                .setCheck(null)
                .setAlign(Blockly.inputs.Align.RIGHT)
                .appendField('filter=')
            this.appendValueInput('strides')
                .setCheck(null)
                .setAlign(Blockly.inputs.Align.RIGHT)
                .appendField('strides=')
            this.appendValueInput('activation')
                .setCheck(null)
                .setAlign(Blockly.inputs.Align.RIGHT)
                .appendField('activation=')
            this.appendValueInput('kernelInitializer')
                .setCheck(null)
                .setAlign(Blockly.inputs.Align.RIGHT)
                .appendField('kernelInitializer=')
            this.appendValueInput('optimizer')
                .setCheck(null)
                .setAlign(Blockly.inputs.Align.RIGHT)
                .appendField('设置模型优化器: optimizer=')
            this.appendValueInput('loss')
                .setCheck(null)
                .setAlign(Blockly.inputs.Align.RIGHT)
                .appendField('设置模型损失函数：loss=')
            this.setPreviousStatement(true, null)
            this.setNextStatement(true, null)
            this.setColour(MNIST_COLOR)
        }
    }
    pythonGenerator.forBlock['tf_example_mnist_v2_create_model2'] = function (block: any) {
        let kernelSize = pythonGenerator.valueToCode(block, 'kernelSize', Order.ATOMIC)
        let filter = pythonGenerator.valueToCode(block, 'filter', Order.ATOMIC)
        let strides = pythonGenerator.valueToCode(block, 'strides', Order.ATOMIC)
        let activation = pythonGenerator.valueToCode(block, 'activation', Order.ATOMIC)
        let kernelInitializer = pythonGenerator.valueToCode(block, 'kernelInitializer', Order.ATOMIC)
        let optimizer = pythonGenerator.valueToCode(block, 'optimizer', Order.ATOMIC)
        optimizer = optimizer.slice(1, -1)
        let loss = pythonGenerator.valueToCode(block, 'loss', Order.ATOMIC)
        return `# 构建模型
model = tf.sequential()
model.add(tf.layers.conv2d(
    inputShape=to_js([28, 28, 1]),
    kernelSize=5,
    filters=8,
    strides=1,
    activation=${activation},
    kernelInitializer=${kernelInitializer}
))
model.add(tf.layers.maxPooling2d(poolSize=to_js([2, 2]), strides=to_js([2, 2])))
model.add(tf.layers.conv2d(
    kernelSize=${kernelSize},
    filters=${filter},
    strides=${strides},
    activation=${activation},
    kernelInitializer=${kernelInitializer}
))
model.add(tf.layers.maxPooling2d(poolSize=to_js([2, 2]), strides=to_js([2, 2])))
model.add(tf.layers.flatten())
model.add(tf.layers.dense(
    units=10,
    kernelInitializer="varianceScaling",
    activation="softmax"
))
optimizer = tf.train.${optimizer}()
model.compile(
    optimizer=optimizer,
    loss=${loss},
    metrics= ["accuracy"],
)
`
    }

    blocks['tf_example_mnist_v2_show_model_summary'] = {
        init: function () {
            this.appendDummyInput('dummyInput').appendField('展示模型各层摘要')
            this.setPreviousStatement(true, null)
            this.setNextStatement(true, null)
            this.setColour(MNIST_COLOR)
        }
    }
    pythonGenerator.forBlock['tf_example_mnist_v2_show_model_summary'] = function () {
        return `tf_exp.show_model_summary(model)\n`
    }

    blocks['tf_example_mnist_v2_train_model'] = {
        init: function () {
            this.appendDummyInput().appendField('训练模型')
            this.setInputsInline(false)
            this.setPreviousStatement(true, null)
            this.setNextStatement(true, null)
            this.setColour(MNIST_COLOR)
        }
    }
    pythonGenerator.forBlock['tf_example_mnist_v2_train_model'] = function () {
        return `# 处理训练数据
trainXs, trainYs = tf_exp.mnist_v2_train_tidy(data)
testXs, testYs = tf_exp.mnist_v2_test_tidy(data)
# 训练
await tf_exp.mnist_v2_train(model, trainXs, trainYs, testXs, testYs)
`
    }

    Blockly.Blocks['tf_example_mnist_v2_train_model2'] = {//训练模型
        init: function () {
            ;(this as any)
                .appendValueInput('batch')
                .setCheck('Number')
                .appendField('训练模型，设置batch=')
            ;(this as any)
                .appendValueInput('epochs')
                .setCheck('Number')
                .appendField('                     epochs=')
            ;(this as any)
                .appendValueInput('trainDataSize')
                .setCheck('Number')
                .appendField('           trainDataSize=')
            ;(this as any)
                .appendValueInput('testDataSize')
                .setCheck('Number')
                .appendField('            testDataSize=')
            ;(this as any).setInputsInline(false)
            ;(this as any).setPreviousStatement(true, null)
            ;(this as any).setNextStatement(true, null)
            ;(this as any).setColour(MNIST_COLOR)
        }
    }
    pythonGenerator.forBlock['tf_example_mnist_v2_train_model2'] = function (block: any) {
        let batch = pythonGenerator.valueToCode(block, 'batch', Order.ATOMIC)
        let epochs = pythonGenerator.valueToCode(block, 'epochs', Order.ATOMIC)
        let trainDataSize = pythonGenerator.valueToCode(block, 'trainDataSize', Order.ATOMIC)
        let testDataSize = pythonGenerator.valueToCode(block, 'testDataSize', Order.ATOMIC)
        return `# 处理训练数据
trainXs, trainYs = tf_exp.mnist_v2_train_tidy(data, ${trainDataSize})
testXs, testYs = tf_exp.mnist_v2_test_tidy(data, ${testDataSize})
# 训练
await tf_exp.mnist_v2_train(model, trainXs, trainYs, testXs, testYs, ${batch}, ${epochs})
`
    }

    blocks['tf_example_mnist_v2_model_evaluation'] = {
        init: function () {
            this.appendValueInput('dataSize')
                .setCheck('Number')
                .appendField('模型评估，选取数据大小为')
            this.setInputsInline(true)
            this.setPreviousStatement(true, null)
            this.setNextStatement(true, null)
            this.setColour(MNIST_COLOR)
        }
    }
    pythonGenerator.forBlock['tf_example_mnist_v2_model_evaluation'] = function (block: typeof blocks) {
        // let dataSize = pythonGenerator.valueToCode(block, 'dataSize', pythonGenerator.ORDER_ATOMIC)
        let dataSize = 10;
        return `tf_exp.mnist_v2_doPrediction(model, data, ${dataSize})\n`
    }

}
