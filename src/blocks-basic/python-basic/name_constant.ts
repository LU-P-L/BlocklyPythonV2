import type * as TmpBlockly from 'blockly'
import type { CodeGenerator } from "blockly";
import { Order } from 'blockly/python';

export function addNameConstantBlocks(
  Blockly: typeof TmpBlockly,
  pythonGenerator: CodeGenerator,
) {
  Blockly.defineBlocksWithJsonArray([
    {
      type: 'ast_NameConstantNone',
      message0: 'None',
      args0: [],
      output: 'None',
      colour: '#7FB6FF'
    },
    {
      type: 'ast_NameConstantBoolean',
      message0: '%1',
      args0: [
        {
          type: 'field_dropdown',
          name: 'BOOL',
          options: [
            ['True', 'TRUE'],
            ['False', 'FALSE']
          ]
        }
      ],
      output: 'Boolean',
      colour: '#7FB6FF'
    }
  ])

  pythonGenerator.forBlock['ast_NameConstantBoolean'] = function (block: any) {
    // Boolean values true and false.
    let code = block.getFieldValue('BOOL') === 'TRUE' ? 'True' : 'False'
    return [code, Order.ATOMIC]
  }

  pythonGenerator.forBlock['ast_NameConstantNone'] = function (block: any) {
    // Boolean values true and false.
    let code = 'None'
    return [code, Order.ATOMIC]
  }
}
