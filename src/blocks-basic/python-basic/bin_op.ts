/**
 * AST bin_op 依据: https://docs.python.org/3/reference/grammar.html#:~:text=is_bitwise_or%3A%20%27is%27%20bitwise_or-,bitwise_or,-%3A%0A%20%20%20%20%7C%20bitwise_or%20%27%7C%27%20bitwise_xor%20%0A%20%20%20%20%7C%20bitwise_xor
 * bin_op(Binary operator) 是 二元运算而不是二进制运算
 * 二元运算符含有以下符号：+, -, *, /, %, **, //, <<, >>, |, ^, &, @
 *
 * @author ChrisJaunes
 */
import type * as TmpBlockly from 'blockly'
import type { CodeGenerator, Blocks } from 'blockly';
import { Order } from 'blockly/python'


export function addBinOpBlocksV2(blocks: typeof Blocks, pythonGenerator: CodeGenerator, Blockly: typeof TmpBlockly) {
  let BIN_OPS_LIST: [string, string, Order][] = [
    ['+', 'Add', Order.ADDITIVE],
    ['-', 'Sub', Order.ADDITIVE],
    ['*', 'Mult', Order.MULTIPLICATIVE],
    ['/', 'Div', Order.MULTIPLICATIVE],
    ['%', 'Mod', Order.MULTIPLICATIVE],
    ['**', 'Pow', Order.EXPONENTIATION],
    ['//', 'FloorDiv', Order.MULTIPLICATIVE],
    ['<<', 'LShift', Order.BITWISE_SHIFT],
    ['>>', 'RShift', Order.BITWISE_SHIFT],
    ['|', 'BitOr', Order.BITWISE_OR],
    ['^', 'BitXor', Order.BITWISE_XOR],
    ['&', 'BitAnd', Order.BITWISE_AND],
    ['@', 'MatMult', Order.MULTIPLICATIVE]
  ]

  let BIN_OPS_DICT: {
    [key: string]: [string, number]
  } = {}
  BIN_OPS_LIST.forEach(function (binop: any[]) {
    BIN_OPS_DICT[binop[1]] = [` ${binop[0]} `, binop[2]]
  })

  Blockly.defineBlocksWithJsonArray([
    {
      type: 'ast_bin_op',
      message0: '%1 %2 %3',
      args0: [
        { type: 'input_value', name: 'LEFT' },
        { type: 'field_dropdown', name: 'OP', options: BIN_OPS_LIST },
        { type: 'input_value', name: 'RIGHT' }
      ],
      inputsInline: true,
      output: null,
      colour: '#7FB6FF'
    }
  ])

  pythonGenerator.forBlock['ast_bin_op'] = function (block: any) {
    let tuple = BIN_OPS_DICT[block.getFieldValue('OP')]
    let operator = tuple[0]
    let order = tuple[1]
    let left = pythonGenerator.valueToCode(block, 'LEFT', order) || '本处需要表达式'
    let right = pythonGenerator.valueToCode(block, 'RIGHT', order) || '本处需要表达式'
    return [left + operator + right, order]
  }
}
