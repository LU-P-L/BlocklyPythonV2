import type * as TmpBlockly from "blockly";

import { addLinearRegressionBlocks } from './linear_regression/linear_regression'
import { addAdditionRnnBlocks } from './rnn/addition_rnn_v2'
// mnist
import {addTFDatasetMinistV2} from "./mnist/mnist_data";
import {addTFExampleMnistV1 } from "./mnist/mnist_v1";
import {addTFExampleMnistV2} from "./mnist/mnist_v2";
import {addMnistBlocks, addTFExampleMnistV3} from './mnist/mnist_v3'
import { addFashionMnistBlocks } from './fashion_mnist/fashion_mnist';
import { addFashionMnistBlocks2 } from './fashion_mnist/fashion_mnist2';
import { addText_classifiBlocks } from './text_classifi/text _classifi';
import {addTFExampleReutersV2} from "@/blocks-basic/tensorflow-basic/sample_model/reuters/reuters_v1";
import {addQnaV2} from "@/blocks-basic/tensorflow-basic/sample_model/qna";
import {addGemma2bV2} from "@/blocks-basic/tensorflow-basic/sample_model/gemma2b/gemma2b";

export function addTensorflowBlocks(Blockly: any, pythonGenerator: any, workspaceSvg: any) {
  addLinearRegressionBlocks(Blockly, pythonGenerator, workspaceSvg)
  addAdditionRnnBlocks(Blockly, pythonGenerator, workspaceSvg)
  addMnistBlocks(Blockly, pythonGenerator, workspaceSvg)
  addFashionMnistBlocks(Blockly, pythonGenerator, workspaceSvg)
  addFashionMnistBlocks2(Blockly, pythonGenerator, workspaceSvg)
  addText_classifiBlocks(Blockly, pythonGenerator, workspaceSvg)
}
export function addTensorflowExampleBlocksV2(blocks: typeof TmpBlockly.Blocks, pythonGenerator: TmpBlockly.Generator, Blockly: typeof TmpBlockly, content: any) {
  addTFDatasetMinistV2(blocks, pythonGenerator, Blockly, content);
  addTFExampleMnistV1(blocks, pythonGenerator, Blockly, content);
  addTFExampleMnistV2(blocks, pythonGenerator, Blockly, content);
  addTFExampleMnistV3(blocks, pythonGenerator, Blockly, content);
  addTFExampleReutersV2(blocks, pythonGenerator, Blockly, content);
  addQnaV2(blocks, pythonGenerator, Blockly, content);
  addGemma2bV2(blocks, pythonGenerator, Blockly, content);
 // addFashionMnistBlocks(Blockly, pythonGenerator,Blockly, content)
}
