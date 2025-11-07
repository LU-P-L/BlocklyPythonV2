import TmpBlockly from 'blockly'
import { Order } from 'blockly/python'

export function addTurtleBlocksV2(
    blocks: typeof TmpBlockly.Blocks,
    pythonGenerator: TmpBlockly.Generator,
    Blockly: typeof TmpBlockly,
    content: any
){
    let key_all_list: [string, string, Order][] = [
        ['a','A',Order.ATOMIC],
        ['b','B',Order.ATOMIC],
        ['c','C',Order.ATOMIC],
        ['d','D',Order.ATOMIC],
        ['e','E',Order.ATOMIC],
        ['f','F',Order.ATOMIC],
        ['g','G',Order.ATOMIC],
        ['h','H',Order.ATOMIC],
        ['i','I',Order.ATOMIC],
        ['j','J',Order.ATOMIC],
        ['k','K',Order.ATOMIC],
        ['l','L',Order.ATOMIC],
        ['m','M',Order.ATOMIC],
        ['n','N',Order.ATOMIC],
        ['o','O',Order.ATOMIC],
        ['p','P',Order.ATOMIC],
        ['q','Q',Order.ATOMIC],
        ['r','R',Order.ATOMIC],
        ['s','S',Order.ATOMIC],
        ['t','T',Order.ATOMIC],
        ['u','U',Order.ATOMIC],
        ['v','V',Order.ATOMIC],
        ['w','W',Order.ATOMIC],
        ['x','X',Order.ATOMIC],
        ['y','Y',Order.ATOMIC],
        ['z','Z',Order.ATOMIC],
        ['UP','↑',Order.ATOMIC],
        ['DOWN','↓',Order.ATOMIC],
        ['LEFT','←',Order.ATOMIC],
        ['RIGHT','→',Order.ATOMIC],
        ['BACKSPACE','退格',Order.ATOMIC],
        ['CLEAR','Clear清除',Order.ATOMIC],
        ['RETURN','Enter回车',Order.ATOMIC],
        ['PAUSE','Pause Break中断',Order.ATOMIC],
        ['ESCAPE','Esc退出',Order.ATOMIC],
        ['SPACE','空格',Order.ATOMIC],
        ['F1','F1',Order.ATOMIC],
        ['F2','F2',Order.ATOMIC],
        ['F3','F3',Order.ATOMIC],
        ['F4','F4',Order.ATOMIC],
        ['F5','F5',Order.ATOMIC],
        ['F6','F6',Order.ATOMIC],
        ['F7','F7',Order.ATOMIC],
        ['F8','F8',Order.ATOMIC],
        ['F9','F9',Order.ATOMIC],
        ['F10','F10',Order.ATOMIC],
        ['F11','F11',Order.ATOMIC],
        ['F12','F12',Order.ATOMIC],
        ['0','大键盘0',Order.ATOMIC],
        ['1','大键盘1',Order.ATOMIC],
        ['2','大键盘2',Order.ATOMIC],
        ['3','大键盘3',Order.ATOMIC],
        ['4','大键盘4',Order.ATOMIC],
        ['5','大键盘5',Order.ATOMIC],
        ['6','大键盘6',Order.ATOMIC],
        ['7','大键盘7',Order.ATOMIC],
        ['8','大键盘8',Order.ATOMIC],
        ['9','大键盘9',Order.ATOMIC],
        ['KP0','小键盘0',Order.ATOMIC],
        ['KP1','小键盘1',Order.ATOMIC],
        ['KP2','小键盘2',Order.ATOMIC],
        ['KP3','小键盘3',Order.ATOMIC],
        ['KP4','小键盘4',Order.ATOMIC],
        ['KP5','小键盘5',Order.ATOMIC],
        ['KP6','小键盘6',Order.ATOMIC],
        ['KP7','小键盘7',Order.ATOMIC],
        ['KP8','小键盘8',Order.ATOMIC],
        ['KP9','小键盘9',Order.ATOMIC],
    ]

    let key_all_dict: {[key: string]: [string, number]} = {}
    key_all_list.forEach(function(op){
        key_all_dict[op[1]]=[`${op[0]}`,op[2]]
    })

    Blockly.defineBlocksWithJsonArray([
        {
            type: 'pygame_sample',
            message0: 'pygame_sample',
            inputsInline: false,
            previousStatement: null,
            nextStatement: null,
            colour: '#7FB6FF'
        },
        {
            type: 'pygame_init_block',
            message0: 'pygame初始化',
            inputsInline: false,
            previousStatement: null,
            nextStatement: null,
            colour: '#0CC8D3'
        },
        {
            type: 'pygame_quit_block',
            message0: '退出pygame页面',
            inputsInline: false,
            previousStatement: null,
            nextStatement: null,
            colour: '#0CC8D3'
        },
        {
            type: 'pygame_display_flip_block',
            message0: 'pygame刷新页面',
            inputsInline: false,
            previousStatement: null,
            nextStatement: null,
            colour: '#0CC8D3'
        },
        {
            type: 'pygame_key_down_1',
            inputsInline: true,
            output:true,
            colour: '#8E7FFF',
            message0: '%1 %2 %3',
            args0: [
                '按键',
                { type: 'field_dropdown', name: 'buttonPressed', options: key_all_list },
                '被按下'
            ],
        },
        {
            type:'font_init',
            previousStatement: null,
            nextStatement: null,
            colour: '#0CC8D3',
            message0:'文字绘制初始化'
        },
        {
            type: 'pygame_event_QUIT',
            message0: '监测到窗口关闭',
            inputsInline: false,
            output:true,
            colour: '#8E7FFF'
        }
    ])


    
    blocks['pygame_imageload_block'] = {
        init: function () {
            this.setInputsInline(false)//条件判断更改，false是接入 ，true是放在内部
            this.setPreviousStatement(false, null)//上一句连接 false无法连接
            this.setNextStatement(false, null)//下一句连接 false无法连接
            this.setColour('#0CC8D3')//设置框架颜色
            this.appendDummyInput()
                .appendField('加载图片：')
                .appendField(new Blockly.FieldTextInput('请输入图片相对路径'), 'string1')
            this.setOutput(true, null)
            
        }
    }
    blocks['pygame_time_delay_block'] = {
        init: function () {
            this.setInputsInline(true)//条件判断更改，false是接入 ，true是放在内部
            this.setPreviousStatement(true, null)//上一句连接 false无法连接
            this.setNextStatement(true, null)//下一句连接 false无法连接
            this.setColour('#0CC8D3')//设置框架颜色
            this.appendDummyInput()//
                .appendField('设置延迟 单位毫秒：')
                .appendField(new Blockly.FieldNumber(0), 'Number1')
            
        }
    }
    blocks['pygame_transform_scale_block'] = {
        init: function () {
            this.setInputsInline(true)//条件判断更改，false是接入 ，true是放在内部
            this.setPreviousStatement(false, null)//上一句连接 false无法连接
            this.setNextStatement(false, null)//下一句连接 false无法连接
            this.setColour('#0CC8D3')//设置框架颜色
            this.appendValueInput('string1').appendField('重设图片大小 图片：') //设置第一个嵌入条件
            this.appendDummyInput()
                .appendField('长：')
                .appendField(new Blockly.FieldNumber(0), 'string2')
            this.appendDummyInput()
                .appendField('宽：')
                .appendField(new Blockly.FieldNumber(0), 'string3')
            this.setOutput(true, null)
            
        }
    }
    blocks['pygame_set_title_block'] = {
        init: function () {
            this.setInputsInline(false)//条件判断更改，false是接入 ，true是放在内部
            this.setPreviousStatement(true, null)//上一句连接 false无法连接
            this.setNextStatement(true, null)//下一句连接 false无法连接
            this.setColour('#0CC8D3')//设置框架颜色
            this.appendDummyInput()
                .appendField('设置窗口标题：')
                .appendField(new Blockly.FieldTextInput('请输入标题'), 'string1')
        }
    }
    blocks['pygame_setmode_block'] = {
        init: function () {
            this.setInputsInline(true)//条件判断更改，false是接入 ，true是放在内部
            this.setPreviousStatement(false, null)//上一句连接 false无法连接
            this.setNextStatement(false, null)//下一句连接 false无法连接
            this.setColour('#0CC8D3')//设置框架颜色
            this.setOutput(true, null)
            this.appendDummyInput()//
                .appendField('设置窗口大小 长：')
                .appendField(new Blockly.FieldNumber(0), 'Number1')
            this.appendDummyInput()
                .appendField('宽：')
                .appendField(new Blockly.FieldNumber(0), 'Number2')
            
        }
    }
    blocks['pygame_event_get_block'] = {
        init: function () {
            this.setInputsInline(true)//条件判断更改，false是接入 ，true是放在内部
            this.setPreviousStatement(false, null)//上一句连接 false无法连接
            this.setNextStatement(false, null)//下一句连接 false无法连接
            this.setColour('#7BC259')//设置框架颜色
            this.setOutput(true, null)
            this.appendDummyInput().appendField('获取全部事件')
            //this.appendField('全部事件获取')
        }
    }
    blocks['pygame_set_font_block'] = {
        init: function () {
            this.setInputsInline(true)//条件判断更改，false是接入 ，true是放在内部
            this.setPreviousStatement(false, null)//上一句连接 false无法连接
            this.setNextStatement(false, null)//下一句连接 false无法连接
            this.setColour('#8E7FFF')//设置框架颜色

            this.appendDummyInput()
                .appendField('设置字体 字体名称：')
                .appendField(new Blockly.FieldTextInput('请输入字体名称'), 'string1')
            this.appendDummyInput()
                .appendField('字体大小：')
                .appendField(new Blockly.FieldNumber(0), 'string2')
            this.setOutput(true, null)
            
        }
    }

    blocks['font_write'] = {
        init: function () {
            this.setInputsInline(true)//条件判断更改，false是接入 ，true是放在内部
            this.setPreviousStatement(true, null)//上一句连接 false无法连接
            this.setNextStatement(true, null)//下一句连接 false无法连接
            this.setColour('#0CC8D3')//设置框架颜色
            this.appendValueInput('screen').appendField('窗口名称：') 
            this.appendValueInput('text').appendField('显示的文字：') 
            this.appendDummyInput()
                .appendField('X：')
                .appendField(new Blockly.FieldNumber(0), 'x_position')
            this.appendDummyInput()
                .appendField('Y：')
                .appendField(new Blockly.FieldNumber(0), 'y_position')
            this.appendValueInput('color').appendField('字体颜色：') 
            this.appendDummyInput()
                .appendField('设置字体 字体名称：')
                .appendField(new Blockly.FieldTextInput('请输入字体名称'), 'font_family')
            this.appendDummyInput()
                .appendField('字体大小：')
                .appendField(new Blockly.FieldNumber(18), 'font_size')
            
        }
    }

    
    pythonGenerator.forBlock['python_range'] = function (block) {
        let num1 = block.getFieldValue("Number1")
        let num2 = block.getFieldValue("Number2")
        let num3 = block.getFieldValue("Number3")
        let out_put = "range("+num1+","+num2+","+num3+")"
        return [out_put,Order.ATOMIC]
    }
    pythonGenerator.forBlock['pygame_event_QUIT'] = function () {
        return ['event.type == pygame.QUIT',Order.ATOMIC]
    }
    pythonGenerator.forBlock['pygame_key_down_1'] = function (block) {
        let tuple = key_all_dict[block.getFieldValue('buttonPressed')]
        let operator = tuple[0]
        return 'event.type == pygame.KEYDOWN and event.key == pygame.K_'+operator
    }
    pythonGenerator.forBlock['font_write'] = function (block) {
        let screen = block.getFieldValue('screen')
        let text = block.getFieldValue('text')
        let x_position = block.getFieldValue('x_position')
        let y_position = block.getFieldValue('y_position')
        let color = block.getFieldValue('color')
        let font_family = block.getFieldValue('font_family')
        let font_size = block.getFieldValue('font_size')
        let position = '(' + x_position + ',' + y_position + ')'
        let out_put = 'renderText('+screen+','+text+','+position+','+color+',"'+font_family+'",'+font_size+')'

        return out_put
        
    }
    pythonGenerator.forBlock['font_init'] = function () {
        return `
def renderText(screen,text, position,color,font_family,font_size):
    my_font = pygame.font.SysFont(font_family,font_size)
    text = my_font.render(text, True, color)
    #渲染
    screen.blit(text, position)
`
    }
    pythonGenerator.forBlock['pygame_init_block'] = function () {
        return 'pygame.init()\n'
    }
    pythonGenerator.forBlock['pygame_quit_block'] = function () {
        return 'pygame.quit()\n'
    }
    pythonGenerator.forBlock['pygame_imageload_block'] = function (block) {
        let test1 = block.getFieldValue('string1')
        let t2 = 'pygame.image.load("'+test1+'")'
        return [t2,Order.ATOMIC]
    }
    pythonGenerator.forBlock['pygame_time_delay_block'] = function (block) {
        let test1 = block.getFieldValue('Number1')
        return 'pygame.time.delay('+test1+')\n'
    }
    pythonGenerator.forBlock['pygame_transform_scale_block'] = function (block) {
        //let test = block.getFieldValue('string1')
        let test1 = pythonGenerator.valueToCode(block, 'string1', Order.NONE) || '需要填充'
        let test2 = block.getFieldValue('string2')
        let test3 = block.getFieldValue('string3')
        let abbove = 'pygame.transform.scale('+test1+',('+test2+','+test3+'))'
        return [abbove,Order.ATOMIC]
    }
    pythonGenerator.forBlock['pygame_display_flip_block'] = function () {
        return 'pygame.display.flip()\n'
    }
    pythonGenerator.forBlock['pygame_set_title_block'] = function (block) {
        let test1 = block.getFieldValue('string1')
        return 'pygame.display.set_caption("'+test1+'")\n'
    }
    pythonGenerator.forBlock['pygame_setmode_block'] = function (block) {
        let test1 = block.getFieldValue('Number1')
        let test2 = block.getFieldValue('Number2')
        let out_put = 'pygame.display.set_mode(('+test1+','+test2+'))'
        return [out_put,Order.ATOMIC]
    }
    pythonGenerator.forBlock['pygame_event_get_block'] = function () {
        return ['pygame.event.get()',Order.ATOMIC]
    }
    pythonGenerator.forBlock['pygame_set_font_block'] = function (block) {
        //let test = block.getFieldValue('string1')
        //let test1 = pythonGenerator.valueToCode(block, 'string1', Order.NONE) || pythonGenerator.blank
        let test2 = block.getFieldValue('string1')
        let test3 = block.getFieldValue('string2')
        let abbove = 'pygame.font.SysFont("'+test2+'",'+test3+')'
        return [abbove,Order.ATOMIC]
    }
    pythonGenerator.forBlock['pygame_sample'] = function () {
        return `
""" pygame.examples.chimp

This simple example is used for the line-by-line tutorial
that comes with pygame. It is based on a 'popular' web banner.
Note there are comments here, but for the full explanation,
follow along in the tutorial.
"""


# Import Modules
import asyncio
import os
import pygame
import pathlib

if not pygame.font:
    print("Warning, fonts disabled")
if not pygame.mixer:
    print("Warning, sound disabled")

main_dir = str(pathlib.Path(pygame.__file__).parent / "examples")
data_dir = os.path.join(main_dir, "data")


# functions to create our resources
def load_image(name, colorkey=None, scale=1):
    fullname = os.path.join(data_dir, name)
    image = pygame.image.load(fullname)
    image = image.convert()

    size = image.get_size()
    size = (size[0] * scale, size[1] * scale)
    image = pygame.transform.scale(image, size)

    if colorkey is not None:
        if colorkey == -1:
            colorkey = image.get_at((0, 0))
        image.set_colorkey(colorkey, pygame.RLEACCEL)
    return image, image.get_rect()


def load_sound(name):
    class NoneSound:
        def play(self):
            pass

    if not pygame.mixer or not pygame.mixer.get_init():
        return NoneSound()

    fullname = os.path.join(data_dir, name)
    sound = pygame.mixer.Sound(fullname)

    return sound


# classes for our game objects
class Fist(pygame.sprite.Sprite):
    """moves a clenched fist on the screen, following the mouse"""

    def __init__(self):
        pygame.sprite.Sprite.__init__(self)  # call Sprite initializer
        self.image, self.rect = load_image("fist.png", -1)
        self.fist_offset = (-235, -80)
        self.punching = False

    def update(self):
        """move the fist based on the mouse position"""
        pos = pygame.mouse.get_pos()
        self.rect.topleft = pos
        self.rect.move_ip(self.fist_offset)
        if self.punching:
            self.rect.move_ip(15, 25)

    def punch(self, target):
        """returns true if the fist collides with the target"""
        if not self.punching:
            self.punching = True
            hitbox = self.rect.inflate(-5, -5)
            return hitbox.colliderect(target.rect)

    def unpunch(self):
        """called to pull the fist back"""
        self.punching = False


class Chimp(pygame.sprite.Sprite):
    """moves a monkey critter across the screen. it can spin the
    monkey when it is punched."""

    def __init__(self):
        pygame.sprite.Sprite.__init__(self)  # call Sprite initializer
        self.image, self.rect = load_image("chimp.png", -1, 4)
        screen = pygame.display.get_surface()
        self.area = screen.get_rect()
        self.rect.topleft = 10, 90
        self.move = 18
        self.dizzy = False

    def update(self):
        """walk or spin, depending on the monkeys state"""
        if self.dizzy:
            self._spin()
        else:
            self._walk()

    def _walk(self):
        """move the monkey across the screen, and turn at the ends"""
        newpos = self.rect.move((self.move, 0))
        if not self.area.contains(newpos):
            if self.rect.left < self.area.left or self.rect.right > self.area.right:
                self.move = -self.move
                newpos = self.rect.move((self.move, 0))
                self.image = pygame.transform.flip(self.image, True, False)
        self.rect = newpos

    def _spin(self):
        """spin the monkey image"""
        center = self.rect.center
        self.dizzy = self.dizzy + 12
        if self.dizzy >= 360:
            self.dizzy = False
            self.image = self.original
        else:
            rotate = pygame.transform.rotate
            self.image = rotate(self.original, self.dizzy)
        self.rect = self.image.get_rect(center=center)

    def punched(self):
        """this will cause the monkey to start spinning"""
        if not self.dizzy:
            self.dizzy = True
            self.original = self.image


async def main():
    """this function is called when the program starts.
    it initializes everything it needs, then runs in
    a loop until the function returns."""
    # Initialize Everything
    pygame.init()
    screen = pygame.display.set_mode((1280, 480), pygame.SCALED)
    pygame.display.set_caption("Monkey Fever")
    pygame.mouse.set_visible(False)

    # Create The Background
    background = pygame.Surface(screen.get_size())
    background = background.convert()
    background.fill((170, 238, 187))

    # Display The Background
    screen.blit(background, (0, 0))
    pygame.display.flip()

    # Prepare Game Objects
    whiff_sound = load_sound("whiff.wav")
    punch_sound = load_sound("punch.wav")
    chimp = Chimp()
    fist = Fist()
    allsprites = pygame.sprite.RenderPlain((chimp, fist))
    clock = pygame.Clock()

    # Main Loop
    going = True
    while going:
        clock.tick(60)

        # Handle Input Events
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                going = False
            elif event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE:
                going = False
            elif event.type == pygame.MOUSEBUTTONDOWN:
                if fist.punch(chimp):
                    punch_sound.play()  # punch
                    chimp.punched()
                else:
                    whiff_sound.play()  # miss
            elif event.type == pygame.MOUSEBUTTONUP:
                fist.unpunch()

        allsprites.update()

        # Draw Everything
        screen.blit(background, (0, 0))
        allsprites.draw(screen)
        pygame.display.flip()
        await asyncio.sleep(0)

    pygame.quit()


# Game Over
main()`
    }
}