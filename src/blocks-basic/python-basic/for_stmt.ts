import {Order} from "blockly/python";

/**
 * AST for_stmt依据：https://docs.python.org/3/reference/grammar.html#:~:text=named_expression%20%27%3A%27%20block%20%5Belse_block%5D-,for_stmt,-%3A%0A%20%20%20%20%7C%20%27for%27%20star_targets%20%27in
 * @author ChirsJaunes
 */
export function addForStmtBlocks(Blockly: any, pythonGenerator: any, workspaceSvg: any) {
  Blockly.Blocks['ast_for_stmt'] = {
    init: function () {
      this.orelse_ = false
      this.appendValueInput('TARGET').appendField('for')
      this.appendValueInput('ITER').appendField('iter')
      this.appendStatementInput('BODY').setCheck(null).setAlign(Blockly.ALIGN_RIGHT)
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.updateShape_()
      this.setColour('#7FB6FF')
    },
    updateShape_: function () {
      if (this.getInput('ELSE_TEST')) {
        this.removeInput('ELSE_TEST')
        this.removeInput('ELSE_BODY')
      }
      if (this.orelse_) {
        this.appendDummyInput('ELSE_TEST').appendField('else:')
        this.appendStatementInput('ELSE_BODY').setCheck(null)
      }
    },
    mutationToDom: function () {
      let container = document.createElement('mutation')
      container.setAttribute('orelse', this.orelse_)
      return container
    },
    domToMutation: function (xmlElement: any) {
      this.orelse_ = xmlElement.getAttribute('orelse') === 'true'
      this.updateShape_()
    },
    saveExtraState: function() {
      return { 'orelse': this.orelse_ };
    },
    loadExtraState: function(state: any) {
      this.orelse_ = state['orelse'];
      this.updateShape_();
    },
  }

  pythonGenerator.forBlock['ast_for_stmt'] = function (block: any) {
    let argument0 =
      pythonGenerator.valueToCode(block, 'TARGET', pythonGenerator.ORDER_RELATIONAL) ||
      pythonGenerator.blank
    let argument1 =
      pythonGenerator.valueToCode(block, 'ITER', pythonGenerator.ORDER_RELATIONAL) ||
      pythonGenerator.blank
    let branchBody = pythonGenerator.statementToCode(block, 'BODY') || pythonGenerator.PASS
    let branchElse = pythonGenerator.statementToCode(block, 'ELSE_BODY')
    let code = 'for ' + argument0 + ' in ' + argument1 + ':\n' + branchBody
    if (branchElse) {
      code += 'else:\n' + branchElse
    }
    return code
  }

  Blockly.Blocks['ast_controls_for'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('变量')
        .appendField(new Blockly.FieldVariable(null), 'var')
      this.appendValueInput('begin').setCheck('Number').appendField('从')
      this.appendValueInput('end').setCheck('Number').appendField('数到')
      this.appendValueInput('increment').setCheck('Number').appendField('每次增加')
      this.appendStatementInput('execution').setCheck(null).appendField('执行')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setTooltip('')
      this.setHelpUrl('')
      this.setColour('#7FB6FF')
    }
  }

  pythonGenerator.forBlock['ast_controls_for'] = function (block: any) {
    let variableVar = pythonGenerator.getVariableName(block.getFieldValue('var'));
    let valueBegin: string | number = pythonGenerator.valueToCode(block, 'begin', Order.ATOMIC) || '0'
    let valueEnd: string | number= pythonGenerator.valueToCode(block, 'end', Order.ATOMIC) || '0'
    let valueIncrement: string | number = pythonGenerator.valueToCode(block, 'increment', Order.ATOMIC) ||'1'
    let statementsName = pythonGenerator.statementToCode(block, 'execution') || 'pass'

    // illegal circumstance
    // if (valueBegin % 1 !== 0 || valueEnd % 1 !== 0 || valueIncreasement % 1 !== 0) {
    //     return "参数中有非整型数据类型，请检查";
    // }
    // if (Number.isInteger(valueBegin) || Number.isInteger(valueEnd) || Number.isInteger(valueIncreasement)) {
    //     return "# 参数中有非整型数据类型，请检查";
    // }
    // if (valueBegin === valueEnd) {
    //     return "# 无效的循环，请检查, 开始值等于结束值";
    // }
    // if (valueBegin < valueEnd && valueIncreasement[1] === "-") {
    //     return "# 无效的循环，请检查, 逆序遍历时开始值小于结束值";
    // }
    // if (valueBegin > valueEnd && valueIncreasement[1] !== "-") {
    //     return "# 无效的循环，请检查， 顺序遍历时开始值大于结束值";
    // }
    // if (valueIncreasement === 0) {
    //     return "死循环，请检查";
    // }
    // if statement is empty, need
    return `for ${variableVar} in range(${valueBegin}, ${valueEnd}, ${valueIncrement}):\n${statementsName}`
  }
}
