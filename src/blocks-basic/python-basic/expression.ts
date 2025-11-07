/**
 * AST expression依据:https://docs.python.org/3/reference/grammar.html#:~:text=expression%20)%2B%20%5B%27%2C%27%5D%20%0A%20%20%20%20%7C%20expression%20%27%2C%27%20%0A%20%20%20%20%7C%20expression-,expression,-%3A%0A%20%20%20%20%7C%20disjunction%20%27if%27%20disjunction
 * @author ChirsJaunes
 */
export function addExpressionBlocks(Blockly: any, pythonGenerator: any, workspaceSvg: any) {
  Blockly.defineBlocksWithJsonArray([
    {
      type: 'ast_expr',
      message0: 'Expr %1',
      args0: [{ type: 'input_value', name: 'VALUE' }],
      inputsInline: false,
      previousStatement: null,
      nextStatement: null,
      colour: '#7FB6FF'
    }
  ])
  pythonGenerator.forBlock['ast_expr'] = function (block: any) {
    let value =
      pythonGenerator.valueToCode(block, 'VALUE', pythonGenerator.ORDER_ATOMIC) ||
      pythonGenerator.blank
    return value + '\n'
  }
}
