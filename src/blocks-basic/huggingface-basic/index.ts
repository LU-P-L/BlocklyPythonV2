import type * as TmpBlockly from "blockly";
import { type PyodideGenerator } from "../PyodideGenerator";

import { addObjectDetectionBlocksV2 } from "./ObjectDetection";
import {addImageClassificationBlocksV2} from "./ImageClassification";
import { addDepthEstimationBlocksV2 } from "./Depth";
import {addImageDescriptionBlocksV2} from "./ImageDescription";
import {addImageFeatureBlocksV2} from "./ImageFeature";
import { addImageZeroshotBlocksV2 } from "./ImageZeroshot";
import {addQABlocksV2} from "./QA";
import {addSentenceSimilarityBlocksV2} from "./SentenceSimilarity";
import {addSentimentAnalysisBlocksV2} from "./SentimentAnalysis";
import {addTextContinBlocksV2} from "./TextContin";
import {addTextGenBlocksV2} from "./TextGen";
import {addTranslationBlocksV2} from "./Translation";
import {addSummarizationBlocksV2} from "./Summarization";
import {addZeroshotBlocksV2} from "./Zeroshot";
import {addFillMaskBlocksV2} from "./FillMask";
import {addFeatureExtractionBlocksV2} from "./FeatureExtraction";
import {addCodeGenBlocksV2} from "./CodeGen";
import {addOCRBlocksV2} from "./OCR";
import { env } from '@huggingface/transformers';

const workerScriptUrl = self.location.href; // 获取 Worker 脚本的完整 URL
const urlObj = new URL(workerScriptUrl);
const domainWithProtocolAndPort = `${urlObj.protocol}//${urlObj.host}`;
const onnxWasmWasmPaths = `${domainWithProtocolAndPort}/data/ort-wasm/`

env.useBrowserCache = true;
env.remoteHost = domainWithProtocolAndPort;
env.remotePathTemplate = "data/{model}/";
(env as any).backends.onnx.wasm.wasmPaths = onnxWasmWasmPaths

export function addHuggingfaceBlocksV2(blocks: typeof TmpBlockly.Blocks, pythonGenerator: PyodideGenerator, Blockly: typeof TmpBlockly, content: any) {
    addObjectDetectionBlocksV2(blocks, pythonGenerator, Blockly, content);
    addImageClassificationBlocksV2(blocks, pythonGenerator, Blockly, content);
    addDepthEstimationBlocksV2(blocks, pythonGenerator, Blockly, content);
    addImageDescriptionBlocksV2(blocks, pythonGenerator, Blockly, content);
    addImageFeatureBlocksV2(blocks, pythonGenerator, Blockly, content);
    addImageZeroshotBlocksV2(blocks, pythonGenerator, Blockly, content);
    addQABlocksV2(blocks, pythonGenerator, Blockly, content);
    addSentenceSimilarityBlocksV2(blocks, pythonGenerator, Blockly, content);
    addSentimentAnalysisBlocksV2(blocks, pythonGenerator, Blockly, content);
    addTextContinBlocksV2(blocks, pythonGenerator, Blockly, content);
    addTextGenBlocksV2(blocks, pythonGenerator, Blockly, content);
    addTranslationBlocksV2(blocks, pythonGenerator, Blockly, content);
    addSummarizationBlocksV2(blocks, pythonGenerator, Blockly, content);
    addZeroshotBlocksV2(blocks, pythonGenerator, Blockly, content);
    addFillMaskBlocksV2(blocks, pythonGenerator, Blockly, content);
    addFeatureExtractionBlocksV2(blocks, pythonGenerator, Blockly, content);
    addCodeGenBlocksV2(blocks, pythonGenerator, Blockly, content);
    addOCRBlocksV2(blocks, pythonGenerator, Blockly, content);
}