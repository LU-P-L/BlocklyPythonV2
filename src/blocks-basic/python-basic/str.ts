import type * as TmpBlockly from 'blockly'
import type { PythonGenerator } from "blockly/python";
import { Order } from 'blockly/python'

export function addStrBlocks(
  Blockly: typeof TmpBlockly,
  pythonGenerator: PythonGenerator,
) {
  const STR_COLOR = '#7FB6FF'

  Blockly.defineBlocksWithJsonArray([
    {
      type: 'ast_str',
      message0: '%1',
      args0: [{ type: 'field_input', name: 'TEXT', value: '' }],
      output: 'String',
      extensions: ['text_quotes'],
      colour: STR_COLOR
    },
    {
      type: 'ast_str_char',
      message0: '%1',
      args0: [
        {
          type: 'field_dropdown',
          name: 'TEXT',
          options: [
            ['\\n', '\n'],
            ['\\t', '\t']
          ]
        }
      ],
      output: 'String',
      extensions: ['text_quotes'],
      colour: STR_COLOR
    },
    {
      type: 'ast_str_multiline',
      message0: '%1',
      args0: [{ type: 'field_multilinetext', name: 'TEXT', value: '' }],
      output: 'String',
      extensions: ['text_quotes'],
      colour: STR_COLOR
    },
    {
      type: 'ast_str_docstring',
      message0: 'Docstring: %1 %2',
      args0: [{ type: 'input_dummy' }, { type: 'field_multilinetext', name: 'TEXT', value: '' }],
      previousStatement: null,
      nextStatement: null,
      colour: STR_COLOR
    }
  ])

  Blockly.Blocks['ast_image'] = {
    init: function () {
      this.src_ = 'loading.png'
      this.updateShape_()
      this.setOutput(true)
      this.setColour(STR_COLOR)
    },
    mutationToDom: function () {
      let container = document.createElement('mutation')
      container.setAttribute('src', this.src_)
      return container
    },
    domToMutation: function (xmlElement: any) {
      this.src_ = xmlElement.getAttribute('src')
      this.updateShape_()
    },
    saveExtraState: function() {
      return { 'src': this.src_ };
    },
    loadExtraState: function(state: any) {
      this.src_ = state['src'];
      this.updateShape_();
    },
    updateShape_: function () {
      let image = this.getInput('IMAGE')
      if (!image) {
        image = this.appendDummyInput('IMAGE')
        image.appendField(new Blockly.FieldImage(this.src_, 40, 40))
      }
      let imageField = image.fieldRow[0]
      imageField.setValue(this.src_)
    }
  }

  pythonGenerator.forBlock['ast_str'] = function (block: any) {
    // Text value
    let code = pythonGenerator.quote_(block.getFieldValue('TEXT'))
    code = code.replace('\n', 'n')
    return [code, Order.ATOMIC]
  }

  pythonGenerator.forBlock['ast_str_char'] = function (block: any) {
    // Text value
    let value = block.getFieldValue('TEXT')
    switch (value) {
      case '\n':
        return ["'\\n'", Order.ATOMIC]
      case '\t':
        return ["'\\t'", Order.ATOMIC]
    }
    return ["''", Order.ATOMIC]
  }

  pythonGenerator.forBlock['ast_image'] = function (block: any) {
    // Text value
    (pythonGenerator as any).definitions_['import_image'] = 'from image import Image'
    let code = 'Image(' + pythonGenerator.quote_(block.src_) + ')'
    return [code, Order.ATOMIC]
  }

  pythonGenerator.forBlock['ast_str_multiline'] = function (block: any) {
    // Text value
    let code = pythonGenerator.multiline_quote_(block.getFieldValue('TEXT'))
    return [code, Order.ATOMIC]
  }

  pythonGenerator.forBlock['ast_str_docstring'] = function (block: any) {
    // Text value.
    let code = block.getFieldValue('TEXT')
    if (code.charAt(0) !== '\n') {
      code = '\n' + code
    }
    if (code.charAt(code.length - 1) !== '\n') {
      code = code + '\n'
    }
    return pythonGenerator.multiline_quote_(code) + '\n'
  }
}
