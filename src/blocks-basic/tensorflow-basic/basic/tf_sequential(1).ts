import type * as TmpBlockly from 'blockly'
import type {BlockDefinition} from "blockly/core/blocks";
import type {CodeGenerator} from "blockly/core/generator";
import {Order} from "blockly/python";

export function addTFSequentialV2(blocks: { [key: string]: BlockDefinition; }, pythonGenerator: CodeGenerator, Blockly: typeof TmpBlockly, content: any) {
    blocks["tf_sequential__empty"] = {
        init: function() {
            this.appendDummyInput("序列").appendField("TF 模型序列");
            this.setInputsInline(false);
            this.setOutput(true, null);
            this.setColour("#7FB6FF");
        },
    };

    pythonGenerator.forBlock["tf_sequential__empty"] = function(block: any) {
        pythonGenerator.definitions_["browser_tf"] = "# 浏览器版本中使用tensorflowjs取代tensorflow\nfrom tensorflow import tf";
        return [`tf.sequential()`, Order.NONE];
    };

}
