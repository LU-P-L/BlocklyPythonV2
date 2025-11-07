import * as TmpBlockly from 'blockly'
import type { CodeGenerator } from "blockly/core/generator"
import { Order } from 'blockly/python'

const LAYER_COLOR = 260;

export function addLayerBlocksV2(blocks: typeof TmpBlockly.Blocks, pythonGenerator: CodeGenerator, Blockly: typeof TmpBlockly, content: any) {
    // Dense Layer block
    Blockly.defineBlocksWithJsonArray([{
        "type": "layer",
        "message0": "全连接层 神经元个数为 %1 激活函数 %2",
        "args0": [
            {
                "type": "input_value",
                "name": "nural_count",
                "check": "Number"
            },
            {
                "type": "input_value",
                "name": "activate_fn",
                "align": "RIGHT"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": LAYER_COLOR
    }]);

    pythonGenerator.forBlock['layer'] = function(block) {
        const neuralCount = pythonGenerator.valueToCode(block, 'nural_count', Order.ATOMIC) || '64';
        const activationFn = pythonGenerator.valueToCode(block, 'activate_fn', Order.ATOMIC);
        // 如果没有连接激活函数块，使用默认值
        const actualActivation = !activationFn ? 'None' : (activationFn === 'none' ? 'None' : `'${activationFn}'`);
        
        if (block.previousConnection.targetBlock()?.type === 'create_model' || block.previousConnection.targetBlock()?.type === 'create_model_img' || block.previousConnection.targetBlock()?.type === 'lstm_create_model') {
            return `layer_defs.append(f"Dense: {${neuralCount}} 单元, 激活: {${actualActivation}}, 输入形状: {input_shape}")
model.add(tf.layers.dense(units=int(${neuralCount}), activation=${actualActivation}, inputShape=input_shape))\n`;
        }
        return `layer_defs.append(f"Dense: {${neuralCount}} 单元, 激活: {${actualActivation}}")
model.add(tf.layers.dense(units=int(${neuralCount}), activation=${actualActivation}))\n`;
    };

    // Conv2D Layer block
    Blockly.defineBlocksWithJsonArray([{
        "type": "conv2d_layer",
        "message0": "卷积层2d kernelSize %1 filters %2 strides %3 激活函数 %4",
        "args0": [
            {
                "type": "input_value",
                "name": "kernel_size",
                "check": "Number"
            },
            {
                "type": "input_value",
                "name": "filters",
                "check": "Number"
            },
            {
                "type": "input_value",
                "name": "strides",
                "check": "Number"
            },
            {
                "type": "input_value",
                "name": "activate_fn"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": LAYER_COLOR
    }]);

    pythonGenerator.forBlock['conv2d_layer'] = function(block) {
        const kernelSize = pythonGenerator.valueToCode(block, 'kernel_size', Order.ATOMIC) || '3';
        const filters = pythonGenerator.valueToCode(block, 'filters', Order.ATOMIC) || '32';
        const strides = pythonGenerator.valueToCode(block, 'strides', Order.ATOMIC) || '1';
        const activationFn = pythonGenerator.valueToCode(block, 'activate_fn', Order.ATOMIC);
        const actualActivation = !activationFn ? 'None' : (activationFn === 'none' ? 'None' : `'${activationFn}'`);

        if (block.previousConnection.targetBlock()?.type === 'create_model' || block.previousConnection.targetBlock()?.type === 'create_model_img') {
            return `layer_defs.append(f"Conv2D: {${filters}} 过滤器, 内核尺寸: {${kernelSize}}, 步长: {${strides}}, 激活: {${actualActivation}}, 输入形状: {[img_height, img_width, 3]}")
model.add(tf.layers.conv2d(
    filters=${filters},
    kernelSize=${kernelSize},
    strides=${strides},
    activation=${actualActivation},
    inputShape=[img_height, img_width, 3]
))\n`;
        }
        return `layer_defs.append(f"Conv2D: {${filters}} 过滤器, 内核尺寸: {${kernelSize}}, 步长: {${strides}}, 激活: {${actualActivation}}")
model.add(tf.layers.conv2d(
    filters=${filters},
    kernelSize=${kernelSize},
    strides=${strides},
    activation=${actualActivation}
))\n`;
    };

    // MaxPooling2D Layer block
    Blockly.defineBlocksWithJsonArray([{
        "type": "max_pooling2d_layer",
        "message0": "最大池化层2d poolSize %1 strides %2",
        "args0": [
            {
                "type": "input_value",
                "name": "pool_size",
                "check": "Number"
            },
            {
                "type": "input_value",
                "name": "strides",
                "check": "Number"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": LAYER_COLOR
    }]);

    pythonGenerator.forBlock['max_pooling2d_layer'] = function(block) {
        const poolSize = pythonGenerator.valueToCode(block, 'pool_size', Order.ATOMIC) || '2';
        const strides = pythonGenerator.valueToCode(block, 'strides', Order.ATOMIC) || '2';
        
        return `layer_defs.append(f"MaxPooling2D: 池化尺寸: {${poolSize}}, 步长: {${strides}}")
model.add(tf.layers.maxPooling2d(
    poolSize=${poolSize},
    strides=${strides}
))\n`;
    };

    // Flatten Layer block
    Blockly.defineBlocksWithJsonArray([{
        "type": "flatten_layer",
        "message0": "平整层 %1",
        "args0": [
            {
                "type": "input_end_row",
                "name": "NAME"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": LAYER_COLOR
    }]);

    pythonGenerator.forBlock['flatten_layer'] = function(block) {
        return `layer_defs.append("Flatten")
model.add(tf.layers.flatten())\n`;
    };

    // LSTM Layer block
    Blockly.defineBlocksWithJsonArray([{
        "type": "lstm_layer",
        "message0": "LSTM层 %1",
        "args0": [
            {
                "type": "input_end_row",
                "name": "NAME"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": LAYER_COLOR
    }]);

    pythonGenerator.forBlock['lstm_layer'] = function(block) {
        return `layer_defs.append("LSTM: sample_len 单元, returnSequences: False")
model.add(tf.layers.lstm(
    units= sample_len,
    returnSequences= False,
    inputShape= [sample_len, 1]
))\n`;
    };
}