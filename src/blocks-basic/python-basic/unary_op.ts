/**
 * AST unary op 依据: https://docs.python.org/3/reference/grammar.html#:~:text=term%20%27%40%27%20factor%20%0A%20%20%20%20%7C%20factor-,factor,-%3A%0A%20%20%20%20%7C%20%27%2B%27%20factor%20%0A%20%20%20%20%7C%20%27-%27%20factor%20%0A%20%20%20%20%7C%20%27~%27%20factor
 * 一元操作符
 * @author ChirsJaunes
 */
import type * as TmpBlockly from 'blockly'
import type { Block } from "blockly";
import { Order, type PythonGenerator } from "blockly/python";


export function addUnaryOpBlocks(
  Blockly: typeof TmpBlockly,
  pythonGenerator: PythonGenerator
) {
  let UNARYOPS = [
    ['+', 'uadd'],
    ['-', 'usub'],
    ['not', 'not'],
    ['~', 'invert']
  ]

  UNARYOPS.forEach(function (unaryop) {
    let fullName = `ast_unary_op_${unaryop[1]}`

    Blockly.defineBlocksWithJsonArray([
      {
        type: fullName,
        message0: unaryop[0] + ' %1',
        args0: [{ type: 'input_value', name: 'VALUE' }],
        inputsInline: false,
        colour: '#7FB6FF',
        output: null
      }
    ])

    pythonGenerator.forBlock[fullName] = function (block: Block) {
      let order = unaryop[1] === 'not' ? Order.LOGICAL_NOT : Order.UNARY_SIGN
      let argument = pythonGenerator.valueToCode(block, 'VALUE', order) || '';
      let code = unaryop[0] + (unaryop[1] === 'not' ? ' ' : '') + argument
      return [code, order]
    }
  })
}
