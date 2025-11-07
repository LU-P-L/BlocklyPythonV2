import type * as TmpBlockly from 'blockly'
import { Order, pythonGenerator as TmpGenerator } from 'blockly/python'

export function addDictBlocks(
  Blockly: typeof TmpBlockly,
  pythonGenerator: typeof TmpGenerator,
) {
  const DICT_COLOR = '#7FB6FF'

  const INTRODUCE_ICON =
    'data:image/svg+xml;base64,PHN2ZyB0PSIxNjQwMTUzMjIxMzA3IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjIwNzMiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cGF0aCBkPSJNNjQzLjYwMyA1NzQuNTQySDI4Mi41MzRjLTYuNTc1IDAtMTEuODc1IDguOTIzLTExLjg3NSAxOS44NzUgMCAxMC45NiA1LjMgMTkuODEzIDExLjg3NSAxOS44MTNoMzYxLjA2OWM2LjU2IDAgMTEuODY0LTguODUyIDExLjg2NC0xOS44MTMgMC0xMC45NjItNS4zMDUtMTkuODc1LTExLjg2NC0xOS44NzV6IG0wIDBNNjQzLjYwMyA0ODIuOTE3SDI4Mi41MzRjLTYuNTc1IDAtMTEuODc1IDguODg3LTExLjg3NSAxOS44ODIgMCAxMC45NTcgNS4zIDE5LjgxNCAxMS44NzUgMTkuODE0aDM2MS4wNjljNi41NiAwIDExLjg2NC04Ljg1OCAxMS44NjQtMTkuODE0IDAtMTAuOTk1LTUuMzA1LTE5Ljg4Mi0xMS44NjQtMTkuODgyeiBtMCAwTTY0My42MDMgMzkxLjM1NEgyODIuNTM0Yy02LjU3NSAwLTExLjg3NSA4Ljg2Mi0xMS44NzUgMTkuODIzIDAgMTAuOTU2IDUuMyAxOS44NDkgMTEuODc1IDE5Ljg0OWgzNjEuMDY5YzYuNTYgMCAxMS44NjQtOC44OTMgMTEuODY0LTE5Ljg1IDAtMTAuOTYtNS4zMDUtMTkuODIyLTExLjg2NC0xOS44MjJ6IG0wIDAiIHAtaWQ9IjIwNzQiPjwvcGF0aD48cGF0aCBkPSJNOTAwLjE1OCAxNzhjMC02Mi4zMDgtNTAuNjE0LTExMy4wMTctMTEyLjgyOS0xMTMuMDE3SDIzNC4yMDJjLTAuMjU4IDAtMC40ODMgMC4wMzktMC43NjQgMC4wNTUtMC4yNjMtMC4wMTYtMC41MDgtMC4wNTUtMC43NzEtMC4wNTUtNjAuNTcgMC0xMDkuODU2IDUwLjcwOS0xMDkuODU2IDExMy4wMTd2NjYwLjcwOWMwIDguMzI4IDMuMjY0IDE2LjI2IDkuMDg1IDIyLjAwM2w4OS43NTIgODkuMDU2YzExLjUxIDExLjM5OCAyOS43MTggMTEuMzk4IDQxLjIyNiAwbDkxLjU2NS05MC44NSA5NC45OTggOTQuMjQzYzExLjUxMiAxMS40NDggMjkuNzM2IDExLjQ0OCA0MS4yNDcgMGw5NS4wMDQtOTQuMjQ0IDk1LjAxMiA5NC4yNDRjNS43NTQgNS43MSAxMy4xOTEgOC41OCAyMC41OTggOC41OCA3LjQyOSAwIDE0Ljg3OS0yLjg3IDIwLjYzMy04LjU4bDg2LTg1LjMwOGM1LjgwNi01Ljc3OCA5LjA4My0xMy43MDYgOS4wODMtMjEuOTk4VjI4Ni45NmM0Ny44NDUtMTMuMTM4IDgzLjE0NC01Ni45NjMgODMuMTQ0LTEwOC45NjF6IG0tMTkzLjMgNzE5LjkzM2wtOTcuMzAzLTk2LjUzOWMtMTEuNzY2LTExLjcwNi0zMC40MS0xMS43MDYtNDIuMiAwbC05Ny4yOCA5Ni41MzktOTcuMjkzLTk2LjUzOWMtMTEuNzg4LTExLjcwNi0zMC40MzEtMTEuNzA2LTQyLjIyMyAwbC05My43NjUgOTMuMDEtNjEuNTA2LTYxVjE3MC4wODdjMC0yOS4zMzEgMjMuMTg0LTUzLjE4IDUxLjY4LTUzLjE4IDAuMjU2IDAgMC40ODQtMC4wNzYgMC43MTgtMC4wNzYgMC4zMDQgMCAwLjU3NiAwLjA3NyAwLjg1NyAwLjA3N2gwLjEwNmMzMC4xMyAwLjA2NyA1NC42MTYgMjMuOTA0IDU0LjYxNiA1My4xNzkgMCAyOS4zMjMtMjQuNTQxIDUzLjE5My01NC43MjIgNTMuMTkzLTE2LjgwNCAwLTMwLjM5NCAxMy45OC0zMC4zOTQgMzEuMjU0IDAgMTcuMjk1IDEzLjU5IDMxLjMxNCAzMC4zOTQgMzEuMzE0aDUzNnY1NTQuODI5bC01Ny42ODYgNTcuMjU1eiBtNjcuOTg0LTY2MS45NjlsLTQ3My40NzctMy4wMjhjMjguODM0LTE0LjEzNCAyOC44NTQtNDIuNTQgMjguODM0LTUxLjA4MS0wLjA3My0zMS44ODQtNC45MS00NS45ODQtMTMuMDQtNjEuNjk4bDQ3NC4wMjYtMC43OThjMjkuNzQgMCA2MC43NjUgMzEuMTg3IDYwLjc2NSA2MC4wODUgMCAyOC44OS0zMS40IDU1LjA0NC02MS4xMzggNTUuMDQ0bC0xNS45NyAxLjQ3NnogbTAgMCIgcC1pZD0iMjA3NSI+PC9wYXRoPjwvc3ZnPg=='
  const INTRODUCE_MESSAGE = document.createElement('div')
  INTRODUCE_MESSAGE.style.cssText = `
    height: 600px;
    overflow: scroll;
    `
  INTRODUCE_MESSAGE.innerHTML = `
    <h1> 映射关系 </h1>
    <hr>
    <p> 映射的本质就是一种对应关系</p>
    <p> 映射类型的典型代表是字典</p>
    <p> 字典可以把 KEY 对应成 VALUE</p>
    <p> 不过这个KEY需要受到一些限制，这个限制叫做<a href="https://docs.python.org/zh-cn/3.10/glossary.html#term-hashable" style="color:red">hashable</a></p>
    <h1> 字典的使用 </h1>
    <hr>
    <p> 字典提供了一系列的方法供我们使用 </p>
    <p> 以下是字典的创建，这些方法都是等价的，但掌握第一种就好啦 </p>
    <pre>
    a = {'one': 1, 'two': 2, 'three': 3}
    b = dict(one=1, two=2, three=3)
    c = dict(zip(['one', 'two', 'three'], [1, 2, 3]))
    d = dict([('two', 2), ('one', 1), ('three', 3)])
    e = dict({'three': 3, 'one': 1, 'two': 2})
    f = dict({'one': 1, 'three': 3}, two=2)
    </pre>
    <p> list(d) 返回字典 d 中使用的所有键的列表</p>
    <p> len(d) 返回字典 d 中的项数</p>
    <p> d[key] 返回 d 中以 key 为键的项 如果映射中不存在 key 则会引发 KeyError</p>
    <p> d[key] = value 将 d[key] 设为 value </p>
    <p> del d[key] 将 d[key] 从 d 中移除。 如果映射中不存在 key 则会引发 KeyError </p>
    <p> key in d 如果 d 中存在键 key 则返回 True，否则返回 False </p>
    <p> key not in d 等价于 not key in d </p>
    <p> iter(d) 返回以字典的键为元素的迭代器。 这是 iter(d.keys()) 的快捷方式 </p>
    <p> clear() 移除字典中的所有元素 </p>
    <p> copy() 返回原字典的浅拷贝 </p>
    <p> classmethod fromkeys(iterable[, value]) 使用来自 iterable 的键创建一个新字典，并将键值设为 value </p>
    <p> get(key[, default]) 如果 key 存在于字典中则返回 key 的值，否则返回 default。 如果 default 未给出则默认为 None，因而此方法绝不会引发 KeyError</p>
    <p> items() 返回由字典项 ((键, 值) 对) 组成的一个新视图。</p>
    <p> keys() 返回由字典键组成的一个新视图。 </p>
    <p> pop(key[, default]) 如果 key 存在于字典中则将其移除并返回其值，否则返回 default。 如果 default 未给出且 key 不存在于字典中，则会引发 KeyError</p>
    <p> popitem() 从字典中移除并返回一个 (键, 值) 对。 键值对会按 LIFO 的顺序被返回</p>
    <p> popitem() 适用于对字典进行消耗性的迭代，这在集合算法中经常被使用。 如果字典为空，调用 popitem() 将引发 KeyError </p>
    <p> update([other]) 使用来自 other 的键/值对更新字典，覆盖原有的键。 返回 None。</p>
    <p> values() 返回由字典值组成的一个新视图。两个 dict.values() 视图之间的相等性比较将总是返回 False。</p>
    `
  const DICT_DEFAULT_PAIR = '"[字典专用]不能脱离字典而存在"'
  Blockly.defineBlocksWithJsonArray([
    {
      type: 'ast_dict_mutator_with_container',
      message0: 'item 数量: %1 %2',
      args0: [{ type: 'input_dummy' }, { type: 'input_statement', name: 'STACK', align: 'RIGHT' }],
      colour: DICT_COLOR,
      enableContextMenu: false
    },
    {
      type: 'ast_dict_mutator_with_item',
      message0: '元组元素',
      previousStatement: null,
      nextStatement: null,
      enableContextMenu: false,
      colour: DICT_COLOR
    }
  ])
  Blockly.Blocks['ast_dict_with_item'] = {
    init: function () {
      this.appendValueInput('KEY').setCheck(null)
      this.appendValueInput('VALUE').setCheck(null).appendField(':')
      this.setInputsInline(true)
      this.setOutput(true, 'DICT_ITEM')
      this.setColour(DICT_COLOR)
    }
  }
  Blockly.Blocks['ast_dict'] = {
    init: function () {
      this.jsonInit({
        message0: '介绍 %1',
        args0: [{ type: 'input_dummy', name: 'Introduction' }],
        inputsInline: false,
        output: 'DICT',
        colour: DICT_COLOR,
        extensions: ['basic_introduction_extension']
      })
      this.itemCount_ = 1
      this.INTRODUCE_MESSAGE = INTRODUCE_MESSAGE
      this.setMutator(new Blockly.icons.MutatorIcon(['ast_dict_mutator_with_item'], this))
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
      let containerBlock = workspace.newBlock('ast_dict_mutator_with_container')
      containerBlock.initSvg()
      let connection = containerBlock.getInput('STACK').connection
      for (let i = 0; i < this.itemCount_; i++) {
        let itemBlock = workspace.newBlock('ast_dict_mutator_with_item')
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
        this.appendDummyInput('EMPTY').appendField(Blockly.Msg['AST_EMPTY_DICT'])
      }
      let i = 0
      for (; i < this.itemCount_; i++) {
        if (!this.getInput('ADD' + i)) {
          this.appendValueInput('ADD' + i)
            .setCheck('DICT_ITEM')
            .setAlign(Blockly.inputs.Align.RIGHT)
        }
        if (i === 0) {
          let input = this.getInput('ADD0')
          input.removeField('label', true)
          input.appendField(Blockly.Msg['AST_CREATE_DICT'] + this.itemCount_, 'label')
        }
      }
      while (this.getInput('ADD' + i)) {
        this.removeInput('ADD' + i)
        i++
      }
    }
  }

  pythonGenerator.forBlock['ast_dict'] = function (block: any) {
    let elements = new Array(block.itemCount_)
    for (let i = 0; i < block.itemCount_; i++) {
      let child = block.getInputTargetBlock('ADD' + i)
      if (child === null || child.type !== 'ast_dict_with_item') {
        elements[i] =
          `"${Blockly.Msg['AST_DICT_ITEM_KEY']}": "${Blockly.Msg['AST_DICT_ITEM_VALUE']}"`
        continue
      }
      let key =
        pythonGenerator.valueToCode(child, 'KEY', Order.NONE) ||
        `"${Blockly.Msg['AST_DICT_ITEM_KEY']}"`
      let value =
        pythonGenerator.valueToCode(child, 'VALUE', Order.NONE) ||
        `"${Blockly.Msg['AST_DICT_ITEM_VALUE']}"`
      elements[i] = `${key}: ${value}`
    }
    let code = '{' + elements.join(', ') + '}'
    return [code, Order.ATOMIC]
  }
  pythonGenerator.forBlock['ast_dict_with_item'] = function (block: any) {
    return [
      `"${Blockly.Msg['AST_DICT_ITEM_KEY']}": "${Blockly.Msg['AST_DICT_ITEM_VALUE']}"`,
      Order.ATOMIC
    ]
  }
  Blockly.Blocks['dict_option'] = {
    init: function () {
      let MODE: [string, string][] = [
        ['返回字典中使用的所有键的列表', 'LIST'],
        ['返回字典中的项数', 'LEN'],
        ['中括号形式访问字典中元素', 'GET_1'],
        ['get形式访问字典中元素', 'GET_2'],
        ['将d[key]设为value', 'SET'],
        ['将d[key]从d中移除', 'DEL'],
        ['字典中存在键key', 'EXIST'],
        ['移除字典中的所有元素', 'CLEAR'],
        ['返回原字典的浅拷贝', 'COPY'],
        ['返回由字典项((键,值)对)组成的一个新视图', 'ITEMS'],
        ['返回由字典键组成的一个新视图', 'KEYS'],
        ['如果 key 存在于字典中则将其移除并返回其值，否则返回default', 'POP'],
        [
          '如果字典存在键 key,返回它的值。如果不存在,插入值为default的键 key，并返回default',
          'SET_DEFAULT'
        ],
        ['使用来自 other 的键/值对更新字典，覆盖原有的键', 'UPDATE'],
        ['返回由字典值组成的一个新视图', 'VALUES']
      ]
      let that = this
      let modeMenu = new Blockly.FieldDropdown(MODE)
      this.appendValueInput('NAME').setCheck('Dict')
      this.appendDummyInput().appendField(modeMenu, 'OPTION').appendField('', 'SPACE')
      this.setInputsInline(true)
      this.setOutput(true)
      this.setColour(DICT_COLOR)
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
      if (this.getInput('KEY')) this.removeInput('KEY')
      if (this.getInput('DEFAULT_KEY')) this.removeInput('DEFAULT_KEY')
      if (this.getInput('OTHER_DICT')) this.removeInput('OTHER_DICT')
      if (this.getInput('VALUE')) this.removeInput('VALUE')
      if (
        value === 'LIST' ||
        value === 'LEN' ||
        value === 'COPY' ||
        value === 'ITEMS' ||
        value === 'KEYS' ||
        value === 'VALUES'
      ) {
        this.updateStatement_(false)
        return
      }
      if (value === 'GET_1') {
        this.appendValueInput('KEY')
        this.updateStatement_(false)
        return
      }
      if (value === 'GET_2' || value === 'SET_DEFAULT' || value === 'POP') {
        this.appendValueInput('KEY')
        this.appendValueInput('DEFAULT_KEY')
        this.updateStatement_(false)
        return
      }
      if (value === 'SET') {
        this.appendValueInput('KEY')
        this.appendValueInput('VALUE')
        this.updateStatement_(true)
        return
      }
      if (value === 'DEL') {
        this.appendValueInput('KEY')
        this.updateStatement_(true)
        return
      }
      if (value === 'EXIST') {
        this.appendValueInput('KEY')
        this.updateStatement_(false)
        return
      }
      if (value === 'CLEAR') {
        this.updateStatement_(true)
        return
      }
      if (value === 'UPDATE') {
        this.appendValueInput('OTHER_DICT')
        this.updateStatement_(true)
      }
    }
  }
  pythonGenerator.forBlock['dict_option'] = function (block: any) {
    let name = pythonGenerator.valueToCode(block, 'NAME', Order.NONE) || ''
    let option = block.getFieldValue('OPTION')
    switch (option) {
      case 'LIST':
        return [`list(${name})`, Order.NONE]
      case 'LEN':
        return [`len(${name})`, Order.NONE]
      case 'GET_1': {
        let key =
          pythonGenerator.valueToCode(block, 'KEY', Order.NONE) || '';
        return [`${name}[${key}]`, Order.NONE]
      }
      case 'GET_2': {
        let key = pythonGenerator.valueToCode(block, 'KEY', Order.NONE) || '';
        let defaultKey = pythonGenerator.valueToCode(block, 'DEFAULT_KEY', Order.NONE) || '';
        return [`${name}.get(${key}, ${defaultKey})`, Order.NONE]
      }
      case 'SET': {
        let key =
          pythonGenerator.valueToCode(block, 'KEY', Order.NONE) || '';
        let value = pythonGenerator.valueToCode(block, 'VALUE', Order.NONE) || '';
        return `${name}[${key}] = ${value}`
      }
      case 'DEL': {
        let key =
          pythonGenerator.valueToCode(block, 'KEY', Order.NONE) || '';
        return `del ${name}[${key}]`
      }
      case 'EXIST': {
        let key =
          pythonGenerator.valueToCode(block, 'KEY', Order.NONE) || ''
        return [`${key} in ${name}`, Order.NONE]
      }
      case 'CLEAR': {
        return `${name}.clear()`
      }
      case 'COPY': {
        return [`${name}.copy()`, Order.NONE]
      }
      case 'ITEMS': {
        return [`${name}.items()`, Order.NONE]
      }
      case 'KEYS': {
        return [`${name}.keys()`,Order.NONE]
      }
      case 'POP': {
        let key =
          pythonGenerator.valueToCode(block, 'KEY', Order.NONE) || ''
        let defaultKey =
          pythonGenerator.valueToCode(block, 'DEFAULT_KEY', Order.NONE) || ''
        return [`${name}.pop(${key}, ${defaultKey})`, Order.NONE]
      }
      case 'SET_DEFAULT': {
        let key =pythonGenerator.valueToCode(block, 'KEY', Order.NONE) || '';
        let defaultKey = pythonGenerator.valueToCode(block, 'DEFAULT_KEY', Order.NONE) || ''
        return [`${name}.setdefault(${key}, ${defaultKey})`, Order.NONE]
      }
      case 'UPDATE': {
        let otherDict =
          pythonGenerator.valueToCode(block, 'OTHER_DICT', Order.NONE) || '';
        return `${name}.update(${otherDict})`
      }
      case 'VALUES': {
        return [`${name}.values()`, Order.NONE];
      }
    }
    return '出现错误，请联系管理人员'
  }
}
