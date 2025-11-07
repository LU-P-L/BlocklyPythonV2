/**
 * @license
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

import * as TmpBlockly from "blockly";

import { QuestionAndAnswerImpl} from './v1_question_and_answer';

export function addQnaV2(blocks: typeof TmpBlockly.Blocks, pythonGenerator: TmpBlockly.Generator, Blockly: typeof TmpBlockly, content: any) {
    window.tf_exp = window.tf_exp || {};
    window.tf_exp.qna_mobile_bert = window.tf_exp.qna_mobile_bert || new QuestionAndAnswerImpl({modelUrl: "data/mobilebert-tfjs-mobilebert-v1", fromTFHub: true});
    Blockly.defineBlocksWithJsonArray([
        {
            type: 'tf_exp_qna_model',
            message0: 'mobilebert ',
            inputsInline: true,
            previousStatement: null,
            nextStatement: null,
            colour: '#7FB6FF'
        }
    ])

    pythonGenerator.forBlock['tf_exp_qna_model'] = function (block: any) {
        return `from js.tf_exp import qna_mobile_bert
await qna_mobile_bert.load()
print("模型加载完成")
answer = await qna_mobile_bert.findAnswers("who are you", "i am hjj")
print("问答结果", answer.to_py())
`
    }
}