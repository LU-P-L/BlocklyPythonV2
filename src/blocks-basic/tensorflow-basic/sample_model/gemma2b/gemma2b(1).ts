// Copyright 2024 The MediaPipe Authors.

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//      http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// ---------------------------------------------------------------------------------------- //

// import {FilesetResolver, LlmInference} from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai';
import { log4TSProvider } from '@/components/Utils/Logger';
import {FilesetResolver, LlmInference} from '@mediapipe/tasks-genai';
import * as TmpBlockly from "blockly";

const modelFileName = 'data/gemma2b/gemma-2b-it-gpu-int4.bin'; /* Update the file name */

async function buildLlmInference() {
    const genaiFileset = await FilesetResolver.forGenAiTasks('data/gemma2b/wasm');
    // submit.value = 'Loading the model...'
    LlmInference
        .createFromOptions(genaiFileset, {
            baseOptions: {modelAssetPath: modelFileName},
            // maxTokens: 512,  // The maximum number of tokens (input tokens + output
            //                  // tokens) the model handles.
            // randomSeed: 1,   // The random seed used during text generation.
            // topK: 1,  // The number of tokens the model considers at each step of
            //           // generation. Limits predictions to the top k most-probable
            //           // tokens. Setting randomSeed is required for this to make
            //           // effects.
            // temperature:
            //     1.0,  // The amount of randomness introduced during generation.
            //           // Setting randomSeed is required for this to make effects.
        })
        .then(llm => {
            window.tf_exp.llmInference = llm;
        })
        .catch(() => {
            log4TSProvider.getLogger("gemma2b").error('Failed to initialize the task.');
        });
}

export function addGemma2bV2(blocks: typeof TmpBlockly.Blocks, pythonGenerator: TmpBlockly.Generator, Blockly: typeof TmpBlockly, content: any) {
    window.tf_exp = window.tf_exp || {};
    window.tf_exp.ask_gemma2b = function (input: string, output_handle: any) {
        console.log(input);
        if (window.tf_exp.llmInference) {
            window.tf_exp.llmInference.generateResponse(input, output_handle);
        } else {
            alert("尚未加完毕")
        }
    }
    buildLlmInference();
    Blockly.defineBlocksWithJsonArray([
        {
            type: 'tf_exp_gemma2b_model',
            message0: 'Gemma-2B 模型',
            inputsInline: true,
            previousStatement: null,
            nextStatement: null,
            colour: '#7FB6FF'
        }
    ])

    pythonGenerator.forBlock['tf_exp_gemma2b_model'] = function (block: any) {
        return `from js.tf_exp import ask_gemma2b
from pyodide.ffi import to_js
def func(partialResults, complete):
    print(partialResults)
ask_gemma2b("你是谁", to_js(func))
`
    }
}

/**
 * Main function to run LLM Inference.
 */
async function runDemo() {
    const genaiFileset = await FilesetResolver.forGenAiTasks('data/gemma2b/wasm');
    // submit.value = 'Loading the model...'
    LlmInference
        .createFromOptions(genaiFileset, {
            baseOptions: {modelAssetPath: modelFileName},
            // maxTokens: 512,  // The maximum number of tokens (input tokens + output
            //                  // tokens) the model handles.
            // randomSeed: 1,   // The random seed used during text generation.
            // topK: 1,  // The number of tokens the model considers at each step of
            //           // generation. Limits predictions to the top k most-probable
            //           // tokens. Setting randomSeed is required for this to make
            //           // effects.
            // temperature:
            //     1.0,  // The amount of randomness introduced during generation.
            //           // Setting randomSeed is required for this to make effects.
        })
        .then(llm => {
            window.tf_exp.llmInference = llm;
        })
        .catch(() => {
            log4TSProvider.getLogger("gemma2b").error('Failed to initialize the task.');
        });
}

runDemo();