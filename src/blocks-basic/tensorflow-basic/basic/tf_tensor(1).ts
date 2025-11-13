import type * as TmpBlockly from 'blockly'
import type {BlockDefinition} from "blockly/core/blocks";
import type {CodeGenerator} from "blockly/core/generator";
import {Order} from "blockly/python";

export function addTFTensorV2(blocks: { [key: string]: BlockDefinition; }, pythonGenerator: CodeGenerator, Blockly: typeof TmpBlockly, content: any) {
    blocks["tf_tensor__simple"] = {
        init: function() {
            this.appendValueInput("values").appendField("Tensor");
            this.setInputsInline(false);
            this.setOutput(true, null);
            this.setColour("#7FB6FF");
        },
    };

    pythonGenerator.forBlock["tf_tensor__simple"] = function(block: any) {
        pythonGenerator.definitions_["browser_tf"] = "# 浏览器版本中使用tensorflowjs取代tensorflow\nfrom tensorflow import tf";
        return [`tf.tensor(${pythonGenerator.valueToCode(block, "values", Order.NONE) || 'None'})`, Order.NONE];
    };

    blocks["tf_scalar__simple"] = {
        init: function() {
            this.appendValueInput("values").appendField("scalar");
            this.setInputsInline(false);
            this.setOutput(true, null);
            this.setColour("#7FB6FF");
        },
    };

    pythonGenerator.forBlock["tf_scalar__simple"] = function(block: any) {
        pythonGenerator.definitions_["browser_tf"] = "# 浏览器版本中使用tensorflowjs取代tensorflow\nfrom tensorflow import tf";
        return [`tf.tensor(${pythonGenerator.valueToCode(block, "values", Order.NONE) || 'None'})`, Order.NONE];
    };

    blocks["tf_tensor1d__simple"] = {
        init: function() {
            this.appendValueInput("values").appendField("Tensor 1D");
            this.setInputsInline(false);
            this.setOutput(true, null);
            this.setColour("#7FB6FF");
        },
    };

    pythonGenerator.forBlock["tf_tensor1d__simple"] = function(block: any) {
        pythonGenerator.definitions_["browser_tf"] = "# 浏览器版本中使用tensorflowjs取代tensorflow\nfrom tensorflow import tf";
        return [`tf.tensor(${pythonGenerator.valueToCode(block, "values", Order.NONE) || 'None'})`, Order.NONE];
    };

    blocks["tf_tensor2d__simple"] = {
        init: function() {
            this.appendValueInput("values").appendField("Tensor 2D");
            this.setInputsInline(false);
            this.setOutput(true, null);
            this.setColour("#7FB6FF");
        },
    };

    pythonGenerator.forBlock["tf_tensor2d__simple"] = function(block: any) {
        pythonGenerator.definitions_["browser_tf"] = "# 浏览器版本中使用tensorflowjs取代tensorflow\nfrom tensorflow import tf";
        return [`tf.tensor(${pythonGenerator.valueToCode(block, "values", Order.NONE) || 'None'})`, Order.NONE];
    };

    blocks["tf_tensor3d__simple"] = {
        init: function() {
            this.appendValueInput("values").appendField("Tensor 3D");
            this.setInputsInline(false);
            this.setOutput(true, null);
            this.setColour("#7FB6FF");
        },
    };

    pythonGenerator.forBlock["tf_tensor3d__simple"] = function(block: any) {
        pythonGenerator.definitions_["browser_tf"] = "# 浏览器版本中使用tensorflowjs取代tensorflow\nfrom tensorflow import tf";
        return [`tf.tensor(${pythonGenerator.valueToCode(block, "values", Order.NONE) || 'None'})`, Order.NONE];
    };

    blocks["tf_tensor4d__simple"] = {
        init: function() {
            this.appendValueInput("values").appendField("Tensor 4D");
            this.setInputsInline(false);
            this.setOutput(true, null);
            this.setColour("#7FB6FF");
        },
    };

    pythonGenerator.forBlock["tf_tensor4d__simple"] = function(block: any) {
        pythonGenerator.definitions_["browser_tf"] = "# 浏览器版本中使用tensorflowjs取代tensorflow\nfrom tensorflow import tf";
        return [`tf.tensor(${pythonGenerator.valueToCode(block, "values", Order.NONE) || 'None'})`, Order.NONE];
    };

    blocks["tf_tensor5d__simple"] = {
        init: function() {
            this.appendValueInput("values").appendField("Tensor 5D");
            this.setInputsInline(false);
            this.setOutput(true, null);
            this.setColour("#7FB6FF");
        },
    };

    pythonGenerator.forBlock["tf_tensor5d__simple"] = function(block: any) {
        pythonGenerator.definitions_["browser_tf"] = "# 浏览器版本中使用tensorflowjs取代tensorflow\nfrom tensorflow import tf";
        return [`tf.tensor(${pythonGenerator.valueToCode(block, "values", Order.NONE) || 'None'})`, Order.NONE];
    };
}
