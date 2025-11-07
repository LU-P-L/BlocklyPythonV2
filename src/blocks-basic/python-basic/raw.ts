/**
 * @author ChirsJaunes
 */
import type * as TmpBlockly from 'blockly'
import type { CodeGenerator } from "blockly";

export function addRawBlocks(
  Blockly: typeof TmpBlockly,
  pythonGenerator: CodeGenerator,
) {
  Blockly.defineBlocksWithJsonArray([
    {
      type: 'ast_raw',
      message0: '代码块: %1 %2',
      args0: [{ type: 'input_dummy' }, { type: 'field_multilinetext', name: 'TEXT', value: '' }],
      previousStatement: null,
      nextStatement: null,
      colour: '#7FB6FF'
    }
  ])

  pythonGenerator.forBlock['ast_raw'] = function (block: any) {
    return block.getFieldValue('TEXT') + '\n'
  }
}
