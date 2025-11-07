/**
 * AST with_stmt依据：https://docs.python.org/3/reference/grammar.html#:~:text=TYPE_COMMENT%5D%20block%20%5Belse_block%5D-,with_stmt,-%3A%0A%20%20%20%20%7C%20%27with%27%20%27(%27%20%27%2C%27.with_item%2B%20%27%2C%27%3F%20%27)%27%20%27%3A%27%20block
 *
 * @author ChirsJaunes
 */
import type * as TmpBlockly from 'blockly';
import { type Block } from 'blockly';
import { Order, type PythonGenerator } from "blockly/python";

export function addWithBlocks(
  Blockly: typeof TmpBlockly,
  pythonGenerator: PythonGenerator,
) {
  const WITH_COLOR = '#7FB6FF'
  const INTRODUCE_MESSAGE = document.createElement('div')
  INTRODUCE_MESSAGE.style.cssText = `
    overflow: scroll;
    `
  INTRODUCE_MESSAGE.innerHTML = `
    <h1> [计小白小课堂] 上下文管理器 By ChrisJaunes</h1>
    <hr>
    <p>with 语句适用于对资源进行访问的场合，确保不管使用过程中是否发生异常都会执行必要的“清理”操作，释放资源，比如文件使用后自动关闭、线程中锁的自动获取和释放等。
    <br>
    with 是 上下文管理协议，目的在于从流程图中把 try,except 和finally 关键字和资源分配释放相关代码统统去掉 简化try…except…finally的处理流程。
    <br>
    <br>with通过__enter__方法初始化,然后在__exit__中做善后以及处理异常。
    所以使用with处理的对象必须有__enter__()和__exit__()这两个方法。
    其中__enter__()方法在语句体(with语句包裹起来的代码块)执行之前进入运行, __exit__()方法在语句体执行完毕退出后运行。
    <br>
    </p>
    `
  Blockly.defineBlocksWithJsonArray([
    {
      type: 'ast_with_mutator_with_container',
      message0: 'item 数量: %1 %2',
      args0: [{ type: 'input_dummy' }, { type: 'input_statement', name: 'STACK', align: 'RIGHT' }],
      colour: WITH_COLOR,
      enableContextMenu: false
    },
    {
      type: 'ast_with_mutator_with_item',
      message0: 'with_item',
      previousStatement: null,
      nextStatement: null,
      enableContextMenu: false,
      colour: WITH_COLOR
    },
    {
      type: 'ast_with_with_item',
      output: 'WithItem',
      message0: '上下文表达式 %1',
      args0: [{ type: 'input_value', name: 'CONTEXT' }],
      enableContextMenu: false,
      colour: WITH_COLOR,
      inputsInline: false
    },
    {
      type: 'ast_with_with_item_as',
      output: 'WithItem',
      message0: '上下文表达式 %1 重命名为 %2',
      args0: [
        { type: 'input_value', name: 'CONTEXT' },
        { type: 'field_variable', name: 'AS', variable: 'fp' }
      ],
      colour: WITH_COLOR,
      enableContextMenu: false,
      inputsInline: true
    }
  ])
  Blockly.Blocks['ast_with'] = {
    itemCount_: undefined,
    init: function () {
      this.jsonInit({
        message0: '介绍 %1',
        args0: [{ type: 'input_dummy', name: 'Introduction' }],
        message1: '%1',
        args1: [{ type: 'input_value', name: 'ITEM0' }],
        message2: 'do %1',
        args2: [{ type: 'input_statement', name: 'BODY' }],
        inputsInline: false,
        previousStatement: null,
        nextStatement: null,
        colour: WITH_COLOR,
        extensions: ['basic_introduction_extension']
      })
      this.itemCount_ = 1
      this.INTRODUCE_MESSAGE = INTRODUCE_MESSAGE
      this.updateShape_()
      this.setMutator(new Blockly.icons.MutatorIcon(['ast_with_mutator_with_item'], this))
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
      return {'itemCount': this.itemCount_};
    },

    loadExtraState: function(state: any) {
      this.itemCount_ = state['itemCount'];
      this.updateShape_();
    },
    decompose: function (workspace: any) {
      let containerBlock = workspace.newBlock('ast_with_mutator_with_container')
      containerBlock.initSvg()
      let connection = containerBlock.getInput('STACK').connection
      for (let i = 0; i < this.itemCount_; i++) {
        let itemBlock = workspace.newBlock('ast_with_mutator_with_item')
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
        if (connections[i]) {
          connections[i].reconnect(this, 'ITEM' + i)
        }
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
      let i = 1
      for (; i < this.itemCount_; i++) {
        let input = this.getInput('ITEM' + i)
        if (!input) {
          input = this.appendValueInput('ITEM' + i)
        }
      }
      while (this.getInput('ITEM' + i)) {
        this.removeInput('ITEM' + i)
        i++
      }
      for (i = 0; i < this.itemCount_; i++) {
        this.moveInputBefore('ITEM' + i, 'BODY')
      }
    }
  }

  pythonGenerator.forBlock['ast_with_with_item'] = function (block: Block) {
    let context = pythonGenerator.valueToCode(block, 'CONTEXT', Order.NONE) || '';
    return [context, Order.NONE]
  }
  pythonGenerator.forBlock['ast_with_with_item_as'] = function (block: Block) {
    let context = pythonGenerator.valueToCode(block, 'CONTEXT', Order.NONE) ||'';
    let as = pythonGenerator.nameDB_!.getName(
      block.getFieldValue('AS'),
      Blockly.Names.NameType.VARIABLE
    )
    return [context + ' as ' + as, Order.NONE]
  }
  pythonGenerator.forBlock['ast_with'] = function (block: any) {
    let items = new Array(block.itemCount_)
    for (let i = 0; i < block.itemCount_; i++) {
      items[i] = pythonGenerator.valueToCode(block, 'ITEM' + i, Order.NONE) || '';
    }
    let body = pythonGenerator.statementToCode(block, 'BODY') || pythonGenerator.PASS
    return 'with ' + items.join(', ') + ':\n' + body
  }
}
