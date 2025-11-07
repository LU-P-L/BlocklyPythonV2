/**
 * AST try except 依据: https://docs.python.org/3/reference/grammar.html#:~:text=as%27%20star_target%20%26(%27%2C%27%20%7C%20%27)%27%20%7C%20%27%3A%27)%20%0A%20%20%20%20%7C%20expression-,try_stmt,-%3A%0A%20%20%20%20%7C%20%27try%27%20%27%3A%27%20block%20finally_block
 * @author ChirsJaunes
 */
import type * as TmpBlockly from 'blockly'
import { Order, type PythonGenerator } from 'blockly/python'

export function addTryExceptBlocks(
  Blockly: typeof TmpBlockly,
  pythonGenerator: PythonGenerator,
) {
  const TRY_EXCEPT_COLOR = '#7FB6FF'
  const INTRODUCE_MESSAGE = document.createElement('div')
  INTRODUCE_MESSAGE.style.cssText = `
        overflow: scroll;
    `
  INTRODUCE_MESSAGE.innerHTML = `
    <h1> [计小白小课堂] 异常管理器 By ChrisJaunes</h1>
    <hr>
    `
  Blockly.Msg['AST_TRY_MUTATOR_WITH_CONTAINER'] = '异常类型数量'
  Blockly.Msg['AST_TRY_MUTATOR_WITH_ITEM'] = '异常类型'

  let HANDLERS_CATCH_ALL = 0
  let HANDLERS_NO_AS = 1
  let HANDLERS_COMPLETE = 3
  Blockly.defineBlocksWithJsonArray([
    {
      type: 'ast_try_mutator_with_container',
      message0: '异常类型数量: %1 %2',
      args0: [{ type: 'input_dummy' }, { type: 'input_statement', name: 'STACK', align: 'RIGHT' }],
      colour: TRY_EXCEPT_COLOR,
      enableContextMenu: false
    },
    {
      type: 'ast_try_mutator_with_item',
      message0: '异常类型',
      previousStatement: null,
      nextStatement: null,
      enableContextMenu: false,
      colour: TRY_EXCEPT_COLOR
    }
  ])
  Blockly.Blocks['ast_try'] = {
    init: function () {
      this.jsonInit({
        message0: '介绍 %1',
        args0: [{ type: 'input_dummy', name: 'Introduction' }],
        message1: '捕获:',
        message2: 'do %1',
        args2: [{ type: 'input_statement', name: 'BODY' }],
        inputsInline: false,
        previousStatement: null,
        nextStatement: null,
        colour: TRY_EXCEPT_COLOR,
        extensions: ['basic_introduction_extension']
      })
      this.handlersCount_ = 0
      this.handlers_ = []
      this.hasElse_ = false
      this.hasFinally_ = false
      this.INTRODUCE_MESSAGE = INTRODUCE_MESSAGE
      this.setMutator(new Blockly.icons.MutatorIcon(['ast_try_mutator_with_item'], this))
      this.updateShape_()
    },
    mutationToDom: function () {
      let container = document.createElement('mutation')
      container.setAttribute('handlers_count', this.handlersCount_)
      container.setAttribute('or_else', this.hasElse_)
      container.setAttribute('final_body', this.hasFinally_)
      for (let i = 0; i < this.handlersCount_; i++) {
        let parameter = document.createElement('handled_type')
        parameter.setAttribute('name', this.handlers_[i])
        container.appendChild(parameter)
      }
      return container
    },
    domToMutation: function (xmlElement: any) {
      this.handlersCount_ = parseInt(xmlElement.getAttribute('handlers_count'), 10)
      this.hasElse_ = xmlElement.getAttribute('or_else') === 'true'
      this.hasFinally_ = xmlElement.getAttribute('final_body') === 'true'
      this.handlers_ = []
      // eslint-disable-next-line no-cond-assign
      for (let i = 0, childNode; (childNode = xmlElement.childNodes[i]); i++) {
        if (childNode.nodeName.toLowerCase() === 'handled_type') {
          this.handlers_.push(parseInt(childNode.getAttribute('name'), 10))
        }
      }
      this.updateShape_()
    },
    saveExtraState: function() {
      return {
        'handlers_count': this.handlersCount_,
        'has_else': this.hasElse_,
        'has_finally': this.hasFinally_,
        'handlers': this.handlers_,
      };
    },
    loadExtraState: function(state: any) {
      this.handlersCount_ = state['handlers_count'];
      this.hasElse_ = state['has_else'];
      this.hasFinally_ = state['has_finally'];
      this.handlers_ = state['handlers'];
      this.updateShape_();
    },
    decompose: function (workspace: any) {
      let containerBlock = workspace.newBlock('ast_try_mutator_with_container')
      containerBlock.initSvg()
      let connection = containerBlock.getInput('STACK').connection
      for (let i = 0; i < this.handlersCount_; i++) {
        let itemBlock = workspace.newBlock('ast_try_mutator_with_item')
        itemBlock.initSvg()
        connection.connect(itemBlock.previousConnection)
        connection = itemBlock.nextConnection
      }
      return containerBlock
    },
    compose: function (containerBlock: any) {
      let itemBlock = containerBlock.getInputTargetBlock('STACK')
      let connections = []
      while (itemBlock) {
        connections.push(itemBlock.valueConnection_)
        itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock()
      }
      for (let i = 0; i < this.handlersCount_; i++) {
        let connection = this.getInput('HANDLER' + i).connection.targetConnection
        if (connection && connections.indexOf(connection) == -1) {
          connection.disconnect()
        }
      }
      this.handlers_ = new Array(connections.length)
      this.handlersCount_ = connections.length
      this.updateShape_()
      for (let i = 0; i < this.handlersCount_; i++) {
        if (connections[i]) {
          connections[i].reconnect(this, 'ITEM' + i)
        }
      }
    },
    saveConnections: function (containerBlock: any) {
      let itemBlock = containerBlock.getInputTargetBlock('STACK')
      let i = 0
      while (itemBlock) {
        let input = this.getInput('HANDLER' + i)
        itemBlock.valueConnection_ = input && input.connection.targetConnection
        i++
        itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock()
      }
    },
    updateShape_: function () {
      for (let i = 0; this.getInput('HANDLER' + i); i++) {
        this.removeInput('HANDLER' + i)
        this.removeInput('HANDLER_BODY' + i)
      }
      for (let i = 0; i < this.handlersCount_; i++) {
        if (this.handlers_[i] === HANDLERS_CATCH_ALL) {
          this.appendDummyInput('HANDLER' + i).appendField('异常')
        } else {
          let input = this.appendValueInput('HANDLER' + i)
            .setCheck(null)
            .appendField('异常')
          if (this.handlers_[i] === HANDLERS_COMPLETE) {
            input.appendField('命名为').appendField(new Blockly.FieldVariable('item'), 'NAME' + i)
          }
        }
        this.appendStatementInput('HANDLER_BODY' + i).setCheck(null)
      }
      if (this.getInput('OR_ELSE')) {
        this.removeInput('OR_ELSE')
        this.removeInput('OR_ELSE_BODY')
      }
      if (this.hasElse_) {
        this.appendDummyInput('OR_ELSE').appendField('else:')
        this.appendStatementInput('OR_ELSE_BODY').setCheck(null)
      }
      if (this.getInput('FINAL')) {
        this.removeInput('FINAL')
        this.removeInput('FINAL_BODY')
      }
      if (this.hasFinally_) {
        this.appendDummyInput('FINAL').appendField('finally:')
        this.appendStatementInput('FINAL_BODY').setCheck(null)
      }
    }
  }

  pythonGenerator.forBlock['ast_try'] = function (block: any) {
    let body = pythonGenerator.statementToCode(block, 'BODY') || pythonGenerator.PASS
    let handlers = new Array(block.handlersCount_)
    for (let i = 0; i < block.handlersCount_; i++) {
      let level = block.handlers_[i]
      let clause = 'except'
      if (level !== HANDLERS_CATCH_ALL) {
        clause += ' ' + pythonGenerator.valueToCode(block, 'HANDLER' + i, Order.NONE) || ''
        if (level === HANDLERS_COMPLETE) {
          clause +=
            ' as ' +
            pythonGenerator.nameDB_!.getName(
              block.getFieldValue('NAME' + i),
              Blockly.VARIABLE_CATEGORY_NAME
            )
        }
      }
      clause +=
        ':\n' + (pythonGenerator.statementToCode(block, 'HANDLER_BODY' + i) || pythonGenerator.PASS)
      handlers[i] = clause
    }
    let orelse = ''
    if (this.hasElse_) {
      orelse =
        'else:\n' + (pythonGenerator.statementToCode(block, 'OR_ELSE_BODY') || pythonGenerator.PASS)
    }
    let finalbody = ''
    if (this.hasFinally_) {
      finalbody =
        'finally:\n' +
        (pythonGenerator.statementToCode(block, 'FINAL_BODY') || pythonGenerator.PASS)
    }
    return 'try:\n' + body + handlers.join('') + orelse + finalbody
  }
}
