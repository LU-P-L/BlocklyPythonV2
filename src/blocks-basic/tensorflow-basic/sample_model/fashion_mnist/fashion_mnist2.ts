import * as TmpBlockly from 'blockly'
// import { MnistData } from '../dataset/mnist_data'
const trainData = "data/fashion_mnist/fashion_mnist_train2.json"
const testData = "data/fashion_mnist/fashion_mnist_test2.json"
import { Order } from 'blockly/python'
//console.log(trainData)
//console.log(testData)
;(window as any).blockly_dataset = (window as any).blockly_dataset || {}
declare global {
  interface Window {
    tf_exp: any
    tf: any
    tfvis: any
  }
}

const FASHION_COLOR = '#EFC3CA'


export function addFashionMnistBlocks2(Blockly: any, pythonGenerator: any, workspaceSvg: any) {
    //导入TF相关库
    Blockly.Blocks['import_tf_base22'] = {
        init: function () {
            this.setPreviousStatement(false, null)
            this.setNextStatement(true, null)
            this.setColour(FASHION_COLOR)
            this.appendDummyInput('dummyInput').appendField('导入tf相关库')
        }
    }
    pythonGenerator.forBlock['import_tf_base22'] = function () {
        //;(pythonGenerator as any).definitions_['ffi_to_js'] = 'from pyodide.ffi import to_js'
        //;(pythonGenerator as any).definitions_['js_tf'] = 'from js import tf'
        //;(pythonGenerator as any).definitions_['import_matplotlib'] = 'import matplotlib.pyplot as plt'
        ; (window as any).blockly_tensorflow = (window as any).blockly_tensorflow || {}
        //Blockly.Python.definitions_['import_matplotlib'] = 'import matplotlib.pyplot as plt';
       // Blockly.Python.definitions_['import_numpy'] = 'import numpy as np';
        return `
import os
import json
import micropip  
await micropip.install("matplotlib")
from js import tf,tfvis,tf_exp
from js import blockly_tensorflow, blockly_dataset
import matplotlib.pyplot as plt
import numpy as np
from pyodide.ffi import to_js
`

    }
    //导入数据集
    Blockly.Blocks['import_fashion_mnist_data2'] = {
        init: function () {
            this.setPreviousStatement(true, null)
            this.setNextStatement(true, null)
            this.setColour(FASHION_COLOR)
            this.appendDummyInput('dummyInput').appendField('导入 Fashion MNIST 数据集')
        }

    }
    pythonGenerator.forBlock['import_fashion_mnist_data2'] = function () {
       ; (window as any).blockly_tensorflow = (window as any).blockly_tensorflow || {}
       // 将扁平化的图像数据转换为28x28像素的二维数组 
       //;(window as any).flattenTo2D = function (flatArray, width, height) {
      
        return `
# 读取训练数据 
with open('/data/local/fashion_mnist_train.json', 'r') as f: 
  train_data_json = json.load(f)

# 读取测试数据 
with open('/data/local/fashion_mnist_test.json', 'r') as f: 
  test_data_json = json.load(f) 

# 获取图像数据和标签 
train_images_flat = np.array(train_data_json['train_images']) 
train_labels = np.array(train_data_json['train_labels']) 

test_images_flat = np.array(test_data_json['test_images']) 
test_labels = np.array(test_data_json['test_labels']) 

# 将展平的图像数据转换为x维数组 (样本数, 高度, 宽度) 
train_images = train_images_flat.reshape(-1, 28, 28) 
test_images = test_images_flat.reshape(-1, 28, 28) 
 
`
    }

    //加载数据
    Blockly.Blocks['load_fashion_mnist_data2'] = {
        init: function () {
            this.setPreviousStatement(true, null)
            this.setNextStatement(true, null)
            this.setColour(FASHION_COLOR)
            this.appendDummyInput('dummyInput').appendField('加载数据')
        }

    }
    pythonGenerator.forBlock['load_fashion_mnist_data2'] = function () {
        ; (window as any).blockly_tensorflow = (window as any).blockly_tensorflow || {}
        return `
class_names = ['T-shirt/top', 'Trouser', 'Pullover', 'Dress', 'Coat','Sandal', 'Shirt', 'Sneaker', 'Bag', 'Ankle boot']\n`

    }

    //预处理数据
    Blockly.Blocks['deal_fashion_mnist_data2'] = {
        init: function () {
            this.setPreviousStatement(true, null)
            this.setNextStatement(true, null)
            this.setColour(FASHION_COLOR)
            this.appendDummyInput('dummyInput').appendField('预处理数据')
        }

    }
    pythonGenerator.forBlock['deal_fashion_mnist_data2'] = function () {
        ; (window as any).blockly_tensorflow = (window as any).blockly_tensorflow || {}
        return `
plt.figure()
#train_images[0] = np.array(train_images[0]).astype(float) 
plt.imshow(train_images[0])
plt.colorbar()
plt.grid(False)
plt.show()
train_images = train_images / 255.0
test_images = test_images / 255.0
plt.figure(figsize=(10,10))\n`

    }

    //构建模型
    Blockly.Blocks['create_fashion_mnist_moudle2'] = {
        init: function () {
            this.appendDummyInput().appendField('构建衣服识别模型')
            this.appendValueInput('kernelSize')
                .setCheck(null)
                .setAlign(Blockly.inputs.Align.RIGHT)
                .appendField('设置节点参数：kernelSize=')
            // this.appendValueInput('DenseSize1')
            //     .setCheck(null)
            //     .setAlign(Blockly.inputs.Align.RIGHT)
            //     .appendField('filter=')
            //     //
                //activation
            this.appendValueInput('activation')
                .setCheck(null)
                .setAlign(Blockly.inputs.Align.RIGHT)
                .appendField('activation=')

            this.appendValueInput('DenseSize')
                .setCheck(null)
                .setAlign(Blockly.inputs.Align.RIGHT)
                .appendField('DenseSize=')
            // this.appendValueInput('kernelInitializer')
            //   .setCheck(null)
            //   .setAlign(Blockly.inputs.Align.RIGHT)
            //   .appendField('kernelInitializer=')
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
            this.setColour(FASHION_COLOR)
        }

    }
    pythonGenerator.forBlock['create_fashion_mnist_moudle2'] = function (block: any) {
        ; (window as any).blockly_tensorflow = (window as any).blockly_tensorflow || {}
        let kernelSize = pythonGenerator.valueToCode(block, 'kernelSize', Order.ATOMIC)
        let activation = pythonGenerator.valueToCode(block, 'activation', Order.ATOMIC)
        let DenseSize = pythonGenerator.valueToCode(block, 'DenseSize', Order.ATOMIC)
        let loss = pythonGenerator.valueToCode(block, 'loss', Order.ATOMIC)
        let optimizer = pythonGenerator.valueToCode(block, 'optimizer', Order.ATOMIC)

//         return`
// #使用 tf.sequential 创建模型 
// model = tf.sequential()

// #添加 Flatten 层（不需要指定 inputShape，因为它会自动处理上一层的输出）  
// model.add(tf.layers.flatten());  

// #添加 Dense 层，并在这里指定 inputShape（假设这是第一层）  
// model.add(tf.layers.dense({  
//   units: 128,  
//   activation: 'relu',  
//   inputShape: [28, 28] // 这里指定输入数据的形状  
// }));  
  
// #添加输出层  
// model.add(tf.layers.dense({units: 10})); 

// # 编译模型，设置优化器、损失函数和评估指标 
// model.compile({ 
//   optimizer: 'adam', 
//   loss: 'sparseCategoricalCrossentropy', 
//   metrics: ['accuracy'] 
// }); `

return `
# 构建模型
model = tf.sequential()
model.add(tf.layers.conv2d(
    inputShape= to_js([28, 28,1]),
    kernelSize=5,
    filters=8,
    strides=1,
    activation = 'relu',
));
model.add(tf.layers.flatten());
model.add(tf.layers.dense(
  units=10,
  activation='softmax'
  ))

#model.add(tf.layers.timeDistributed(
#    layer=tf.layers.dense(10)
#));

#编译模型
model.compile(
    optimizer="adam",
    loss="sparseCategoricalCrossentropy",
    metrics=to_js(["accuracy"])
);

`

    }
    Blockly.Blocks['tf_fashion_mnist_train2'] = {
        init: function () {
          this.appendDummyInput().appendField('训练模型')
          this.setInputsInline(false)
          this.setPreviousStatement(true, null)
          this.setNextStatement(true, null)
          this.setColour(FASHION_COLOR)
        }
      }
      pythonGenerator.forBlock['tf_fashion_mnist_train2'] = function () {
        return `
# 训练
model.fit(train_images, train_labels, epochs=10)
    `
      }
      //评估准确率
      Blockly.Blocks['tf_fashion_mnist_ssessment2'] = {
        init: function () {
          this.appendDummyInput().appendField('评估准确率')
          this.setInputsInline(false)
          this.setPreviousStatement(true, null)
          this.setNextStatement(true, null)
          this.setColour(FASHION_COLOR)
        }
      }
      pythonGenerator.forBlock['tf_fashion_mnist_ssessment2'] = function () {
        return `
# 评估准确率
test_loss, test_acc = model.evaluate(test_images,  test_labels, verbose=2)
print('Test accuracy:', test_acc)
    `
      }
    
      //进行预测
      Blockly.Blocks['tf_fashion_mnist_Forecast2'] = {
        init: function () {
          this.appendDummyInput().appendField('进行预测')
          this.setInputsInline(false)
          this.setPreviousStatement(true, null)
          this.setNextStatement(true, null)
          this.setColour(FASHION_COLOR)
        }
      }
      pythonGenerator.forBlock['tf_fashion_mnist_Forecast2'] = function () {
        return ``
//         return `
// # 进行预测
// probability_model = tf.keras.Sequential([model, tf.keras.layers.Softmax()])
// predictions = probability_model.predict(test_images)
// def plot_image(i, predictions_array, true_label, img):
//     true_label, img = true_label[i], img[i]
//     plt.grid(False)
//     plt.xticks([])
//     plt.yticks([])
    
//     plt.imshow(img, cmap=plt.cm.binary)
    
//     predicted_label = np.argmax(predictions_array)
//     if predicted_label == true_label:
//         color = 'blue'
//     else:
//         color = 'red'
    
//     plt.xlabel("{} {:2.0f}% ({})".format(class_names[predicted_label],
//                             100*np.max(predictions_array),
//                             class_names[true_label]),
//                             color=color)
    
// def plot_value_array(i, predictions_array, true_label):
//     true_label = true_label[i]
//     plt.grid(False)
//     plt.xticks(range(10))
//     plt.yticks([])
//     thisplot = plt.bar(range(10), predictions_array, color="#777777")
//     plt.ylim([0, 1])
//     predicted_label = np.argmax(predictions_array)
    
//     thisplot[predicted_label].set_color('red')
//     thisplot[true_label].set_color('blue')
    
//     `
      }
      //输出预测结果
      Blockly.Blocks['tf_fashion_mnist_print2'] = {
        init: function () {
          this.appendDummyInput().appendField('输出预测结果')
          this.setInputsInline(false)
          this.setPreviousStatement(true, null)
          this.setNextStatement(true, null)
          this.setColour(FASHION_COLOR)
        }
      }
      pythonGenerator.forBlock['tf_fashion_mnist_print2'] = function () {
        return ``
//         return `
// # 输出第0个图像预测结果
// i = 0
// plt.figure(figsize=(6,3))
// plt.subplot(1,2,1)
// plot_image(i, predictions[i], test_labels, test_images)
// plt.subplot(1,2,2)
// plot_value_array(i, predictions[i],  test_labels)
// plt.show()
//     `
      }
}
