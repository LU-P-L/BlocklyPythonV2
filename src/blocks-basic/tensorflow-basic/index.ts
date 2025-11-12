import type * as TmpBlockly from 'blockly'
import { type PyodideGenerator } from "../PyodideGenerator";


import { addTFLayersDenseV2 } from "./basic/tf_layers_dense";
import {addTFTensorV2} from "@/blocks-basic/tensorflow-basic/basic/tf_tensor";
import {addTFSequentialV2} from "@/blocks-basic/tensorflow-basic/basic/tf_sequential";
import {addTFLayersConv2V2} from "@/blocks-basic/tensorflow-basic/convolutional/tf_layers_conv2d";
import {addKNNBlocksV2} from "./KNN";
import {addCNNBlocksV2} from "./CNN";
import {addLayerBlocksV2} from "./Layer";
import {addLossBlocksV2} from "./Loss";
import {addRegressionBlocksV2} from "./Regression";
import {addLSTMBlocksV2} from "./LSTM";
import {addFCImageClassificationBlocks} from "./FCImageClassification";

// import { addTFLayersFlatten } from "./basic/tf_layers_flatten";
// import {addTFLayersConv2d} from "@/blocks/tensorflow-basic/convolutional/tf_layers_conv2d";
// import {addTFDatasetBostonHousing} from "@/blocks/tensorflow-basic/dataset/boston_housing";
// import {addTFDatasetMinist} from "@/blocks/tensorflow-basic/dataset/mnist_data";
// import {addTFDatasetReuters} from "@/blocks/tensorflow-basic/dataset/reuters";
// import {addTFDatasetReutersWordIndex} from "@/blocks/tensorflow-basic/dataset/reuters_word_index";
// import {addTFLayersMaxPooling2d} from "@/blocks/tensorflow-basic/pooling/tf_layers_maxpooling2d";

// import "./convolutional/tf_layers_conv2d";
// import "./sample_model/mnist_v1";
// import "./sample_model/mnist_v2";
// import "./dataset/mnist_data";
// import "./dataset/boston_housing";
// import "./sample_model/boston_housing_v1";
// import "./sample_model/boston_housing_v2";
// import "./dataset/tf_keras_datasets";
// // 新闻标签多分类
// import "./dataset/reuters";
// import "./dataset/reuters_word_index";
// import "./sample_model/reuters_v1";

export function addTensorflowBasicBlocks(Blockly: any, pythonGenerator: any, workspaceSvg: any) {
    // addTFLayersFlatten(Blockly, pythonGenerator, workspaceSvg);
    // addTFLayersConv2d(Blockly, pythonGenerator, workspaceSvg);
    // addTFDatasetBostonHousing(Blockly, pythonGenerator, workspaceSvg);
    // addTFDatasetMinist(Blockly, pythonGenerator, workspaceSvg);
    // addTFDatasetReuters(Blockly, pythonGenerator, workspaceSvg);
    // addTFDatasetReutersWordIndex(Blockly, pythonGenerator, workspaceSvg);
    // addTFLayersMaxPooling2d(Blockly, pythonGenerator, workspaceSvg);
}

export function addTensorflowBasicBlocksV2(blocks: typeof TmpBlockly.Blocks, pythonGenerator: PyodideGenerator, Blockly: typeof TmpBlockly, content: any) {
    addTFLayersDenseV2(blocks, pythonGenerator, Blockly, content);
    addTFLayersConv2V2(blocks, pythonGenerator, Blockly, content);
    addTFTensorV2(blocks, pythonGenerator, Blockly, content);
    addTFSequentialV2(blocks, pythonGenerator, Blockly, content);
    addKNNBlocksV2(blocks, pythonGenerator, Blockly, content);
    addCNNBlocksV2(blocks, pythonGenerator, Blockly, content);
    addLayerBlocksV2(blocks, pythonGenerator, Blockly, content);
    addLossBlocksV2(blocks, pythonGenerator, Blockly, content);
    addRegressionBlocksV2(blocks, pythonGenerator, Blockly, content);
    addLSTMBlocksV2(blocks, pythonGenerator, Blockly, content);
    addFCImageClassificationBlocks(blocks, pythonGenerator, Blockly, content);
}