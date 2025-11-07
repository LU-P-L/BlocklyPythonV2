import type * as TmpBlockly from 'blockly'
import type { CodeGenerator } from 'blockly'
import {Order} from "blockly/python";

export function addFunctionBasicBlocks(Blockly: typeof TmpBlockly, pythonGenerator: CodeGenerator) {
  Blockly.Blocks['id'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('获取变量名为')
        .appendField(new Blockly.FieldVariable('variable'), 'TARGET')
        .appendField('在运行中的唯一标识')
      this.setOutput(true, null)
      this.setColour('#DC143C')
    }
  }
  pythonGenerator.forBlock['id'] = function (block: any) {
    let variable = pythonGenerator.getVariableName(block.getFieldValue('TARGET'))
    return `id(${variable})`
  }

  Blockly.Blocks['get_id'] = {
    init: function () {
      this.appendValueInput('var').setCheck(null).appendField('获取')
      this.appendDummyInput().appendField('在运行中的唯一标识')
      this.setInputsInline(true)
      this.setOutput(true, null)
      this.setColour('#DC143C')
    }
  }
  pythonGenerator.forBlock['get_id'] = function (block: any) {
    let valueVar = pythonGenerator.valueToCode(block, 'var', Order.ATOMIC)
    let code = `id(${valueVar})`
    return [code,Order.NONE]
  }

  Blockly.Blocks['get_type'] = {
    init: function () {
      this.appendValueInput('var').setCheck(null).appendField('获取')
      this.appendDummyInput().appendField('的类型')
      this.setInputsInline(true)
      this.setOutput(true, null)
      this.setColour('#DC143C')
    }
  }
  pythonGenerator.forBlock['get_type'] = function (block: any) {
    let valueVar = pythonGenerator.valueToCode(block, 'var', Order.ATOMIC)
    let code = `type(${valueVar})`
    return [code, Order.NONE]
  }

  Blockly.Blocks['type'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('获取变量名为')
        .appendField(new Blockly.FieldVariable('variable'), 'TARGET')
        .appendField('的类型')
      this.setOutput(true, null)
      this.setColour('#DC143C')
    }
  }
  pythonGenerator.forBlock['type'] = function (block: any) {
    let variable = pythonGenerator.getVariableName(block.getFieldValue('TARGET'))
    return `type(${variable})`
  }

  Blockly.Blocks['print_end_with'] = {
    init: function () {
      this.appendValueInput('content').setAlign(Blockly.inputs.Align.RIGHT).appendField('输出')
      this.appendValueInput('ending')
        .setAlign(Blockly.inputs.Align.RIGHT)
        .setCheck('String')
        .appendField('结尾为')
      this.setInputsInline(false)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#DC143C')
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }
  pythonGenerator.forBlock['print_end_with'] = function (block: any) {
    let valueContent = pythonGenerator.valueToCode(block, 'content', Order.ATOMIC)
    let valueEnding = pythonGenerator.valueToCode(block, 'ending', Order.ATOMIC)
    return `print(${valueContent}, end=${valueEnding})\n`
  }

  Blockly.Blocks['print'] = {
    init: function () {
      this.appendDummyInput().appendField('输出')
      this.appendValueInput('TARGET')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#DC143C')
    }
  }
  pythonGenerator.forBlock['print'] = function (block: any) {
    let target = pythonGenerator.valueToCode(block, 'TARGET', Order.ATOMIC)
    return `print(${target})\n`
  }

  Blockly.Blocks['raw_input'] = {
    init: function () {
      this.appendDummyInput().appendField('输入')
      this.setOutput(true, null)
      this.setColour('#DC143C')
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }
  pythonGenerator.forBlock['raw_input'] = function () {
    // TODO: Assemble Python into code variable.
    let code = 'input()'
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Order.NONE]
  }

  Blockly.Blocks['int_input'] = {
    init: function () {
      this.appendDummyInput().appendField('请输入数字')
      this.setOutput(true, null)
      this.setColour('#DC143C')
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }
  pythonGenerator.forBlock['int_input'] = function () {
    let code = 'int(input())'
    return [code, Order.NONE]
  }

  Blockly.Blocks['input_with_info'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('输入，提示信息为：')
        .appendField(new Blockly.FieldTextInput('请输入：'), 'info')
      this.setOutput(true, null)
      this.setColour('#DC143C')
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }
  pythonGenerator.forBlock['input_with_info'] = function (block: any) {
    let textInfo = block.getFieldValue('info')
    let code = `input('${textInfo}')`
    return [code, Order.NONE]
  }

  Blockly.Blocks['int'] = {
    init: function () {
      this.appendValueInput('STRING').appendField('字符串转数字')
      this.setOutput(true, null)
      this.setColour('#DC143C')
    }
  }
  pythonGenerator.forBlock['int'] = function (block: any) {
    let string = pythonGenerator.valueToCode(block, 'STRING', Order.ATOMIC)
    return [`int(${string})`,Order.NONE]
  }

  Blockly.Blocks['str'] = {
    init: function () {
      this.appendValueInput('INTEGER').appendField('数字转字符串')
      this.setOutput(true, null)
      this.setColour('#DC143C')
    }
  }
  pythonGenerator.forBlock['str'] = function (block: any) {
    let int = pythonGenerator.valueToCode(block, 'INTEGER', Order.ATOMIC)
    return [`str(${int})`, Order.NONE]
  }

  Blockly.Blocks['range_simply'] = {
    init: function () {
      this.appendValueInput('var').setCheck(null).appendField('range')
      this.setOutput(true, null)
      this.setColour('#DC143C')
    }
  }
  pythonGenerator.forBlock['range_simply'] = function (block: any) {
    let valueVar = pythonGenerator.valueToCode(block, 'var', Order.ATOMIC)
    return [`range(${valueVar})`, Order.ATOMIC]
  }
}
