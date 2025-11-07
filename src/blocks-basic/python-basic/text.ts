import type * as TmpBlockly from 'blockly'
import { inputs, type CodeGenerator } from "blockly";
import { Order } from 'blockly/python'

export function addTextBlocks(
  Blockly: typeof TmpBlockly,
  pythonGenerator: CodeGenerator,
) {
  const TEXT_COLOR = '#7FB6FF'
  const INTRODUCE_MESSAGE = document.createElement('div')
  INTRODUCE_MESSAGE.style.cssText = `
    overflow: scroll;
    `
  INTRODUCE_MESSAGE.innerHTML = `
    <h1> [计小白小课堂] 文本 By ChrisJaunes</h1>
    <hr>
    `
  Blockly.defineBlocksWithJsonArray([
    {
      type: 'ast_text_join_item_with_container_mutator',
      message0: '拼接: %1 %2',
      args0: [{ type: 'input_dummy' }, { type: 'input_statement', name: 'STACK', align: 'RIGHT' }],
      colour: TEXT_COLOR,
      enableContextMenu: false
    },
    {
      type: 'ast_text_join_item_mutator_with_item',
      message0: '一行文本',
      previousStatement: null,
      nextStatement: null,
      enableContextMenu: false,
      colour: TEXT_COLOR
    }
  ])

  Blockly.Blocks['ast_text_join'] = {
    init: function () {
      this.jsonInit({
        message0: '介绍 %1',
        args0: [{ type: 'input_dummy', name: 'Introduction' }],
        inputsInline: false,
        output: 'Number',
        colour: TEXT_COLOR,
        extensions: ['basic_introduction_extension']
      })
      this.itemCount_ = 2
      this.INTRODUCE_MESSAGE = INTRODUCE_MESSAGE
      this.setMutator(new Blockly.icons.MutatorIcon(['ast_text_join_item_mutator_with_item'], this))
      this.updateShape_()
    },
    mutationToDom: function () {
      let container = document.createElement('mutation')
      container.setAttribute('itemCount_', this.itemCount_)
      return container
    },
    domToMutation: function (xmlElement: any) {
      this.itemCount_ = parseInt(xmlElement.getAttribute('itemCount_'), 10)
      this.updateShape_()
    },
    saveExtraState: function() {
      return { 'itemCount_': this.itemCount_ };
    },
    loadExtraState: function(state: any) {
      this.itemCount_ = state['itemCount_'];
      this.updateShape_();
    },
    decompose: function (workspace: any) {
      let containerBlock = workspace.newBlock('ast_text_join_item_with_container_mutator')
      containerBlock.initSvg()
      let connection = containerBlock.getInput('STACK').connection
      for (let i = 0; i < this.itemCount_; i++) {
        let itemBlock = workspace.newBlock('ast_text_join_item_mutator_with_item')
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
        if (connection && connections.indexOf(connection) == -1) {
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
        this.appendDummyInput('EMPTY').appendField('空字符串')
      }
      let i = 0
      for (; i < this.itemCount_; i++) {
        if (!this.getInput('ADD' + i)) {
          let input = this.appendValueInput('ADD' + i).setAlign(inputs.Align.RIGHT)
          if (i === 0) {
            input.appendField('创建字符串，内容：')
          }
        }
      }
      while (this.getInput('ADD' + i)) {
        this.removeInput('ADD' + i)
        i++
      }
    }
  }

  pythonGenerator.forBlock['ast_text_join'] = function (block: any) {
    if (block.itemCount_ === 0) return ["''", Order.ATOMIC]
    let elements = new Array(block.itemCount_)
    for (let i = 0; i < block.itemCount_; i++) {
      elements[i] =
        pythonGenerator.valueToCode(block, 'ADD' + i, Order.NONE) || "''"
    }
    let code = ''
    for (let i = 0; i < elements.length; ++i) {
      // console.log("here is the :  ");
      // console.log(elements[i][0]);
      if (elements[i][0] == "'" || elements[i][0] == '"') {
        code += elements[i]
      } else {
        code += 'str(' + elements[i] + ') '
      }
      if (i + 1 < elements.length) {
        code += ' + '
      } else {
        // code += "\n";
      }
    }
    return [code, Order.ATOMIC]
  }
}
