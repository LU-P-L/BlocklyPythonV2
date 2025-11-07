import type * as TmpBlockly from 'blockly'
import {Order} from 'blockly/python'

// http://localhost:5173/browser_turtle-0.0.1-py3-none-any.whl

export function addTurtleBlocksV2(
  blocks: typeof TmpBlockly.Blocks,
  pythonGenerator: TmpBlockly.Generator,
  Blockly: typeof TmpBlockly,
  content: any
) {
  blocks['import_turtle'] = {
    init: function () {
      this.appendDummyInput().appendField(new Blockly.FieldLabelSerializable('导入小龟模块'), '')
      this.setInputsInline(false)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('导入小龟模块')
      this.setHelpUrl('')
    }
  }
  pythonGenerator.forBlock['import_turtle'] = function (block) {
    // TODO: Assemble Python into code variable.
    (pythonGenerator as any).definitions_['import_turtle'] = 'import turtle'
    return ''
  }

  // forward or backward block
  blocks['turtle_move'] = {
    init: function () {
      this.appendValueInput('steps')
        .setCheck('Number')
        .appendField('小龟')
        .appendField(
          new Blockly.FieldDropdown([
            ['前进', 'forward'],
            ['后退', 'back']
          ]),
          'option'
        )
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  pythonGenerator.forBlock['turtle_move'] = function (block) {
    let dropdownOption = block.getFieldValue('option')
    let valueSteps = pythonGenerator.valueToCode(block, 'steps', Order.ATOMIC)
    let code = `turtle.${dropdownOption}(${valueSteps})\n`
    return `turtle.${dropdownOption}(${valueSteps})\n`
  }

  // turn left or right block
  blocks['turtle_direction'] = {
    init: function () {
      this.appendValueInput('angle')
        .setCheck('Number')
        .appendField('小龟')
        .appendField(
          new Blockly.FieldDropdown([
            ['左转', 'left'],
            ['右转', 'right']
          ]),
          'direction'
        )
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  pythonGenerator.forBlock['turtle_direction'] = function (block) {
    let dropdownDirection = block.getFieldValue('direction')
    let valueAngle = pythonGenerator.valueToCode(block, 'angle', Order.ATOMIC)
    return `turtle.${dropdownDirection}(${valueAngle})\n`
  }

  // open or close the pen
  blocks['turtle_pen_operation'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('画笔')
        .appendField(
          new Blockly.FieldDropdown([
            ['抬起', 'up'],
            ['落下', 'down']
          ]),
          'pen'
        )
      this.setInputsInline(false)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  pythonGenerator.forBlock['turtle_pen_operation'] = function (block) {
    let dropdownPen = block.getFieldValue('pen')
    // TODO: Assemble Python into code variable.
    return `turtle.${dropdownPen}()\n`
  }

  // show or hide the turtle
  blocks['turtle_visible'] = {
    init: function () {
      this.appendDummyInput()
        .appendField(
          new Blockly.FieldDropdown([
            ['显示', 'turtle.st()'],
            ['隐藏', 'turtle.ht()']
          ]),
          'visible'
        )
        .appendField('小龟')
      this.setInputsInline(false)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  pythonGenerator.forBlock['turtle_visible'] = function (block) {
    return block.getFieldValue('visible')
  }

  // begin or end fill
  blocks['turtle_fill'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('小龟')
        .appendField(
          new Blockly.FieldDropdown([
            ['开始填充', 'turtle.begin_fill()'],
            ['结束填充', 'turtle.end_fill()']
          ]),
          'fill'
        )
      this.setInputsInline(false)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  pythonGenerator.forBlock['turtle_fill'] = function (block) {
    // TODO: Assemble Python into code variable.
    return block.getFieldValue('fill')
  }

  blocks['turtle_pensize'] = {
    init: function () {
      this.appendValueInput('size').appendField('设置画笔大小为')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  pythonGenerator.forBlock['turtle_pensize'] = function (block) {
    let valueSize = pythonGenerator.valueToCode(block, 'size', Order.ATOMIC)
    // TODO: Assemble Python into code variable.
    return 'turtle.pensize(' + valueSize + ')\n'
  }

  blocks['turtle_seth'] = {
    init: function () {
      this.appendValueInput('angle')
        .setCheck('Number')
        .appendField(new Blockly.FieldLabelSerializable('设置朝向'), 'NAME')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  pythonGenerator.forBlock['turtle_seth'] = function (block) {
    let valueSize = pythonGenerator.valueToCode(block, 'angle', Order.ATOMIC)
    // TODO: Assemble Python into code variable.
    return 'turtle.seth(' + valueSize + ')\n'
  }

  blocks['turtle_setpos'] = {
    init: function () {
      this.appendValueInput('x')
        .setCheck('Number')
        .appendField(new Blockly.FieldLabelSerializable('移动到：x ='), 'x')
      this.appendValueInput('y')
        .setCheck('Number')
        .appendField(new Blockly.FieldLabelSerializable('y = '), 'y')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  pythonGenerator.forBlock['turtle_setpos'] = function (block) {
    let valueX = pythonGenerator.valueToCode(block, 'x', Order.ATOMIC)
    let valueY = pythonGenerator.valueToCode(block, 'y', Order.ATOMIC)
    // TODO: Assemble Python into code variable.
    return 'turtle.setpos(' + valueX + ',' + valueY + ')\n'
  }

  blocks['turtle_color'] = {
    init: function () {
      this.appendValueInput('color')
        .setCheck(null)
        .appendField(new Blockly.FieldLabelSerializable('设置画笔颜色'), 'x')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  pythonGenerator.forBlock['turtle_color'] = function (block) {
    let valueColor = pythonGenerator.valueToCode(block, 'color', Order.ATOMIC)
    // TODO: Assemble Python into code variable.
    return 'turtle.color(' + valueColor + ')\n'
  }

  blocks['turtle_fill_color'] = {
    init: function () {
      this.appendValueInput('color')
        .setCheck(null)
        .appendField(new Blockly.FieldLabelSerializable('设置填充颜色'), 'NAME')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  pythonGenerator.forBlock['turtle_fill_color'] = function (block) {
    let valueColor = pythonGenerator.valueToCode(block, 'color', Order.ATOMIC)
    // TODO: Assemble Python into code variable.
    return 'turtle.fillcolor(' + valueColor + ')\n'
  }

  blocks['turtle_circle'] = {
    init: function () {
      this.appendValueInput('radius')
        .setCheck('Number')
        .setAlign(Blockly.inputs.Align.RIGHT)
        .appendField('画圆，设置半径为')
      this.appendValueInput('extent')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('设置弧度为')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  pythonGenerator.forBlock['turtle_circle'] = function (block) {
    let numberRadius = pythonGenerator.valueToCode(block, 'radius', Order.ATOMIC)
    let numberExtent = pythonGenerator.valueToCode(block, 'extent', Order.ATOMIC)
    let code = `turtle.circle(${numberRadius}, ${numberExtent})\n`
    return code
  }

  blocks['turtle_dot'] = {
    init: function () {
      this.appendValueInput('diameter')
        .setCheck('Number')
        .setAlign(Blockly.inputs.Align.RIGHT)
        .appendField('绘制实心圆，设置直径为')
      this.appendValueInput('color').setAlign(Blockly.inputs.Align.RIGHT).appendField('设置颜色为')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  pythonGenerator.forBlock['turtle_dot'] = function (block) {
    let numberDiameter = block.getFieldValue('diameter')
    let colourColor = block.getFieldValue('color')
    return `turtle.dot(${numberDiameter}, '${colourColor}')\n`
  }

  blocks['turtle_polygon'] = {
    init: function () {
      this.appendValueInput('radius')
        .setCheck('Number')
        .setAlign(Blockly.inputs.Align.RIGHT)
        .appendField('绘制多边形，设置半径为')
      this.appendValueInput('extent')
        .setCheck('Number')
        .setAlign(Blockly.inputs.Align.RIGHT)
        .appendField('设置弧度为')
      this.appendValueInput('steps')
        .setCheck('Number')
        .setAlign(Blockly.inputs.Align.RIGHT)
        .appendField('设置边数为')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  pythonGenerator.forBlock['turtle_polygon'] = function (block) {
    let numberRadius = block.getFieldValue('radius')
    let numberExtent = block.getFieldValue('extent')
    let numberSteps = block.getFieldValue('steps')
    return `turtle.circle(${numberRadius}, ${numberExtent}, ${numberSteps})\n`
  }

  blocks['turtle_speed'] = {
    init: function () {
      this.appendValueInput('speed').setCheck('Number').appendField('设置海龟速度')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  pythonGenerator.forBlock['turtle_speed'] = function (block) {
    let valueName = pythonGenerator.valueToCode(block, 'speed', Order.ATOMIC)
    // TODO: Assemble Python into code variable.
    return 'turtle.speed(' + valueName + ')\n'
  }

  blocks['turtle_hideturtle'] = {
    init: function () {
      this.appendDummyInput().appendField('隐藏小乌龟')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  pythonGenerator.forBlock['turtle_hideturtle'] = function (block) {
    // TODO: Assemble Python into code variable.
    return 'turtle.hideturtle();\n'
  }

  blocks['turtle_write'] = {
    init: function () {
      this.appendValueInput('arg')
        .setCheck('String')
        .setAlign(Blockly.inputs.Align.RIGHT)
        .appendField('设置书写内容')
      this.appendValueInput('size')
        .setCheck('Number')
        .setAlign(Blockly.inputs.Align.RIGHT)
        .appendField('设置字体大小为')
      this.setInputsInline(false)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  pythonGenerator.forBlock['turtle_write'] = function (block) {
    (pythonGenerator as any).definitions_['import_turtle'] = 'import turtle'
    let valueStr = pythonGenerator.valueToCode(block, 'arg', Order.ATOMIC)
    let valueSize = pythonGenerator.valueToCode(block, 'size', Order.ATOMIC)
    // TODO: Assemble Python into code variable.
    return `turtle.write(${valueStr}, font=('Arial', ${valueSize}, 'Normal'))\n`
  }

  blocks['turtle_shape'] = {
    init: function () {
      this.appendValueInput('shape').setCheck('String').appendField('设置画笔形状')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  pythonGenerator.forBlock['turtle_shape'] = function (block) {
    let valueStr = pythonGenerator.valueToCode(block, 'shape', Order.ATOMIC)
    // TODO: Assemble Python into code variable.
    return `turtle.shape(${valueStr})\n`
  }

  blocks['koch_line'] = {
    init: function () {
      this.appendDummyInput().appendField(new Blockly.FieldLabelSerializable('koch 曲线'), 'NAME')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }
  pythonGenerator.forBlock['koch_line'] = function (block) {
    // TODO: Assemble Python into code variable.
    return `#科勒曲线
import turtle
turtle.pensize(4)
turtle.pencolor('green')
turtle.penup()
turtle.goto(-100,0)
turtle.pendown()

#抽象步骤，如果是0阶，只需前行；如果是一阶，需要前行，转向，前行，转向，前行，转向，前行，
#共有的是前行，阶数需要控制转向的次数，所以边界是0阶，只需前行
def koch_line(n=3,len=120):
    if n==0:
        turtle.fd(len)
    else:
        for i in [0,60,-120,60]:
            turtle.left(i)
            koch_line(n-1,len/3)

koch_line()
turtle.done()
`
  }

  blocks['polygon'] = {
    init: function () {
      this.appendDummyInput().appendField(new Blockly.FieldLabelSerializable('polygon'), 'NAME')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }
  pythonGenerator.forBlock['polygon'] = function (block) {
    // TODO: Assemble Python into code variable.
    return `
import turtle as t
import time
def polygon():
    for x in range(360):
        t.forward(x)
        t.left(66)
    time.sleep(3)
polygon()
t.done()

`
  }
  blocks['pensanflower'] = {
    init: function () {
      this.appendDummyInput().appendField(
        new Blockly.FieldLabelSerializable('pensanflower'),
        'NAME'
      )
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }
  pythonGenerator.forBlock['pensanflower'] = function (block) {
    // TODO: Assemble Python into code variable.
    return `
import turtle as t
import time
def pensanflower():
    t.color("red","yellow")
    t.begin_fill()
    for _ in range(30):
        t.forward(200)
        t.left(170)
    t.end_fill()
    time.sleep(5)

pensanflower()
t.done()

`
  }

  blocks['turtle_done'] = {
    init: function () {
      this.appendDummyInput().appendField('结束绘制')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  pythonGenerator.forBlock['turtle_done'] = function (block) {
    // TODO: Assemble Python into code variable.
    let code = 'turtle.done();\n'
    return code
  }

  blocks['turtle_home'] = {
    init: function () {
      this.appendDummyInput().appendField('小龟回到起点')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  pythonGenerator.forBlock['turtle_home'] = function (block) {
    let code = 'turtle.home()\n'
    return code
  }

  blocks['turtle_setx'] = {
    init: function () {
      this.appendValueInput('x').appendField('设置小龟横坐标为')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  pythonGenerator.forBlock['turtle_setx'] = function (block) {
    let numberX = pythonGenerator.valueToCode(block, 'x', Order.ATOMIC)
    let code = `turtle.setx(${numberX});\n`
    return code
  }

  blocks['turtle_sety'] = {
    init: function () {
      this.appendValueInput('y').appendField('设置小龟纵坐标为')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  pythonGenerator.forBlock['turtle_sety'] = function (block) {
    let numberY = pythonGenerator.valueToCode(block, 'y', Order.ATOMIC)
    let code = `turtle.sety(${numberY});\n`
    return code
  }
}
