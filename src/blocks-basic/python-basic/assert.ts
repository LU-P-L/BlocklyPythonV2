/**
 * AST assert 依据: https://docs.python.org/3/reference/grammar.html#:~:text=NAME%2B%20%0A%0Ayield_stmt%3A%20yield_expr-,assert_stmt,-%3A%20%27assert%27%20expression%20%5B%27%2C%27%20expression
 *
 * @author ChrisJaunes
 */
import type * as TmpBlockly from 'blockly'
import type { CodeGenerator } from 'blockly'
import { Order } from 'blockly/python'

export function addAssertBlocks(Blockly: typeof TmpBlockly, pythonGenerator: CodeGenerator) {
  Blockly.defineBlocksWithJsonArray([
    {
      type: 'ast_assert',
      message0: 'assert 条件：%1 消息：%2',
      args0: [
        { type: 'input_value', name: 'TEST' },
        { type: 'input_value', name: 'MSG' }
      ],
      inputsInline: true,
      previousStatement: null,
      nextStatement: null,
      colour: '#7FB6FF'
    }
  ])

  pythonGenerator.forBlock['ast_assert'] = function (block: any) {
    let test = pythonGenerator.valueToCode(block, 'TEST', Order.ATOMIC) || 'True'
    let msg = pythonGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || '这里有一个断言'
    return `assert ${test}, ${msg}\n`
  }
}
