/*
 * @Author       : JudgeHuang
 * @Date         : 2021-12-24 17:28:24
 * @LastEditTime : 2021-12-24 19:09:48
 * @LastEditors  : JudgeHuang
 * @Description  : Let us change our traditional attitude to the construction of programs
 */
import type * as TmpBlockly from 'blockly'
import { inputs, type CodeGenerator } from 'blockly';
import { Order } from 'blockly/python';


export function addSetBlocks(
  Blockly: typeof TmpBlockly,
  pythonGenerator: CodeGenerator,
) {
  const SET_COLOR = '#7FB6FF'
  const INTRODUCE_ICON =
    'data:image/svg+xml;base64,PHN2ZyB0PSIxNjQwMTUzMjIxMzA3IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjIwNzMiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cGF0aCBkPSJNNjQzLjYwMyA1NzQuNTQySDI4Mi41MzRjLTYuNTc1IDAtMTEuODc1IDguOTIzLTExLjg3NSAxOS44NzUgMCAxMC45NiA1LjMgMTkuODEzIDExLjg3NSAxOS44MTNoMzYxLjA2OWM2LjU2IDAgMTEuODY0LTguODUyIDExLjg2NC0xOS44MTMgMC0xMC45NjItNS4zMDUtMTkuODc1LTExLjg2NC0xOS44NzV6IG0wIDBNNjQzLjYwMyA0ODIuOTE3SDI4Mi41MzRjLTYuNTc1IDAtMTEuODc1IDguODg3LTExLjg3NSAxOS44ODIgMCAxMC45NTcgNS4zIDE5LjgxNCAxMS44NzUgMTkuODE0aDM2MS4wNjljNi41NiAwIDExLjg2NC04Ljg1OCAxMS44NjQtMTkuODE0IDAtMTAuOTk1LTUuMzA1LTE5Ljg4Mi0xMS44NjQtMTkuODgyeiBtMCAwTTY0My42MDMgMzkxLjM1NEgyODIuNTM0Yy02LjU3NSAwLTExLjg3NSA4Ljg2Mi0xMS44NzUgMTkuODIzIDAgMTAuOTU2IDUuMyAxOS44NDkgMTEuODc1IDE5Ljg0OWgzNjEuMDY5YzYuNTYgMCAxMS44NjQtOC44OTMgMTEuODY0LTE5Ljg1IDAtMTAuOTYtNS4zMDUtMTkuODIyLTExLjg2NC0xOS44MjJ6IG0wIDAiIHAtaWQ9IjIwNzQiPjwvcGF0aD48cGF0aCBkPSJNOTAwLjE1OCAxNzhjMC02Mi4zMDgtNTAuNjE0LTExMy4wMTctMTEyLjgyOS0xMTMuMDE3SDIzNC4yMDJjLTAuMjU4IDAtMC40ODMgMC4wMzktMC43NjQgMC4wNTUtMC4yNjMtMC4wMTYtMC41MDgtMC4wNTUtMC43NzEtMC4wNTUtNjAuNTcgMC0xMDkuODU2IDUwLjcwOS0xMDkuODU2IDExMy4wMTd2NjYwLjcwOWMwIDguMzI4IDMuMjY0IDE2LjI2IDkuMDg1IDIyLjAwM2w4OS43NTIgODkuMDU2YzExLjUxIDExLjM5OCAyOS43MTggMTEuMzk4IDQxLjIyNiAwbDkxLjU2NS05MC44NSA5NC45OTggOTQuMjQzYzExLjUxMiAxMS40NDggMjkuNzM2IDExLjQ0OCA0MS4yNDcgMGw5NS4wMDQtOTQuMjQ0IDk1LjAxMiA5NC4yNDRjNS43NTQgNS43MSAxMy4xOTEgOC41OCAyMC41OTggOC41OCA3LjQyOSAwIDE0Ljg3OS0yLjg3IDIwLjYzMy04LjU4bDg2LTg1LjMwOGM1LjgwNi01Ljc3OCA5LjA4My0xMy43MDYgOS4wODMtMjEuOTk4VjI4Ni45NmM0Ny44NDUtMTMuMTM4IDgzLjE0NC01Ni45NjMgODMuMTQ0LTEwOC45NjF6IG0tMTkzLjMgNzE5LjkzM2wtOTcuMzAzLTk2LjUzOWMtMTEuNzY2LTExLjcwNi0zMC40MS0xMS43MDYtNDIuMiAwbC05Ny4yOCA5Ni41MzktOTcuMjkzLTk2LjUzOWMtMTEuNzg4LTExLjcwNi0zMC40MzEtMTEuNzA2LTQyLjIyMyAwbC05My43NjUgOTMuMDEtNjEuNTA2LTYxVjE3MC4wODdjMC0yOS4zMzEgMjMuMTg0LTUzLjE4IDUxLjY4LTUzLjE4IDAuMjU2IDAgMC40ODQtMC4wNzYgMC43MTgtMC4wNzYgMC4zMDQgMCAwLjU3NiAwLjA3NyAwLjg1NyAwLjA3N2gwLjEwNmMzMC4xMyAwLjA2NyA1NC42MTYgMjMuOTA0IDU0LjYxNiA1My4xNzkgMCAyOS4zMjMtMjQuNTQxIDUzLjE5My01NC43MjIgNTMuMTkzLTE2LjgwNCAwLTMwLjM5NCAxMy45OC0zMC4zOTQgMzEuMjU0IDAgMTcuMjk1IDEzLjU5IDMxLjMxNCAzMC4zOTQgMzEuMzE0aDUzNnY1NTQuODI5bC01Ny42ODYgNTcuMjU1eiBtNjcuOTg0LTY2MS45NjlsLTQ3My40NzctMy4wMjhjMjguODM0LTE0LjEzNCAyOC44NTQtNDIuNTQgMjguODM0LTUxLjA4MS0wLjA3My0zMS44ODQtNC45MS00NS45ODQtMTMuMDQtNjEuNjk4bDQ3NC4wMjYtMC43OThjMjkuNzQgMCA2MC43NjUgMzEuMTg3IDYwLjc2NSA2MC4wODUgMCAyOC44OS0zMS40IDU1LjA0NC02MS4xMzggNTUuMDQ0bC0xNS45NyAxLjQ3NnogbTAgMCIgcC1pZD0iMjA3NSI+PC9wYXRoPjwvc3ZnPg=='
  const INTRODUCE_MESSAGE = document.createElement('div')
  INTRODUCE_MESSAGE.style.cssText = `
    overflow: scroll;
    `
  INTRODUCE_MESSAGE.innerHTML = `
    <h1> [计小白小课堂] 集合 </h1>
    <hr>
    <p>set 对象是由具有唯一性的 hashable 对象所组成的无序多项集。 常见的用途包括成员检测、从序列中去除重复项以及数学中的集合类计算，例如交集、并集、差集与对称差集等等。</p>
    <br>
    <p><a href="https://docs.python.org/zh-cn/3/library/stdtypes.html?highlight=set#set-types-set-frozenset">点击本处打开参考链接</a></p>
    `
  Blockly.defineBlocksWithJsonArray([
    {
      type: 'ast_set_mutator_with_container',
      message0: 'item 数量: %1 %2',
      args0: [{ type: 'input_dummy' }, { type: 'input_statement', name: 'STACK', align: 'RIGHT' }],
      colour: SET_COLOR,
      enableContextMenu: false
    },
    {
      type: 'ast_set_mutator_with_item',
      message0: '集合元素',
      previousStatement: null,
      nextStatement: null,
      enableContextMenu: false,
      colour: SET_COLOR
    }
  ])
  Blockly.Blocks['ast_set'] = {
    init: function () {
      this.jsonInit({
        message0: '介绍 %1',
        args0: [{ type: 'input_dummy', name: 'Introduction' }],
        inputsInline: false,
        output: 'SET',
        colour: SET_COLOR,
        extensions: ['basic_introduction_extension']
      })
      this.itemCount_ = 1
      this.INTRODUCE_MESSAGE = INTRODUCE_MESSAGE
      this.setMutator(new Blockly.icons.MutatorIcon(['ast_set_mutator_with_item'], this))
      this.setTooltip(Blockly.Msg['AST_SET_CREATE_WITH_TOOLTIP'])
      this.updateShape_()
    },
    mutationToDom: function () {
      let container = document.createElement('mutation')
      container.setAttribute('items_count', this.itemCount_)
      return container
    },
    domToMutation: function (xmlElement: any) {
      this.itemCount_ = parseInt(xmlElement.getAttribute('items_count'), 10)
      this.updateShape_()
    },
    saveExtraState: function() {
      return { 'items_count': this.itemCount_ };
    },
    loadExtraState: function(state: any) {
      this.itemCount_ = state['items_count'];
      this.updateShape_();
    },
    decompose: function (workspace: any) {
      let containerBlock = workspace.newBlock('ast_set_mutator_with_container')
      containerBlock.initSvg()
      let connection = containerBlock.getInput('STACK').connection
      for (let i = 0; i < this.itemCount_; i++) {
        let itemBlock = workspace.newBlock('ast_set_mutator_with_item')
        itemBlock.initSvg()
        connection.connect(itemBlock.previousConnection)
        connection = itemBlock.nextConnection
      }
      return containerBlock
    },
    compose: function (containerBlock: any) {
      let itemBlock = containerBlock.getInputTargetBlock('STACK')
      let connections = []
      while (itemBlock && !itemBlock.isInsertionMarker()) {
        connections.push(itemBlock.valueConnection_)
        itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock()
      }
      for (let i = 0; i < this.itemCount_; i++) {
        let connection = this.getInput('ADD' + i).connection.targetConnection
        if (connection && connections.indexOf(connection) === -1) {
          connection.disconnect()
        }
      }
      this.itemCount_ = connections.length
      this.updateShape_()
      for (let i = 0; i < this.itemCount_; i++) {
        connections[i]?.reconnect(this, 'ITEM' + i)
      }
    },
    saveConnections: function (containerBlock: any) {
      let itemBlock = containerBlock.getInputTargetBlock('STACK')
      let i = 0
      while (itemBlock) {
        let input = this.getInput('ADD' + i)
        itemBlock.valueConnection_ = input && input.connection.targetConnection
        i++
        itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock()
      }
    },
    updateShape_: function () {
      if (this.itemCount_ && this.getInput('EMPTY')) {
        this.removeInput('EMPTY')
      } else if (!this.itemCount_ && !this.getInput('EMPTY')) {
        this.appendDummyInput('EMPTY').appendField(Blockly.Msg['AST_EMPTY_SET'])
      }
      let i = 0
      for (; i < this.itemCount_; i++) {
        if (!this.getInput('ADD' + i)) {
          this.appendValueInput('ADD' + i).setAlign(inputs.Align.RIGHT)
        }
        if (i === 0) {
          let input = this.getInput('ADD0')
          input.removeField('label', true)
          input.appendField(Blockly.Msg['AST_CREATE_SET'] + this.itemCount_, 'label')
        }
      }
      while (this.getInput('ADD' + i)) {
        this.removeInput('ADD' + i)
        i++
      }
    }
  }

  pythonGenerator.forBlock['ast_set'] = function (block: any) {
    if (block.itemCount_ === 0) return ['set()', Order.ATOMIC]
    let elements = new Array(block.itemCount_)
    for (let i = 0; i < block.itemCount_; i++) {
      elements[i] =
        pythonGenerator.valueToCode(block, 'ADD' + i, Order.NONE) || 'None'
    }
    let code = '{' + elements.join(', ') + '}'
    return [code, Order.ATOMIC]
  }
  Blockly.Blocks['set_option'] = {
    init: function () {
      let MODE: [string, string][] = [
        ['返回使用的所有元素的列表', 'LIST'],
        ['返回集合中的项数', 'LEN'],
        ['集合中存在元素', 'EXIST'],
        ['返回原集合的浅拷贝', 'COPY'],
        ['将元素elem添加到集合中', 'ADD'],
        ['从集合中移除元素elem', 'REMOVE'],
        ['如果元素elem存在于集合中则将其移除', 'DISCARD'],
        ['从集合中移除并返回任意一个元素', 'POP'],
        ['移除集合中的所有元素', 'CLEAR']
      ]
      let modeMenu = new Blockly.FieldDropdown(MODE)
      this.appendValueInput('NAME').setCheck('SET')
      this.appendDummyInput().appendField(modeMenu, 'OPTION').appendField('', 'SPACE')
      this.setInputsInline(true)
      this.setOutput(true)
      this.setColour(SET_COLOR)
    },
    updateStatement_: function (newStatement: any) {
      let oldStatement = !this.outputConnection
      if (newStatement !== oldStatement) {
        this.unplug(true, true)
        if (newStatement) {
          this.setOutput(false)
          this.setPreviousStatement(true)
          this.setNextStatement(true)
        } else {
          this.setPreviousStatement(false)
          this.setNextStatement(false)
          this.setOutput(true)
        }
      }
    },
    updateAt_: function (value: any) {
      if (this.getInput('ELEM')) this.removeInput('ELEM')
      if (value === 'LIST' || value === 'LEN' || value === 'COPY' || value === 'POP') {
        this.updateStatement_(false)
        return
      }
      if (value === 'EXIST') {
        this.appendValueInput('ELEM')
        this.updateStatement_(false)
        return
      }
      if (value === 'ADD' || value === 'REMOVE' || value === 'DISCARD') {
        this.appendValueInput('ELEM')
        this.updateStatement_(true)
        return
      }
      if (value === 'CLEAR') {
        this.updateStatement_(true)
      }
    }
  }
  pythonGenerator.forBlock['set_option'] = function (block: any) {
    let name = pythonGenerator.valueToCode(block, 'NAME', Order.NONE) || ''
    let option = block.getFieldValue('OPTION')
    switch (option) {
      case 'LIST':
        return [`list(${name})`, Order.NONE]
      case 'LEN':
        return [`len(${name})`, Order.NONE]
      case 'EXIST': {
        let elem = pythonGenerator.valueToCode(block, 'ELEM', Order.NONE) || ''
        return [`${elem} in ${name}`, Order.NONE]
      }
      case 'COPY': {
        return [`${name}.copy()`, Order.NONE]
      }
      case 'ADD': {
        let elem = pythonGenerator.valueToCode(block, 'ELEM', Order.NONE) || ''
        return `${name}.add(${elem})`
      }
      case 'REMOVE': {
        let elem =
          pythonGenerator.valueToCode(block, 'ELEM', Order.NONE) || ''
        return `${name}.remove(${elem})`
      }
      case 'DISCARD': {
        let elem = pythonGenerator.valueToCode(block, 'ELEM', Order.NONE) || ''
        return `${name}.discard(${elem})`
      }
      case 'POP': {
        return [`${name}.pop()`, Order.NONE]
      }
      case 'CLEAR': {
        return `${name}.clear()`
      }
    }
    return '出现错误，请联系管理人员'
  }
}
