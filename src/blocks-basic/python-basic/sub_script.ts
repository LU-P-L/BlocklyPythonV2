import type * as TmpBlockly from 'blockly'
import type { CodeGenerator } from "blockly";
import { Order } from 'blockly/python'

export function addSubScriptBlocks(
  Blockly: typeof TmpBlockly,
  pythonGenerator: CodeGenerator,
) {
  const SUB_SCRIPT_COLOR = '#7FB6FF'

  Blockly.Blocks['ast_sub_script'] = {
    init: function () {
      this.setInputsInline(true)
      this.setOutput(true)
      this.sliceKinds_ = ['I']
      this.setColour(SUB_SCRIPT_COLOR)
      this.appendValueInput('VALUE').setCheck(null)
      this.appendDummyInput('OPEN_BRACKET').appendField('[')
      this.appendDummyInput('CLOSE_BRACKET').appendField(']')
      this.updateShape_()
    },
    setExistence: function (label: any, exist: any, isDummy: any) {
      if (exist && !this.getInput(label)) {
        if (isDummy) {
          return this.appendDummyInput(label)
        } else {
          return this.appendValueInput(label)
        }
      } else if (!exist && this.getInput(label)) {
        this.removeInput(label)
      }
      return null
    },
    createSlice_: function (i: any, kind: any) {
      let input = this.setExistence('COMMA' + i, i !== 0, true)
      if (input) {
        input.appendField(',')
      }
      let isIndex = kind.charAt(0) === 'I'
      input = this.setExistence('INDEX' + i, isIndex, false)
      input = this.setExistence('SLICELOWER' + i, !isIndex && kind.charAt(1) === '1', false)
      input = this.setExistence('SLICECOLON' + i, !isIndex, true)
      if (input) {
        input.appendField(':').setAlign(Blockly.inputs.Align.RIGHT)
      }
      input = this.setExistence('SLICEUPPER' + i, !isIndex && kind.charAt(2) === '1', false)
      input = this.setExistence('SLICESTEP' + i, !isIndex && kind.charAt(3) === '1', false)
      if (input) {
        input.appendField(':').setAlign(Blockly.inputs.Align.RIGHT)
      }
    },
    updateShape_: function () {
      let i = 0
      for (; i < this.sliceKinds_.length; i++) {
        this.createSlice_(i, this.sliceKinds_[i])
      }

      for (let j = 0; j < i; j++) {
        if (j !== 0) {
          this.moveInputBefore('COMMA' + j, 'CLOSE_BRACKET')
        }
        let kind = this.sliceKinds_[j]
        if (kind.charAt(0) === 'I') {
          this.moveInputBefore('INDEX' + j, 'CLOSE_BRACKET')
        } else {
          if (kind.charAt(1) === '1') {
            this.moveInputBefore('SLICELOWER' + j, 'CLOSE_BRACKET')
          }
          this.moveInputBefore('SLICECOLON' + j, 'CLOSE_BRACKET')
          if (kind.charAt(2) === '1') {
            this.moveInputBefore('SLICEUPPER' + j, 'CLOSE_BRACKET')
          }
          if (kind.charAt(3) === '1') {
            this.moveInputBefore('SLICESTEP' + j, 'CLOSE_BRACKET')
          }
        }
      }
      // Remove deleted inputs.
      while (this.getInput('TARGET' + i) || this.getInput('SLICECOLON')) {
        this.removeInput('COMMA' + i, true)
        if (this.getInput('INDEX' + i)) {
          this.removeInput('INDEX' + i)
        } else {
          this.removeInput('SLICELOWER' + i, true)
          this.removeInput('SLICECOLON' + i, true)
          this.removeInput('SLICEUPPER' + i, true)
          this.removeInput('SLICESTEP' + i, true)
        }
        i++
      }
    },
    mutationToDom: function () {
      let container = document.createElement('mutation')
      for (let i = 0; i < this.sliceKinds_.length; i++) {
        let parameter = document.createElement('arg')
        parameter.setAttribute('name', this.sliceKinds_[i])
        container.appendChild(parameter)
      }
      return container
    },
    domToMutation: function (xmlElement: any) {
      this.sliceKinds_ = []
      // eslint-disable-next-line no-cond-assign
      for (let i = 0, childNode; (childNode = xmlElement.childNodes[i]); i++) {
        if (childNode.nodeName.toLowerCase() === 'arg') {
          this.sliceKinds_.push(childNode.getAttribute('name'))
        }
      }
      this.updateShape_()
    },
    saveExtraState: function() {
      return { 'slice_kinds': this.sliceKinds_ };
    },
    loadExtraState: function(state: any) {
      this.sliceKinds_ = state['slice_kinds'];
      this.updateShape_();
    },
  }

  pythonGenerator.forBlock['ast_sub_script'] = function (block: any) {
    let value = pythonGenerator.valueToCode(block, 'VALUE', Order.MEMBER) || '';
    let slices = new Array(block.sliceKinds_.length)
    for (let i = 0; i < block.sliceKinds_.length; i++) {
      let kind = block.sliceKinds_[i]
      if (kind.charAt(0) === 'I') {
        slices[i] =
          pythonGenerator.valueToCode(block, 'INDEX' + i, Order.MEMBER) || '';
      } else {
        slices[i] = ''
        if (kind.charAt(1) === '1') {
          slices[i] += pythonGenerator.valueToCode(block, 'SLICELOWER' + i, Order.MEMBER) || '';
        }
        slices[i] += ':'
        if (kind.charAt(2) === '1') {
          slices[i] += pythonGenerator.valueToCode(block, 'SLICEUPPER' + i, Order.MEMBER) || '';
        }
        if (kind.charAt(3) === '1') {
          slices[i] += ':' + pythonGenerator.valueToCode(block, 'SLICESTEP' + i, Order.MEMBER) || '';
        }
      }
    }
    let code = value + '[' + slices.join(', ') + ']'
    return [code, Order.MEMBER]
  }
}
