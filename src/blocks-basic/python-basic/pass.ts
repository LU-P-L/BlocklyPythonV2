import type * as TmpBlockly from 'blockly'
import type { CodeGenerator } from "blockly";

export function addPassBlocks(
  Blockly: typeof TmpBlockly,
  pythonGenerator: CodeGenerator,
) {
  Blockly.defineBlocksWithJsonArray([
    {
      type: 'ast_pass',
      message0: 'pass',
      inputsInline: false,
      previousStatement: null,
      nextStatement: null,
      colour: '#7FB6FF'
    }
  ])

  pythonGenerator.forBlock['ast_pass'] = function () {
    return 'pass\n'
  }
}
