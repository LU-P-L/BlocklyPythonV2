import * as TmpBlockly from 'blockly'
import { Order } from 'blockly/python'
    
    ; (window as any).blockly_tensorflow = (window as any).blockly_tensorflow || {}
    ; (window as any).blockly_dataset = (window as any).blockly_dataset || {}
    ; (window as any).carsModel = (window as any).carsModel || {}
    ; (window as any).blockly_dataset.uploadData = (window as any).blockly_dataset.uploadData || {}
//
//     declare global {
//   interface Window {
//     tf_exp: any
//     tf: any
//     tfvis: any
//   }
// }//
const FASHION_COLOR = '225'

export function addFashionClassifyBlocks(Blockly: any, pythonGenerator: any, workspaceSvg: any) {
    //导入TF相关库
    Blockly.Blocks['import_tf_base1'] = {
        init: function () {
            this.setPreviousStatement(false, null)
            this.setNextStatement(true, null)
            this.setColour(FASHION_COLOR)
            this.appendDummyInput('dummyInput').appendField('导入tf相关库')
        }
    }
    pythonGenerator.forBlock['import_tf_base2'] = function () {
        ;(pythonGenerator as any).definitions_['ffi_to_js'] = 'from pyodide.ffi import to_js'
        ;(pythonGenerator as any).definitions_['js_tf'] = 'from js import tf'
        ;(pythonGenerator as any).definitions_['numpy'] = 'import numpy as np'
        ;(pythonGenerator as any).definitions_['import_matplotlib'] = 'import matplotlib.pyplot as plt'
        ; (window as any).blockly_tensorflow = (window as any).blockly_tensorflow || {}
        return `
`
// # TensorFlow and tf.keras
// import tensorflow as tf     
// # Helper libraries
// import numpy as np
// import matplotlib.pyplot as plt\n

    }
    //导入数据集
    Blockly.Blocks['import_fashion_data3'] = {
        init: function () {
            this.setPreviousStatement(true, null)
            this.setNextStatement(true, null)
            this.setColour(FASHION_COLOR)
            this.appendDummyInput('dummyInput').appendField('导入 Fashion MNIST 数据集')
        }

    }
    pythonGenerator.forBlock['import_fashion_data4'] = function () {
        ; (window as any).blockly_tensorflow = (window as any).blockly_tensorflow || {}
        return `
fashion_mnist = tf.keras.datasets.fashion_mnist
(train_images, train_labels), (test_images, test_labels) = fashion_mnist.load_data()`

    }

    //加载数据
    Blockly.Blocks['load_fashion_data5'] = {
        init: function () {
            this.setPreviousStatement(true, null)
            this.setNextStatement(true, null)
            this.setColour(FASHION_COLOR)
            this.appendDummyInput('dummyInput').appendField('加载数据')
        }

    }
    pythonGenerator.forBlock['load_fashion_data5'] = function () {
        ; (window as any).blockly_tensorflow = (window as any).blockly_tensorflow || {}
        return `
class_names = ['T-shirt/top', 'Trouser', 'Pullover', 'Dress', 'Coat',
        'Sandal', 'Shirt', 'Sneaker', 'Bag', 'Ankle boot']`

    }

    //预处理数据
    Blockly.Blocks['deal_fashion_data6'] = {
        init: function () {
            this.setPreviousStatement(true, null)
            this.setNextStatement(true, null)
            this.setColour(FASHION_COLOR)
            this.appendDummyInput('dummyInput').appendField('预处理数据')
        }

    }
    pythonGenerator.forBlock['deal_fashion_data6'] = function () {
        ; (window as any).blockly_tensorflow = (window as any).blockly_tensorflow || {}
        return `
plt.figure()
plt.imshow(train_images[0])
plt.colorbar()
plt.grid(False)
plt.show()
train_images = train_images / 255.0
test_images = test_images / 255.0
plt.figure(figsize=(10,10))`

    }

    //构建模型
    Blockly.Blocks['create_fashion_moudle7'] = {
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
    pythonGenerator.forBlock['create_fashion_moudle7'] = function (block: any) {
        ; (window as any).blockly_tensorflow = (window as any).blockly_tensorflow || {}
        let kernelSize = pythonGenerator.valueToCode(block, 'kernelSize', Order.ATOMIC)
        let activation = pythonGenerator.valueToCode(block, 'activation', Order.ATOMIC)
        let DenseSize = pythonGenerator.valueToCode(block, 'DenseSize', Order.ATOMIC)
        let loss = pythonGenerator.valueToCode(block, 'loss', Order.ATOMIC)
        let optimizers = pythonGenerator.valueToCode(block, 'optimizer', Order.ATOMIC)


// // 引入TensorFlow.js库  
// const tf = require('@tensorflow/tfjs');  
// // 定义模型  
// const model = tf.sequential();  
// model.add(tf.layers.flatten({inputShape: [28, 28]}));  
// model.add(tf.layers.dense({units: kernelSize, activation: activation}));  
// model.add(tf.layers.dense({units: denseSize, activation: 'softmax'})); // 输出层通常使用softmax激活函数  
  
// // 编译模型  
// model.compile({  
//   optimizer: optimizers,  
//   loss: 'sparseCategoricalCrossentropy', // 注意：from_logits在tfjs中通过传入logits参数到loss函数控制  
//   metrics: ['accuracy']  
// });  
  




        return `# 构建模型
model = tf.keras.Sequential([
  tf.keras.layers.Flatten(input_shape=(28, 28)),
  tf.keras.layers.Dense(${kernelSize}, activation=${activation}),
  tf.keras.layers.Dense(${DenseSize})
])
#编译模型
model.compile(
  optimizer=${optimizers},
  loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True),
    metrics=['accuracy'])
        `
    }

    
//训练
    Blockly.Blocks['tf_train8'] = {
    init: function () {
      this.appendDummyInput().appendField('训练模型')
      this.setInputsInline(false)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(FASHION_COLOR )
    }
  }
  pythonGenerator.forBlock['tf_train8'] = function () {
    return `
# 训练
model.fit(train_images, train_labels, epochs=10)
`
  }
  //评估准确率
  Blockly.Blocks['tf_Assessment9'] = {
    init: function () {
      this.appendDummyInput().appendField('评估准确率')
      this.setInputsInline(false)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(FASHION_COLOR )
    }
  }
  pythonGenerator.forBlock['tf_Assessment9'] = function () {
    return `
# 评估准确率
test_loss, test_acc = model.evaluate(test_images,  test_labels, verbose=2)
print('Test accuracy:', test_acc)
`
  }

  //进行预测
  Blockly.Blocks['tf_Forecast10'] = {
    init: function () {
      this.appendDummyInput().appendField('进行预测')
      this.setInputsInline(false)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(FASHION_COLOR )
    }
  }
  pythonGenerator.forBlock['tf_Forecast10'] = function () {
    return `
# 进行预测
probability_model = tf.keras.Sequential([model, tf.keras.layers.Softmax()])
predictions = probability_model.predict(test_images)\
def plot_image(i, predictions_array, true_label, img):
  true_label, img = true_label[i], img[i]
  plt.grid(False)
  plt.xticks([])
  plt.yticks([])

  plt.imshow(img, cmap=plt.cm.binary)

  predicted_label = np.argmax(predictions_array)
  if predicted_label == true_label:
    color = 'blue'
  else:
    color = 'red'

  plt.xlabel("{} {:2.0f}% ({})".format(class_names[predicted_label],
                                100*np.max(predictions_array),
                                class_names[true_label]),
                                color=color)

def plot_value_array(i, predictions_array, true_label):
  true_label = true_label[i]
  plt.grid(False)
  plt.xticks(range(10))
  plt.yticks([])
  thisplot = plt.bar(range(10), predictions_array, color="#777777")
  plt.ylim([0, 1])
  predicted_label = np.argmax(predictions_array)

  thisplot[predicted_label].set_color('red')
  thisplot[true_label].set_color('blue')

`
  }
  //输出预测结果
  Blockly.Blocks['tf_print11'] = {
    init: function () {
      this.appendDummyInput().appendField('输出预测结果')
      this.setInputsInline(false)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(FASHION_COLOR )
    }
  }
  pythonGenerator.forBlock['tf_print11'] = function () {
    return `
# 输出第0个图像预测结果
i = 0
plt.figure(figsize=(6,3))
plt.subplot(1,2,1)
plot_image(i, predictions[i], test_labels, test_images)
plt.subplot(1,2,2)
plot_value_array(i, predictions[i],  test_labels)
plt.show()
`
  }
}
