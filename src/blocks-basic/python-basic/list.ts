import type * as TmpBlockly from 'blockly'
import { inputs, type CodeGenerator } from 'blockly';
import { Order } from 'blockly/python';

export function addListBlocks(
  Blockly: typeof TmpBlockly,
  pythonGenerator: CodeGenerator,
) {
  const LIST_COLOR = '#7FB6FF'

  const INTRODUCE_ICON =
    'data:image/svg+xml;base64,PHN2ZyB0PSIxNjQwMTUzMjIxMzA3IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjIwNzMiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cGF0aCBkPSJNNjQzLjYwMyA1NzQuNTQySDI4Mi41MzRjLTYuNTc1IDAtMTEuODc1IDguOTIzLTExLjg3NSAxOS44NzUgMCAxMC45NiA1LjMgMTkuODEzIDExLjg3NSAxOS44MTNoMzYxLjA2OWM2LjU2IDAgMTEuODY0LTguODUyIDExLjg2NC0xOS44MTMgMC0xMC45NjItNS4zMDUtMTkuODc1LTExLjg2NC0xOS44NzV6IG0wIDBNNjQzLjYwMyA0ODIuOTE3SDI4Mi41MzRjLTYuNTc1IDAtMTEuODc1IDguODg3LTExLjg3NSAxOS44ODIgMCAxMC45NTcgNS4zIDE5LjgxNCAxMS44NzUgMTkuODE0aDM2MS4wNjljNi41NiAwIDExLjg2NC04Ljg1OCAxMS44NjQtMTkuODE0IDAtMTAuOTk1LTUuMzA1LTE5Ljg4Mi0xMS44NjQtMTkuODgyeiBtMCAwTTY0My42MDMgMzkxLjM1NEgyODIuNTM0Yy02LjU3NSAwLTExLjg3NSA4Ljg2Mi0xMS44NzUgMTkuODIzIDAgMTAuOTU2IDUuMyAxOS44NDkgMTEuODc1IDE5Ljg0OWgzNjEuMDY5YzYuNTYgMCAxMS44NjQtOC44OTMgMTEuODY0LTE5Ljg1IDAtMTAuOTYtNS4zMDUtMTkuODIyLTExLjg2NC0xOS44MjJ6IG0wIDAiIHAtaWQ9IjIwNzQiPjwvcGF0aD48cGF0aCBkPSJNOTAwLjE1OCAxNzhjMC02Mi4zMDgtNTAuNjE0LTExMy4wMTctMTEyLjgyOS0xMTMuMDE3SDIzNC4yMDJjLTAuMjU4IDAtMC40ODMgMC4wMzktMC43NjQgMC4wNTUtMC4yNjMtMC4wMTYtMC41MDgtMC4wNTUtMC43NzEtMC4wNTUtNjAuNTcgMC0xMDkuODU2IDUwLjcwOS0xMDkuODU2IDExMy4wMTd2NjYwLjcwOWMwIDguMzI4IDMuMjY0IDE2LjI2IDkuMDg1IDIyLjAwM2w4OS43NTIgODkuMDU2YzExLjUxIDExLjM5OCAyOS43MTggMTEuMzk4IDQxLjIyNiAwbDkxLjU2NS05MC44NSA5NC45OTggOTQuMjQzYzExLjUxMiAxMS40NDggMjkuNzM2IDExLjQ0OCA0MS4yNDcgMGw5NS4wMDQtOTQuMjQ0IDk1LjAxMiA5NC4yNDRjNS43NTQgNS43MSAxMy4xOTEgOC41OCAyMC41OTggOC41OCA3LjQyOSAwIDE0Ljg3OS0yLjg3IDIwLjYzMy04LjU4bDg2LTg1LjMwOGM1LjgwNi01Ljc3OCA5LjA4My0xMy43MDYgOS4wODMtMjEuOTk4VjI4Ni45NmM0Ny44NDUtMTMuMTM4IDgzLjE0NC01Ni45NjMgODMuMTQ0LTEwOC45NjF6IG0tMTkzLjMgNzE5LjkzM2wtOTcuMzAzLTk2LjUzOWMtMTEuNzY2LTExLjcwNi0zMC40MS0xMS43MDYtNDIuMiAwbC05Ny4yOCA5Ni41MzktOTcuMjkzLTk2LjUzOWMtMTEuNzg4LTExLjcwNi0zMC40MzEtMTEuNzA2LTQyLjIyMyAwbC05My43NjUgOTMuMDEtNjEuNTA2LTYxVjE3MC4wODdjMC0yOS4zMzEgMjMuMTg0LTUzLjE4IDUxLjY4LTUzLjE4IDAuMjU2IDAgMC40ODQtMC4wNzYgMC43MTgtMC4wNzYgMC4zMDQgMCAwLjU3NiAwLjA3NyAwLjg1NyAwLjA3N2gwLjEwNmMzMC4xMyAwLjA2NyA1NC42MTYgMjMuOTA0IDU0LjYxNiA1My4xNzkgMCAyOS4zMjMtMjQuNTQxIDUzLjE5My01NC43MjIgNTMuMTkzLTE2LjgwNCAwLTMwLjM5NCAxMy45OC0zMC4zOTQgMzEuMjU0IDAgMTcuMjk1IDEzLjU5IDMxLjMxNCAzMC4zOTQgMzEuMzE0aDUzNnY1NTQuODI5bC01Ny42ODYgNTcuMjU1eiBtNjcuOTg0LTY2MS45NjlsLTQ3My40NzctMy4wMjhjMjguODM0LTE0LjEzNCAyOC44NTQtNDIuNTQgMjguODM0LTUxLjA4MS0wLjA3My0zMS44ODQtNC45MS00NS45ODQtMTMuMDQtNjEuNjk4bDQ3NC4wMjYtMC43OThjMjkuNzQgMCA2MC43NjUgMzEuMTg3IDYwLjc2NSA2MC4wODUgMCAyOC44OS0zMS40IDU1LjA0NC02MS4xMzggNTUuMDQ0bC0xNS45NyAxLjQ3NnogbTAgMCIgcC1pZD0iMjA3NSI+PC9wYXRoPjwvc3ZnPg=='
  const INTRODUCE_MESSAGE = document.createElement('div')
  INTRODUCE_MESSAGE.style.cssText = `
    overflow: scroll;
    `
  INTRODUCE_MESSAGE.innerHTML = `
    <h1> [计小白小课堂] 列表 </h1>
    <hr>
    <p>列表是可变序列，通常用于存放同类项目的集合（其中精确的相似程度将根据应用而变化）。</p>
    <br>
    <p><a href="https://docs.python.org/zh-cn/3/library/stdtypes.html?highlight=set#sequence-types-list-tuple-range">点击本处打开参考链接</a></p>
    `
  Blockly.defineBlocksWithJsonArray([
    {
      type: 'ast_list_mutator_with_container',
      message0: 'item 数量: %1 %2',
      args0: [{ type: 'input_dummy' }, { type: 'input_statement', name: 'STACK', align: 'RIGHT' }],
      colour: LIST_COLOR,
      enableContextMenu: false
    },
    {
      type: 'ast_list_mutator_with_item',
      message0: '列表元素',
      previousStatement: null,
      nextStatement: null,
      enableContextMenu: false,
      colour: LIST_COLOR
    }
  ])
  Blockly.Blocks['ast_list'] = {
    init: function () {
      this.jsonInit({
        message0: '介绍 %1',
        args0: [{ type: 'input_dummy', name: 'Introduction' }],
        inputsInline: false,
        output: 'LIST',
        colour: LIST_COLOR,
        extensions: ['basic_introduction_extension']
      })
      this.itemCount_ = 1
      this.INTRODUCE_MESSAGE = INTRODUCE_MESSAGE
      this.setMutator(new Blockly.icons.MutatorIcon(['ast_list_mutator_with_item'], this))
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
      let containerBlock = workspace.newBlock('ast_list_mutator_with_container')
      containerBlock.initSvg()
      let connection = containerBlock.getInput('STACK').connection
      for (let i = 0; i < this.itemCount_; i++) {
        let itemBlock = workspace.newBlock('ast_list_mutator_with_item')
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
        let connection = this.getInput('ITEM' + i).connection.targetConnection
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
        let input = this.getInput('ITEM' + i)
        itemBlock.valueConnection_ = input && input.connection.targetConnection
        i++
        itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock()
      }
    },
    updateShape_: function () {
      if (this.itemCount_ && this.getInput('EMPTY')) {
        this.removeInput('EMPTY')
      } else if (!this.itemCount_ && !this.getInput('EMPTY')) {
        this.appendDummyInput('EMPTY').appendField(Blockly.Msg['AST_EMPTY_LIST'])
      }
      let i = 0
      for (; i < this.itemCount_; i++) {
        if (!this.getInput('ITEM' + i)) {
          let input = this.appendValueInput('ITEM' + i).setAlign(inputs.Align.RIGHT)
          if (i !== 0) {
            input.appendField(', ').setAlign(inputs.Align.RIGHT)
          }
        }
        if (i === 0) {
          let input = this.getInput('ITEM0')
          input.removeField('label', true)
          input.appendField(Blockly.Msg['AST_CREATE_LIST'] + this.itemCount_, 'label')
        }
      }
      while (this.getInput('ITEM' + i)) {
        this.removeInput('ITEM' + i)
        i++
      }
      if (this.getInput('TAIL')) {
        this.removeInput('TAIL')
      }
      if (this.itemCount_) {
        let tail = this.appendDummyInput('TAIL')
        if (this.itemCount_ === 1) {
          tail.appendField(',]')
        } else {
          tail.appendField(']')
        }
        tail.setAlign(inputs.Align.RIGHT)
      }
    }
  }

  pythonGenerator.forBlock['ast_list'] = function (block: any) {
    let elements = new Array(block.itemCount_)
    for (let i = 0; i < block.itemCount_; i++) {
      elements[i] =
        pythonGenerator.valueToCode(block, 'ITEM' + i, Order.NONE) || 'None'
    }
    let requiredComma = ''
    if (block.itemCount_ === 1) {
      requiredComma = ', '
    }
    let code = '[' + elements.join(', ') + requiredComma + ']'
    return [code, Order.ATOMIC]
  }

  Blockly.Blocks['list_append'] = {
    init: function () {
      this.appendValueInput('LIST_APPEND')
        .appendField('添加一个元素')
        .appendField(new Blockly.FieldVariable('li'), 'NAME')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(LIST_COLOR)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }
  pythonGenerator.forBlock['list_append'] = function (block: any) {
    let name = pythonGenerator.nameDB_!.getName(
      block.getFieldValue('NAME'),
      Blockly.VARIABLE_CATEGORY_NAME
    )
    let otherIter = pythonGenerator.valueToCode(block, 'LIST_APPEND', Order.ATOMIC)
    return `${name}.append(${otherIter})\n`
  }

  Blockly.Blocks['list_extend'] = {
    init: function () {
      this.appendValueInput('LIST_EXTEND')
        .appendField('添加一系列元素')
        .appendField(new Blockly.FieldVariable('li'), 'NAME')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(LIST_COLOR)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }
  pythonGenerator.forBlock['list_extend'] = function (block: any) {
    let name = pythonGenerator.nameDB_!.getName(
      block.getFieldValue('NAME'),
      Blockly.VARIABLE_CATEGORY_NAME
    )
    let otherIter = pythonGenerator.valueToCode(block, 'LIST_EXTEND', Order.ATOMIC)
    return `${name}.extend(${otherIter})\n`
  }
  Blockly.Blocks['list_clear'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('清空')
        .appendField(new Blockly.FieldVariable('zs'), 'NAME')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(LIST_COLOR)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }
  pythonGenerator.forBlock['list_clear'] = function (block: any) {
    let name = pythonGenerator.nameDB_!.getName(
      block.getFieldValue('NAME'),
      Blockly.VARIABLE_CATEGORY_NAME
    )
    return `${name}.clear()\n`
  }
}
