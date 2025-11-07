import type * as TmpBlockly from 'blockly'
import { Order } from 'blockly/python'

    ; (window as any).blockly_tensorflow = (window as any).blockly_tensorflow || {}
    ; (window as any).blockly_dataset = (window as any).blockly_dataset || {}
    ; (window as any).carsModel = (window as any).carsModel || {}
    ; (window as any).blockly_dataset.uploadData = (window as any).blockly_dataset.uploadData || {}

const Text_classifi_COLOR = '#FE9900'

export function addText_classifiBlocks(Blockly: any, pythonGenerator: any, workspaceSvg: any) {
    //导入TF相关库
    Blockly.Blocks['import_tf_base_text'] = {
        init: function () {
            this.setPreviousStatement(false, null)
            this.setNextStatement(true, null)
            this.setColour(Text_classifi_COLOR)
            this.appendDummyInput('dummyInput').appendField('导入tf相关库')
        }
    }
    pythonGenerator.forBlock['import_tf_base_text'] = function () {
        ; (window as any).blockly_tensorflow = (window as any).blockly_tensorflow || {}
        return `
import matplotlib.pyplot as plt
import os
import re
import shutil
import string
import tensorflow as tf
from tensorflow.keras import layers
from tensorflow.keras import losses`
    }

  //导入数据集
  Blockly.Blocks['import_text_classifi_data'] = {
    init: function () {
        this.setPreviousStatement(true, null)
        this.setNextStatement(true, null)
        this.setColour(Text_classifi_COLOR)
        this.appendDummyInput('dummyInput').appendField('导入IMDB 数据集')
    }

}
pythonGenerator.forBlock['import_text_classifi_data'] = function () {
    ; (window as any).blockly_tensorflow = (window as any).blockly_tensorflow || {}
    return `
#导入IMDB数据集
url = "https://ai.stanford.edu/~amaas/data/sentiment/aclImdb_v1.tar.gz"
dataset = tf.keras.utils.get_file("aclImdb_v1", url,
                                        untar=True, cache_dir='.',
                                        cache_subdir='')
    
dataset_dir = os.path.join(os.path.dirname(dataset), 'aclImdb')
os.listdir(dataset_dir)
train_dir = os.path.join(dataset_dir, 'train')
os.listdir(train_dir)
remove_dir = os.path.join(train_dir, 'unsup')
shutil.rmtree(remove_dir)
    `
}

 
//创建数据集
Blockly.Blocks['create_database'] = {
    init: function () {
        this.setPreviousStatement(true, null)
        this.setNextStatement(true, null)
        this.setColour(Text_classifi_COLOR)
        this.appendDummyInput('dummyInput').appendField('创建训练、验证、测试数据集')
    }

}
pythonGenerator.forBlock['create_database'] = function () {
    ; (window as any).blockly_tensorflow = (window as any).blockly_tensorflow || {}
    return `
#创建训练数据集
batch_size = 32
seed = 42
raw_train_ds = tf.keras.utils.text_dataset_from_directory(
    'aclImdb/train', 
    batch_size=batch_size, 
    validation_split=0.2, 
    subset='training', 
    seed=seed)
#创建验证数据集
raw_val_ds = tf.keras.utils.text_dataset_from_directory(
    'aclImdb/train', 
    batch_size=batch_size, 
    validation_split=0.2, 
    subset='validation', 
    seed=seed)
#创建测试数据集
raw_test_ds = tf.keras.utils.text_dataset_from_directory(
    'aclImdb/test', 
    batch_size=batch_size)
    `
}

  //文本标准化处理
  Blockly.Blocks['Text_sta'] = {
    init: function () {
        this.setPreviousStatement(true, null)
        this.setNextStatement(true, null)
        this.setColour(Text_classifi_COLOR)
        this.appendDummyInput('dummyInput').appendField('文本标准化处理')
    }

}
pythonGenerator.forBlock['Text_sta'] = function () {
    ; (window as any).blockly_tensorflow = (window as any).blockly_tensorflow || {}
    return `
#文本标准化处理
def custom_standardization(input_data):
  lowercase = tf.strings.lower(input_data)
  stripped_html = tf.strings.regex_replace(lowercase, '<br />', ' ')
  return tf.strings.regex_replace(stripped_html,
                                  '[%s]' % re.escape(string.punctuation),
                                  '')
    `
}

 //将文本数据转换为整数序列的层
 Blockly.Blocks['Text_Vec'] = {
    init: function () {
        this.setPreviousStatement(true, null)
        this.setNextStatement(true, null)
        this.setColour(Text_classifi_COLOR)
        this.appendDummyInput('dummyInput').appendField('创建文本向量化层')
    }

}
pythonGenerator.forBlock['Text_Vec'] = function () {
    ; (window as any).blockly_tensorflow = (window as any).blockly_tensorflow || {}
    return `
#创建将文本数据转换为整数序列的TextVectorization层
max_features = 10000
sequence_length = 250
vectorize_layer = layers.TextVectorization(
    standardize=custom_standardization,
    max_tokens=max_features,
    output_mode='int',
    output_sequence_length=sequence_length)
    `
}

//调用 adapt 以使TextVectorization层的状态适合数据集
Blockly.Blocks['Adjust_Vec'] = {
    init: function () {
        this.setPreviousStatement(true, null)
        this.setNextStatement(true, null)
        this.setColour(Text_classifi_COLOR)
        this.appendDummyInput('dummyInput').appendField('调整文本向量化层状态')
    }

}
pythonGenerator.forBlock['Adjust_Vec'] = function () {
    ; (window as any).blockly_tensorflow = (window as any).blockly_tensorflow || {}
    return `
#调用 adapt 以使TextVectorization层的状态适合数据集
train_text = raw_train_ds.map(lambda x, y: x)
vectorize_layer.adapt(train_text)
def vectorize_text(text, label):
  text = tf.expand_dims(text, -1)
  return vectorize_layer(text), label
    `
}

//TextVectorization层应用于数据集
Blockly.Blocks['Apply_Vec'] = {
    init: function () {
        this.setPreviousStatement(true, null)
        this.setNextStatement(true, null)
        this.setColour(Text_classifi_COLOR)
        this.appendDummyInput('dummyInput').appendField('向量化数据集')
    }

}
pythonGenerator.forBlock['Apply_Vec'] = function () {
    ; (window as any).blockly_tensorflow = (window as any).blockly_tensorflow || {}
    return `
#TextVectorization层应用于数据集
text_batch, label_batch = next(iter(raw_train_ds))
first_review, first_label = text_batch[0], label_batch[0]
train_ds = raw_train_ds.map(vectorize_text)
val_ds = raw_val_ds.map(vectorize_text)
test_ds = raw_test_ds.map(vectorize_text)
    `
}

// //配置数据集以提高性能
// Blockly.Blocks['Conf_Datasets'] = {
//     init: function () {
//         this.setPreviousStatement(true, null)
//         this.setNextStatement(true, null)
//         this.setColour(Text_classifi_COLOR)
//         this.appendDummyInput('dummyInput').appendField('配置数据集提高性能')
//     }

// }
// pythonGenerator.forBlock['Conf_Datasets'] = function () {
//     ; (window as any).blockly_tensorflow = (window as any).blockly_tensorflow || {}
//     return `
// #配置数据集以提高性能
// AUTOTUNE = tf.data.AUTOTUNE
// train_ds = train_ds.cache().prefetch(buffer_size=AUTOTUNE)
// val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)
// test_ds = test_ds.cache().prefetch(buffer_size=AUTOTUNE)
//     `
// }

  //创建模型
  Blockly.Blocks['create_movie_moudle'] = {
    init: function () {
        this.appendDummyInput().appendField('构建评论文本分类模型')
        this.appendValueInput('embedding')
            .setCheck(null)
            .setAlign(Blockly.inputs.Align.RIGHT)
            .appendField('embedding=')

            //dropout
        this.appendValueInput('Dropout')
            .setCheck(null)
            .setAlign(Blockly.inputs.Align.RIGHT)
            .appendField('Dropout=')

        this.appendValueInput('optimizer')
            .setCheck(null)
            .setAlign(Blockly.inputs.Align.RIGHT)
            .appendField('设置模型优化器: optimizer=')
        //   this.appendValueInput('loss')
        //     .setCheck(null)
        //     .setAlign(Blockly.inputs.Align.RIGHT)
        //     .appendField('设置模型损失函数：loss=')
        this.setPreviousStatement(true, null)
        this.setNextStatement(true, null)
        this.setColour(Text_classifi_COLOR)
    }
}
pythonGenerator.forBlock['create_movie_moudle'] = function (block: any) {
    ; (window as any).blockly_tensorflow = (window as any).blockly_tensorflow || {}
    let embedding = pythonGenerator.valueToCode(block, 'embedding', Order.ATOMIC)
    let optimizer = pythonGenerator.valueToCode(block, 'optimizer', Order.ATOMIC)
    let Dropout = pythonGenerator.valueToCode(block, 'Dropout', Order.ATOMIC)
    return `
embedding_dim = ${embedding}
model = tf.keras.Sequential([
layers.Embedding(max_features + 1, embedding_dim),
layers.Dropout(${Dropout}),
layers.GlobalAveragePooling1D(),
layers.Dropout(0.2),
layers.Dense(1)])

#损失函数与优化器
model.summary()
model.compile(loss=losses.BinaryCrossentropy(from_logits=True),
optimizer=${optimizer},
metrics=tf.metrics.BinaryAccuracy(threshold=0.0))
    `

}

//训练模型
Blockly.Blocks['train_movie_moudle'] = {
    init: function () {
        this.setPreviousStatement(true, null)
        this.setNextStatement(true, null)
        this.setColour(Text_classifi_COLOR)
        this.appendDummyInput('dummyInput').appendField('训练模型')
    }
}
pythonGenerator.forBlock['train_movie_moudle'] = function () {
    ; (window as any).blockly_tensorflow = (window as any).blockly_tensorflow || {}
    return `
epochs = 10
history = model.fit(
train_ds,
validation_data=val_ds,
epochs=epochs)
    `

}


//评估模型
Blockly.Blocks['assessment_movie_moudle'] = {
    init: function () {
        this.setPreviousStatement(true, null)
        this.setNextStatement(true, null)
        this.setColour(Text_classifi_COLOR)
        this.appendDummyInput('dummyInput').appendField('评估模型')
    }
}
pythonGenerator.forBlock['assessment_movie_moudle'] = function () {
    ; (window as any).blockly_tensorflow = (window as any).blockly_tensorflow || {}
    return `
loss, accuracy = model.evaluate(test_ds)

print("Loss: ", loss)
print("Accuracy: ", accuracy)
    `

}

//创建loss&accuracy图表
Blockly.Blocks['create_chart'] = {
    init: function () {
        this.setPreviousStatement(true, null)
        this.setNextStatement(true, null)
        this.setColour(Text_classifi_COLOR)
        this.appendDummyInput('dummyInput').appendField('创建图表')
    }
}
pythonGenerator.forBlock['create_chart'] = function () {
    ; (window as any).blockly_tensorflow = (window as any).blockly_tensorflow || {}
    return `
history_dict = history.history
history_dict.keys()

acc = history_dict['binary_accuracy']
val_acc = history_dict['val_binary_accuracy']
loss = history_dict['loss']
val_loss = history_dict['val_loss']

epochs = range(1, len(acc) + 1)

# "bo" is for "blue dot"
plt.plot(epochs, loss, 'bo', label='Training loss')
# b is for "solid blue line"
plt.plot(epochs, val_loss, 'b', label='Validation loss')
plt.title('Training and validation loss')
plt.xlabel('Epochs')
plt.ylabel('Loss')
plt.legend()

plt.show()

#accuracy图表
plt.plot(epochs, acc, 'bo', label='Training acc')
plt.plot(epochs, val_acc, 'b', label='Validation acc')
plt.title('Training and validation accuracy')
plt.xlabel('Epochs')
plt.ylabel('Accuracy')
plt.legend(loc='lower right')

plt.show()

    `

}

}
