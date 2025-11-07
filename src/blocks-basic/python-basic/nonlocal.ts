import type * as TmpBlockly from 'blockly';
import { inputs } from 'blockly';
import { type PythonGenerator } from 'blockly/python';

export function addNonlocalBlocks(Blockly: typeof TmpBlockly, pythonGenerator: PythonGenerator) {
  let NONLOCAL_COLOR = '#7FB6FF'
  Blockly.Blocks['ast_nonlocal'] = {
    init: function () {
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.nameCount_ = 1
      this.setColour(NONLOCAL_COLOR)
      this.appendDummyInput('NONLOCAL').appendField('make nonlocal', 'START_NONLOCALS')
      this.updateShape_()
    },
    updateShape_: function () {
      let input = this.getInput('NONLOCAL')
      // Update pluralization
      if (this.getField('START_NONLOCALS')) {
        this.setFieldValue(
          this.nameCount_ > 1 ? 'make nonlocals' : 'make nonlocal',
          'START_NONLOCALS'
        )
      }
      // Update fields
      let i = 0
      for (; i < this.nameCount_; i++) {
        if (!this.getField('NAME' + i)) {
          if (i !== 0) {
            input.appendField(',').setAlign(inputs.Align.RIGHT)
          }
          input.appendField(new Blockly.FieldVariable('variable'), 'NAME' + i)
        }
      }
      // Remove deleted fields.
      while (this.getField('NAME' + i)) {
        input.removeField('NAME' + i)
        i++
      }
      // Delete and re-add ending field
      if (this.getField('END_NONLOCALS')) {
        input.removeField('END_NONLOCALS')
      }
      input.appendField('available', 'END_NONLOCALS')
    },
    /**
     * Create XML to represent list inputs.
     * @return {!Element} XML storage element.
     * @this Blockly.Block
     */
    mutationToDom: function () {
      let container = document.createElement('mutation')
      container.setAttribute('names', this.nameCount_)
      return container
    },
    /**
     * Parse XML to restore the list inputs.
     * @param {!Element} xmlElement XML storage element.
     * @this Blockly.Block
     */
    domToMutation: function (xmlElement: any) {
      this.nameCount_ = parseInt(xmlElement.getAttribute('names'), 10)
      this.updateShape_()
    },
    saveExtraState: function() {
      return { 'names_count': this.nameCount_ };
    },
    loadExtraState: function(state: any) {
      this.nameCount_ = state['names_count'];
      this.updateShape_();
    },
  }

  pythonGenerator.forBlock['ast_nonlocal'] = function (block: any) {
    // Create a list with any number of elements of any type.
    let elements = new Array(block.nameCount_)
    for (let i = 0; i < block.nameCount_; i++) {
      elements[i] = pythonGenerator.nameDB_!.getName(
        block.getFieldValue('NAME' + i),
        Blockly.VARIABLE_CATEGORY_NAME
      )
    }
    return 'nonlocal ' + elements.join(', ') + '\n'
  }
}
