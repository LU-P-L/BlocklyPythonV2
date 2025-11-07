/**
 * @author ChirsJaunes
 */
import type * as TmpBlockly from 'blockly'
import { Order, type PythonGenerator } from 'blockly/python'

export function addNumberBlocks(
  Blockly: typeof TmpBlockly,
  pythonGenerator: PythonGenerator,
) {
  const NUM_COLOR = '#7FB6FF'
  Blockly.Blocks['ast_number'] = {
    init: function () {
      this.appendDummyInput().appendField(new Blockly.FieldNumber(0), 'Number')
      this.setOutput(true, 'Number')
      this.setTooltip('')
      this.setColour(NUM_COLOR)
      this.setHelpUrl('')
    }
  }
  pythonGenerator.forBlock['ast_number'] = function (block: any) {
    let code: any = parseFloat(block.getFieldValue('Number'))
    let order
    if (code === Infinity) {
      code = 'float("inf")'
      order = Order.FUNCTION_CALL
    } else if (code === -Infinity) {
      code = '-float("inf")'
      order = Order.UNARY_SIGN
    } else {
      order = code < 0 ? Order.UNARY_SIGN : Order.ATOMIC
    }
    return [code, order]
  }
}
