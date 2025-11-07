import type * as TmpBlockly from 'blockly'
import type { CodeGenerator } from "blockly";
import { Order } from 'blockly/python'

export function addStarredBlocks(
  Blockly: typeof TmpBlockly,
  pythonGenerator: CodeGenerator,
) {
  const STARRED_COLOR = '#7FB6FF'

  Blockly.defineBlocksWithJsonArray([
    {
      type: 'ast_starred',
      message0: '*%1',
      args0: [{ type: 'input_value', name: 'VALUE' }],
      inputsInline: false,
      output: null,
      colour: STARRED_COLOR
    }
  ])

  pythonGenerator.forBlock['ast_starred'] = function (block: any) {
    let argument1 = pythonGenerator.valueToCode(block, 'VALUE', Order.NONE) || ''
    let code = '*' + argument1
    return [code, Order.NONE]
  }
}
