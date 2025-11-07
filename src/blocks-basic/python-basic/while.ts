/**
 * AST While 依据: https://docs.python.org/3/reference/grammar.html#:~:text=else_block%3A%0A%20%20%20%20%7C%20%27else%27%20%27%3A%27%20block-,while_stmt,-%3A%0A%20%20%20%20%7C%20%27while%27%20named_expression%20%27%3A%27%20block
 * 在skulpt中 While 主要包括 test、body、orelse 三个部分
 * @author ChirsJaunes
 */
import type * as TmpBlockly from 'blockly'
import { type Block } from 'blockly';
import { Order, type PythonGenerator } from "blockly/python";

export function addWhileBlocks(
  Blockly: typeof TmpBlockly,
  pythonGenerator: PythonGenerator,
) {
  const WHILE_COLOR = '#7FB6FF'
  const INTRODUCE_MESSAGE = document.createElement('div')
  INTRODUCE_MESSAGE.style.cssText = `
        overflow: scroll;
        `
  INTRODUCE_MESSAGE.innerHTML = `
        <h1> [计小白小课堂] While By ChrisJaunes</h1>
        <hr>
        `
  Blockly.Blocks['ast_while'] = {
    init: function () {
      this.jsonInit({
        message0: '介绍 %1',
        args0: [{ type: 'input_dummy', name: 'Introduction' }],
        message1: 'While %1',
        args1: [{ type: 'input_value', name: 'TEST' }],
        message2: 'do %1',
        args2: [{ type: 'input_statement', name: 'BODY' }],
        inputsInline: false,
        previousStatement: null,
        nextStatement: null,
        colour: WHILE_COLOR,
        extensions: ['basic_introduction_extension']
      })
      this.orelse_ = false
      this.INTRODUCE_MESSAGE = INTRODUCE_MESSAGE
      this.updateShape_()
    },
    mutationToDom: function () {
      let container = document.createElement('mutation')
      container.setAttribute('or_else', this.orelse_)
      return container
    },
    domToMutation: function (xmlElement: any) {
      this.orelse_ = xmlElement.getAttribute('or_else') === 'true'
      this.updateShape_()
    },
    saveExtraState: function() {
      return { 'orelse_': this.orelse_ };
    },
    loadExtraState: function(state: any) {
      this.orelse_ = state['orelse_'];
      this.updateShape_();
    },
    updateShape_: function () {
      if (this.getInput('OR_ELSE_TEST')) {
        this.removeInput('OR_ELSE_TEST')
        this.removeInput('OR_ELSE_BODY')
      }
      if (this.orelse_) {
        this.appendDummyInput('OR_ELSE_TEST').appendField('else:')
        this.appendStatementInput('OR_ELSE_BODY').setCheck(null)
      }
    }
  }

  pythonGenerator.forBlock['ast_while'] = function (block: Block) {
    let test = pythonGenerator.valueToCode(block, 'TEST', Order.NONE) || 'False'
    let body = pythonGenerator.statementToCode(block, 'BODY') || pythonGenerator.PASS
    let orelse = ''
    if (this.orelse_) {
      orelse =
        'else:\n' + (pythonGenerator.statementToCode(block, 'OR_ELSE_BODY') || pythonGenerator.PASS)
    }
    return 'while ' + test + ' :\n' + body + orelse
  }
}
