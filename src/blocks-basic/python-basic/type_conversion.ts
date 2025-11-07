/**
 * AST bin_op 依据: https://docs.python.org/3/reference/grammar.html#:~:text=is_bitwise_or%3A%20%27is%27%20bitwise_or-,bitwise_or,-%3A%0A%20%20%20%20%7C%20bitwise_or%20%27%7C%27%20bitwise_xor%20%0A%20%20%20%20%7C%20bitwise_xor
 * bin_op(Binary operator) 是 二元运算而不是二进制运算
 * 二元运算符含有以下符号：+, -, *, /, %, **, //, <<, >>, |, ^, &, @
 *
 * @author ChirsJaunes
 */
import type * as TmpBlockly from "blockly/core";
import type { Blocks, Block, CodeGenerator } from "blockly";
import { Order } from "blockly/python";

export function addTypeConversionBlocksV2(blocks: typeof Blocks, pythonGenerator: CodeGenerator, Blockly: typeof TmpBlockly, content: any) {
    let CONVERSION_LIST = [
        ['转换为一个整数', 'int'],
        ['转换为一个长整数', 'long'],
        ['转换为一个浮点数', 'float'],
        ['转换为一个复数', 'complex'],
        ['转换为一个字符串', 'str'],
        ['转换为一个元组', 'tuple'],
        ['转换为一个列表', 'list'],
        ['转换为一个可变集合', 'set'],
        ['转换为一个字典, 必须是一个序列(key,value)元组', 'dict'],
        ['转换为一个不可变集合', 'frozenset'],
        ['转换为一个字符, 必须是一个整数', 'chr'],
        ['转换为一个Unicode字符, 必须是一个整数', 'unichr'],
        ['转换为整数, 必须是一个字符', 'ord'],
        ['转换为一个十六进制字符串', 'hex'],
        ['转换为一个八进制字符串', 'oct'],

    ]

    Blockly.defineBlocksWithJsonArray([
        {
            type: 'ast_type_conversion',
            message0: '将 %1 %2',
            args0: [
                { type: 'field_dropdown', name: 'OP', options: CONVERSION_LIST },
                { type: 'input_value', name: 'VALUE' }
            ],
            inputsInline: true,
            output: null,
            colour: '#7FB6FF'
        }
    ])

    pythonGenerator.forBlock['ast_type_conversion'] = function (block: Block) {
        const op = block.getFieldValue('OP');
        const value = pythonGenerator.valueToCode(block, 'VALUE', Order.NONE)
        return `${op}(${value})`
    }
}