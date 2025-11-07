/**
 * AST bin_op 依据: https://docs.python.org/3/reference/grammar.html#:~:text=default%3F%20%26%27%3A%27%20%0Alambda_param%3A%20NAME-,disjunction,-%3A%0A%20%20%20%20%7C%20conjunction%20(%27or%27%20conjunction
 * bool_op(Boolean operator) 是 bool运算
 * bool运算符含有以下符号：or, and
 *
 * @author ChrisJaunes
 */
import type * as TmpBlockly from 'blockly';
import type { CodeGenerator, Blocks } from 'blockly';
import { Order } from 'blockly/python';

export function addBoolOpBlocksV2(blocks: typeof Blocks, pythonGenerator: CodeGenerator, Blockly: typeof TmpBlockly) {
  let BOOL_OPS_LIST: [string, string, Order][] = [
    ['and', 'And', Order.LOGICAL_AND],
    ['or', 'Or', Order.LOGICAL_OR]
  ]
  let BOOL_OPS_DICT: {
    [key: string]: [string, number]
  } = {}
  BOOL_OPS_LIST.forEach(function (bool_op) {
    BOOL_OPS_DICT[bool_op[1]] = [` ${bool_op[0]} `, bool_op[2]]
  })

  Blockly.defineBlocksWithJsonArray([
    {
      type: 'ast_bool_op',
      message0: '%1 %2 %3',
      args0: [
        { type: 'input_value', name: 'LEFT' },
        { type: 'field_dropdown', name: 'OP', options: BOOL_OPS_LIST },
        { type: 'input_value', name: 'RIGHT' }
      ],
      inputsInline: true,
      output: null,
      colour: '#7FB6FF'
    }
  ])

  pythonGenerator.forBlock['ast_bool_op'] = function (block: any) {
    let tuple = BOOL_OPS_DICT[block.getFieldValue('OP')]
    let operator = tuple[0]
    let order = tuple[1]
    let left = pythonGenerator.valueToCode(block, 'LEFT', order) || `'需要填入表达式'`
    let right = pythonGenerator.valueToCode(block, 'RIGHT', order) || `'需要填入表达式'`
    return [left + operator + right, order]
  }
}
