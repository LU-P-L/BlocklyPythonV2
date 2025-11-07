import type * as TmpBlockly from "blockly";
import type { Blocks, CodeGenerator } from "blockly";
import { Order } from "blockly/python";

export function addIfBlocksV2(blocks: typeof Blocks, pythonGenerator: CodeGenerator, Blockly: typeof TmpBlockly, content: any) {
  Blockly.Blocks['ast_if'] = {
    init: function () {
      this.orelse_ = 0
      this.elifs_ = 0
      this.appendValueInput('TEST').appendField('if')
      this.appendStatementInput('BODY').setCheck(null).setAlign(Blockly.inputs.Align.RIGHT)
      this.setInputsInline(false)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.updateShape_()
      this.setColour('#7FB6FF')
    },
    updateShape_: function () {
      let i = 0
      for (; i < this.elifs_; i++) {
        if (!this.getInput('ELIF' + i)) {
          this.appendValueInput('ELIFTEST' + i).appendField('elif')
          this.appendStatementInput('ELIFBODY' + i).setCheck(null)
        }
      }
      while (this.getInput('ELIFTEST' + i)) {
        this.removeInput('ELIFTEST' + i)
        this.removeInput('ELIFBODY' + i)
        i++
      }
      if (this.orelse_ && !this.getInput('ELSE')) {
        this.appendDummyInput('ORELSETEST').appendField('else:')
        this.appendStatementInput('ORELSEBODY').setCheck(null)
      } else if (!this.orelse_ && this.getInput('ELSE')) {
        this.removeInput('ORELSETEST')
        this.removeInput('ORELSEBODY')
      }

      for (i = 0; i < this.elifs_; i++) {
        if (this.orelse_) {
          this.moveInputBefore('ELIFTEST' + i, 'ORELSETEST')
          this.moveInputBefore('ELIFBODY' + i, 'ORELSETEST')
        } else if (i + 1 < this.elifs_) {
          this.moveInputBefore('ELIFTEST' + i, 'ELIFTEST' + (i + 1))
          this.moveInputBefore('ELIFBODY' + i, 'ELIFBODY' + (i + 1))
        }
      }
    },
    mutationToDom: function () {
      let container = document.createElement('mutation')
      container.setAttribute('orelse', this.orelse_)
      container.setAttribute('elifs', this.elifs_)
      return container
    },
    domToMutation: function (xmlElement: any) {
      this.orelse_ = xmlElement.getAttribute('orelse') === 'true'
      this.elifs_ = parseInt(xmlElement.getAttribute('elifs'), 10) || 0
      this.updateShape_()
    },
    saveExtraState: function() {
      return { 'orelse': this.orelse_, "elifs": this.elifs_};
    },
    loadExtraState: function(state: any) {
      this.orelse_ = state['orelse'];
      this.elifs_ = state['elifs'];
      this.updateShape_();
    },
  }
  pythonGenerator.forBlock['ast_if'] = function (block: any) {
    let test =
      'if ' +
      (pythonGenerator.valueToCode(block, 'TEST',Order.NONE) || `True`) +
      ':\n'
    let body = pythonGenerator.statementToCode(block, 'BODY') || `PASS`
    let elifs = new Array(block.elifs_)
    for (let i = 0; i < block.elifs_; i++) {
      let elif = block.elifs_[i]
      let clause =
        'elif ' +
        (pythonGenerator.valueToCode(block, 'ELIFTEST' + i, Order.NONE) ||
         `True`)
      clause +=
        ':\n' + (pythonGenerator.statementToCode(block, 'ELIFBODY' + i) || `PASS`)
      elifs[i] = clause
    }
    let orelse = ''
    if (this.orelse_) {
      orelse =
        'else:\n' + (pythonGenerator.statementToCode(block, 'ORELSEBODY') || `PASS`)
    }
    return test + body + elifs.join('') + orelse
  }
}
