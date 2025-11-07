import * as TmpBlockly from 'blockly'
import type { CodeGenerator } from "blockly/core/generator"
import { Order } from 'blockly/python'

const LOSS_COLOR = 90;

export function addLossBlocksV2(blocks: typeof TmpBlockly.Blocks, pythonGenerator: CodeGenerator, Blockly: typeof TmpBlockly, content: any) {
    // MSE Loss block
    Blockly.defineBlocksWithJsonArray([{
        "type": "mse",
        "message0": "最小二乘法 %1",
        "args0": [
            {
                "type": "input_end_row",
                "name": "NAME"
            }
        ],
        "previousStatement": null,
        "colour": LOSS_COLOR
    }]);

    pythonGenerator.forBlock['mse'] = function(block) {
        return 'mean_squared_error';
    };

    // Categorical Crossentropy Loss block
    Blockly.defineBlocksWithJsonArray([{
        "type": "categorical_crossentropy",
        "message0": "分类交叉熵 %1",
        "args0": [
            {
                "type": "input_end_row",
                "name": "NAME"
            }
        ],
        "previousStatement": null,
        "colour": LOSS_COLOR
    }]);

    pythonGenerator.forBlock['categorical_crossentropy'] = function(block) {
        return 'log_loss';
    };

    // Activation Function block
    Blockly.defineBlocksWithJsonArray([{
        "type": "activate_function",
        "message0": "%1",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "func",
                "options": [
                    ["none", "none"],
                    ["sigmoid", "sigmoid"],
                    ["relu", "relu"],
                    ["softmax", "softmax"]
                ]
            }
        ],
        "output": null,
        "colour": LOSS_COLOR
    }]);

    pythonGenerator.forBlock['activate_function'] = function(block) {
        const func = block.getFieldValue('func');
        return [func, Order.ATOMIC];  // 修改返回格式，使用数组形式返回值和优先级
    };
}