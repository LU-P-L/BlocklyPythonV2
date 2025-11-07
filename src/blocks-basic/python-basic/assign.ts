/**
 * AST assignment 依据: https://docs.python.org/3/reference/grammar.html#:~:text=start%20with%20%27yield%27-,assignment,-%3A%0A%20%20%20%20%7C%20NAME%20%27%3A%27%20expression%20%5B%27%3D%27%20annotated_rhs
 * 根据Python的AST规范，assign 主要包括 Target 和 Value 两个部分
 * 根据具体语法规则，Target 有非常多的种类，这里主要分为单个变量和非单个变量
 *      当 targetCount_ === 1 && singleTarget_ 时，仅为单个变量 例如 a = 1
 *      否则为复杂情况，例如 a,b = 1,2 [targetCount_ === 1 && singleTarget_ === false]
 * 更多情况未作考虑
 *
 * 由于用到了自定义的变量，需要采用 mutation 进行存储
 * 自定义变量如下：
 *      targetCount_: target的数量 => target_count
 *      singleTarget_: 是否为singleTarget => single_target
 *
 * @author ChrisJaunes
 */
import type * as TmpBlockly from 'blockly'
import type { CodeGenerator } from 'blockly'
import { Order } from 'blockly/python'

export function addAssignBlocks(Blockly: typeof TmpBlockly, pythonGenerator: CodeGenerator) {
  Blockly.Blocks['ast_assign'] = {
    targetCount_: 1,
    singleTarget_: true,

    init: function () {
      this.targetCount_ = 1
      this.singleTarget_ = true
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.updateShape_()
      this.setColour('#7FB6FF')
      Blockly.Extensions.apply('contextMenu_variableSetterGetter', this, false)
    },
    updateShape_: function () {
      if (!this.getInput('VALUE')) {
        this.appendDummyInput().appendField('赋值: ')
        this.appendValueInput('VALUE').appendField('=')
      }
      let i = 0
      if (this.targetCount_ === 1 && this.singleTarget_) {
        if (!this.getInput('TARGET_ANCHOR')) {
          this.appendDummyInput('TARGET_ANCHOR').appendField(
            new Blockly.FieldVariable('variable'),
            'TARGET'
          )
        }
        this.moveInputBefore('TARGET_ANCHOR', 'VALUE')
      } else {
        if (this.getInput('TARGET_ANCHOR')) {
          this.removeInput('TARGET_ANCHOR')
        }
        for (; i < this.targetCount_; i++) {
          if (!this.getInput('TARGET' + i)) {
            let input = this.appendValueInput('TARGET' + i)
            if (i !== 0) {
              input.appendField('and').setAlign(Blockly.inputs.Align.LEFT)
            }
          }
          this.moveInputBefore('TARGET' + i, 'VALUE')
        }
      }
      while (this.getInput('TARGET' + i)) {
        this.removeInput('TARGET' + i)
        i++
      }
    },
    mutationToDom: function () {
      let container = document.createElement('mutation')
      container.setAttribute('target_count', this.targetCount_)
      container.setAttribute('single_target', this.singleTarget_)
      return container
    },
    domToMutation: function (xmlElement: { getAttribute: (arg0: string) => string }) {
      this.targetCount_ = parseInt(xmlElement.getAttribute('target_count'), 10)
      this.singleTarget_ = xmlElement.getAttribute('single_target') === 'true'
      this.updateShape_()
    },
    saveExtraState: function() {
      return { 'target_count': this.targetCount_, 'single_target': this.singleTarget_};
    },
    loadExtraState: function(state: any) {
      this.targetCount_ = state['target_count'];
      this.singleTarget_ = state['single_target'];
      this.updateShape_()
    },
  }

  pythonGenerator.forBlock['ast_assign'] = function (block: any) {
    let value = pythonGenerator.valueToCode(block, 'VALUE', Order.NONE) || 'None'
    let targets = new Array(block.targetCount_)
    if (block.targetCount_ === 1 && block.singleTarget_) {
      targets[0] = block.getField("TARGET")?.getText()
    } else {
      for (let i = 0; i < block.targetCount_; i++) {
        targets[i] = pythonGenerator.valueToCode(block, 'TARGET' + i, Order.NONE) || 'None'
      }
    }
    return `${targets.join(' = ')} = ${value}\n`
  }
}
