import type * as TmpBlockly from 'blockly'
import type { CodeGenerator } from "blockly";
import { Order } from 'blockly/python';

export function addReturnBlocks(
  Blockly: typeof TmpBlockly,
  pythonGenerator: CodeGenerator,
) {
  Blockly.defineBlocksWithJsonArray([
    {
      type: 'ast_return_full',
      message0: 'return %1',
      args0: [{ type: 'input_value', name: 'VALUE' }],
      inputsInline: true,
      previousStatement: null,
      nextStatement: null,
      colour: '#7FB6FF'
    },
    {
      type: 'ast_return',
      message0: 'return',
      inputsInline: true,
      previousStatement: null,
      nextStatement: null,
      colour: '#7FB6FF'
    }
  ])

  pythonGenerator.forBlock['ast_return'] = function (block: any) {
    return 'return\n'
  }

  pythonGenerator.forBlock['ast_return_full'] = function (block: any) {
    let value = pythonGenerator.valueToCode(block, 'VALUE', Order.ATOMIC)
    return 'return ' + value + '\n'
  }
}
