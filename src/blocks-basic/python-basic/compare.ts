/**
 * AST comparison 依据: https://docs.python.org/3/reference/grammar.html#:~:text=not%27%20inversion%20%0A%20%20%20%20%7C%20comparison-,comparison,-%3A%0A%20%20%20%20%7C%20bitwise_or%20compare_op_bitwise_or_pair%2B%20%0A%20%20%20%20%7C%20bitwise_or
 *
 * @author ChrisJaunes
 */
import type * as TmpBlockly from 'blockly'
import type { Blocks, CodeGenerator } from 'blockly'
import { Order } from 'blockly/python'


export function addCompareBlocksV2(blocks: typeof Blocks, pythonGenerator: CodeGenerator, Blockly: typeof TmpBlockly) {
  let COMPARES_LIST = [
    ['==', 'Eq'],
    ['!=', 'NotEq'],
    ['<', 'Lt'],
    ['<=', 'LtE'],
    ['>', 'Gt'],
    ['>=', 'GtE'],
    ['is', 'Is'],
    ['is not', 'IsNot'],
    ['in', 'In'],
    ['not in', 'NotIn']
  ]

  let COMPARES_DICT: {
    [key: string]: string
  } = {}
  COMPARES_LIST.forEach(function (compares) {
    COMPARES_DICT[compares[1]] = compares[0]
  })

  Blockly.defineBlocksWithJsonArray([
    {
      type: 'ast_compare',
      message0: '%1 %2 %3',
      args0: [
        { type: 'input_value', name: 'LEFT' },
        { type: 'field_dropdown', name: 'OP', options: COMPARES_LIST },
        { type: 'input_value', name: 'RIGHT' }
      ],
      inputsInline: true,
      output: null,
      colour: '#7FB6FF'
    }
  ])

  pythonGenerator.forBlock['ast_compare'] = function (block: any) {
    let tuple = COMPARES_DICT[block.getFieldValue('OP')]
    let operator = ' ' + tuple + ' '
    let order = Order.RELATIONAL
    let left = pythonGenerator.valueToCode(block, 'LEFT', order) || `'需要填入表达式'`
    let right = pythonGenerator.valueToCode(block, 'RIGHT', order) || `'需要填入表达式'`
    let code = left + operator + right
    return [code, order]
  }
}
