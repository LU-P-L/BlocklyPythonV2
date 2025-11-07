/**
 * AST tuple 依据: https://docs.python.org/3/reference/grammar.html#:~:text=listcomp%3A%0A%20%20%20%20%7C%20%27%5B%27%20named_expression%20for_if_clauses%20%27%5D%27-,tuple,-%3A%0A%20%20%20%20%7C%20%27(%27%20%5Bstar_named_expression%20%27%2C%27%20%5Bstar_named_expressions%5D%20%20%5D%20%27)%27%20%0Agroup
 * @author ChirsJaunes
 */
import type * as TmpBlockly from 'blockly'
import { inputs } from 'blockly'
import { Order, type PythonGenerator } from 'blockly/python'

export function addTupleBlocks(
  Blockly: typeof TmpBlockly,
  pythonGenerator: PythonGenerator,
) {
  const TUPLE_COLOR = '#7FB6FF'
  const INTRODUCE_MESSAGE = document.createElement('div')
  INTRODUCE_MESSAGE.style.cssText = `
    overflow: scroll;
    `
  INTRODUCE_MESSAGE.innerHTML = `
    <h1> [计小白小课堂] Tuple By ChrisJaunes</h1>
    <hr>
    `
  Blockly.defineBlocksWithJsonArray([
    {
      type: 'ast_tuple_mutator_with_container',
      message0: 'item 数量: %1 %2',
      args0: [{ type: 'input_dummy' }, { type: 'input_statement', name: 'STACK', align: 'RIGHT' }],
      colour: TUPLE_COLOR,
      enableContextMenu: false
    },
    {
      type: 'ast_tuple_mutator_with_item',
      message0: '元组元素',
      previousStatement: null,
      nextStatement: null,
      enableContextMenu: false,
      colour: TUPLE_COLOR
    }
  ])
  Blockly.Blocks['ast_tuple'] = {
    init: function () {
      this.jsonInit({
        message0: '介绍 %1',
        args0: [{ type: 'input_dummy', name: 'Introduction' }],
        inputsInline: false,
        output: 'TUPLE',
        colour: TUPLE_COLOR,
        extensions: ['basic_introduction_extension']
      })
      this.itemCount_ = 3
      this.INTRODUCE_MESSAGE = INTRODUCE_MESSAGE
      this.setMutator(new Blockly.icons.MutatorIcon(['ast_tuple_mutator_with_item'], this))
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
      let containerBlock = workspace.newBlock('ast_tuple_mutator_with_container')
      containerBlock.initSvg()
      let connection = containerBlock.getInput('STACK').connection
      for (let i = 0; i < this.itemCount_; i++) {
        let itemBlock = workspace.newBlock('ast_tuple_mutator_with_item')
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
        if (connection && connections.indexOf(connection) == -1) {
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
        this.appendDummyInput('EMPTY').appendField('()')
      }
      let i = 0
      for (; i < this.itemCount_; i++) {
        if (!this.getInput('ITEM' + i)) {
          let input = this.appendValueInput('ITEM' + i)
          if (i === 0) {
            input.appendField('(').setAlign(inputs.Align.RIGHT)
          } else {
            input.appendField(',').setAlign(inputs.Align.RIGHT)
          }
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
          tail.appendField(',)')
        } else {
          tail.appendField(')')
        }
        tail.setAlign(Blockly.inputs.Align.RIGHT)
      }
    }
  }

  pythonGenerator.forBlock['ast_tuple'] = function (block: any) {
    let elements = new Array(block.itemCount_)
    for (let i = 0; i < block.itemCount_; i++) {
      elements[i] = pythonGenerator.valueToCode(block, 'ITEM' + i, Order.NONE) || '';
    }
    let requiredComma = ''
    if (block.itemCount_ == 1) {
      requiredComma = ', '
    }
    let code = '(' + elements.join(', ') + requiredComma + ')'
    return [code, Order.ATOMIC]
  }
}
