/**
 * AST break 依据: https://docs.python.org/3/reference/grammar.html#:~:text=throw%20a%20SyntaxError.-,simple_stmt,-%3A%0A%20%20%20%20%7C%20assignment%0A%20%20%20%20%7C%20star_expressions%20%0A%20%20%20%20%7C%20return_stmt
 * break 是一个终结符，是个Terminal Node
 *
 * @author ChrisJaunes
 */
import type * as TmpBlockly from "blockly";
import type { CodeGenerator } from 'blockly'

export function addBreakBlocks(Blockly: typeof TmpBlockly, pythonGenerator: CodeGenerator) {
  Blockly.defineBlocksWithJsonArray([
    {
      type: 'ast_break',
      message0: 'break',
      inputsInline: false,
      previousStatement: null,
      nextStatement: null,
      colour: '#7FB6FF'
    }
  ])

  pythonGenerator.forBlock['ast_break'] = function () {
    return 'break\n'
  }
}
