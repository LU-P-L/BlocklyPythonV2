/**
 * @author ChirsJaunes
 */
import type * as TmpBlockly from 'blockly';
import { type PythonGenerator } from 'blockly/python';

export function addNameBlocks(Blockly: typeof TmpBlockly, pythonGenerator: PythonGenerator) {
  Blockly.Variables.CUSTOM_CONTEXT_MENU_VARIABLE_GETTER_SETTER_MIXIN = {
    customContextMenu: function (options: any) {
      let name
      if (!this.isInFlyout) {
        let oppositeType, contextMenuMsg
        if (this.type === 'ast_name') {
          oppositeType = 'ast_assign'
          contextMenuMsg = Blockly.Msg['VARIABLES_GET_CREATE_SET']
        } else {
          oppositeType = 'ast_name'
          contextMenuMsg = Blockly.Msg['VARIABLES_SET_CREATE_GET']
        }

        let option: any = { enabled: this.workspace.remainingCapacity() > 0 }
        name = this.getField('var').getText()
        option.text = contextMenuMsg.replace('%1', name)
        let xmlField = document.createElement('field')
        xmlField.setAttribute('name', 'var')
        xmlField.appendChild(document.createTextNode(name))
        let xmlBlock = document.createElement('block')
        xmlBlock.setAttribute('type', oppositeType)
        xmlBlock.appendChild(xmlField)
        option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock)
        options.push(option)
      } else {
        if (this.type === 'ast_name' || this.type === 'variables_get_reporter') {
          let renameOption = {
            text: Blockly.Msg.RENAME_VARIABLE,
            enabled: true,
            callback: Blockly.Constants.Variables.RENAME_OPTION_CALLBACK_FACTORY(this)
          }
          name = this.getField('var').getText()
          let deleteOption = {
            text: Blockly.Msg.DELETE_VARIABLE.replace('%1', name),
            enabled: true,
            callback: Blockly.Constants.Variables.DELETE_OPTION_CALLBACK_FACTORY(this)
          }
          options.unshift(renameOption)
          options.unshift(deleteOption)
        }
      }
    }
  }
  try {
    Blockly.Extensions.registerMixin(
        'contextMenu_variableSetterGetter_forAst',
        Blockly.Variables.CUSTOM_CONTEXT_MENU_VARIABLE_GETTER_SETTER_MIXIN
    )
  } catch (e) {

  }


  Blockly.defineBlocksWithJsonArray([
    {
      type: 'ast_name',
      message0: '%1',
      args0: [{ type: 'field_variable', name: 'VAR', variable: '%{BKY_VARIABLES_DEFAULT_NAME}' }],
      output: null,
      extensions: ['contextMenu_variableSetterGetter_forAst']
    }
  ])
  pythonGenerator.forBlock['ast_name'] = function (block: any) {
    // Variable getter.
    let code = pythonGenerator.nameDB_.getName(
      block.getFieldValue('VAR'),
      Blockly.Names.NameType.VARIABLE
    )
    return [code, pythonGenerator.ORDER_ATOMIC]
  }
}
