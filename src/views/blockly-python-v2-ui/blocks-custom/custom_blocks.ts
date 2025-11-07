import {addTurtleBlocksV2} from "./blocks-pygame";

export function addCustomBlocksV2(blocks: any, pythonGenerator: any, workspace: any, Blockly: any, content: any): any {
    console.log("add_custom_blocks_v2 load", blocks, pythonGenerator, workspace, Blockly, content);
    addTurtleBlocksV2(blocks, pythonGenerator, Blockly, content);
    const thatPyodideRuntimeInitHook = window.PyodideRuntimeInitHook
    window.PyodideRuntimeInitHook = (context)=> {
        console.log(context)
        context.pyodide.loadPackage(["pygame-ce"], { checkIntegrity: false })
        if (thatPyodideRuntimeInitHook !== undefined) {
            thatPyodideRuntimeInitHook(context)
        }
    }
    return {
        kind: 'categoryToolbox',
        contents: [
            {
                "kind": "category",
                "name": "Python Basic",
                "contents": [
                    {
                        kind: 'category',
                        name: '样例(开发用)',
                        contents: [
                            {
                                kind: 'block',
                                type: 'python_example_matplotlib_1'
                            },
                            {
                                kind: 'block',
                                type: 'lists_getIndex'
                            },
                            {
                                kind: 'block',
                                type: 'pygame_sample'
                            }
                        ]
                    },
                    {
                        kind: 'category',
                        name: '自定义类',
                        custom: 'CLASS_DEF_PALETTE'
                    },

                    {
                        kind: 'category',
                        name: '类',
                        contents: [
                            {
                                kind: 'block',
                                type: 'class_type2'
                            },
                            {
                                kind: 'block',
                                type: 'class_function2'
                            },
                            {
                                kind: 'block',
                                type: 'class_get2'
                            },
                            // {
                            //   kind: 'block',
                            //   type: 'ast_methods'
                            // },

                            {
                                kind: 'block',
                                type: 'ast_reference2'
                            },

                            {
                                kind: 'block',
                                type: 'ast_ref_method2'
                            },
                            {
                                kind: 'block',
                                type: 'ast_inst2'
                            },

                        ]
                    },

                    {
                        kind: 'category',
                        name: '模块导入',
                        custom: 'IMPORT'
                    },
                    {
                        kind: 'category',
                        name: '模块导入PYODIDE',
                        custom: 'IMPORT_PYODIDE'
                    },
                    {
                        kind: 'category',
                        name: '输入输出',
                        contents: [
                            {
                                kind: 'block',
                                type: 'raw_input'
                            },
                            {
                                kind: 'block',
                                type: 'int_input'
                            },
                            {
                                kind: 'block',
                                type: 'input_with_info'
                            },
                            {
                                kind: 'block',
                                type: 'print'
                            },
                            {
                                kind: 'block',
                                type: 'print_end_with'
                            }
                        ]
                    },
                    {
                        kind: 'category',
                        name: '运算',
                        contents: [
                            {
                                kind: 'block',
                                type: 'ast_bin_op'
                            },
                            {
                                kind: 'block',
                                type: 'ast_bool_op'
                            },
                            {
                                kind: 'block',
                                type: 'ast_compare'
                            }
                        ]
                    },
                    {
                        kind: 'category',
                        name: '控制结构',
                        contents: [
                            {
                                kind: 'block',
                                type: 'ast_break'
                            },

                            {
                                name: 'continue',
                                kind: 'block',
                                type: 'ast_continue'
                            },
                            {
                                kind: 'block',
                                type: 'ast_for_stmt'
                            },
                            {
                                kind: 'block',
                                type: 'ast_if'
                            },
                            {
                                kind: 'block',
                                type: 'ast_pass'
                            },
                            {
                                kind: 'block',
                                type: 'ast_while'
                            },
                            {
                                kind: 'block',
                                type: 'ast_with'
                            }
                        ]
                    },
                    {
                        kind: 'category',
                        name: '数据类型',
                        contents: [
                            {
                                kind: 'block',
                                type: 'ast_NameConstantBoolean'
                            },
                            {
                                kind: 'block',
                                type: 'ast_number'
                            },
                            {
                                kind: 'block',
                                type: 'ast_NameConstantNone'
                            },
                            {
                                kind: 'block',
                                type: 'ast_str'
                            },
                            {
                                kind: 'block',
                                type: 'ast_str_multiline'
                            },
                            {
                                kind: 'block',
                                type: 'ast_str_docstring'
                            },
                            {
                                kind: 'block',
                                type: 'ast_text_join'
                            },
                            {
                                kind: 'block',
                                type: 'ast_str_char'
                            },
                            {
                                kind: 'block',
                                type: 'ast_list'
                            },
                            {
                                kind: 'block',
                                type: 'list_append'
                            },
                            {
                                kind: 'block',
                                type: 'list_extend'
                            },
                            {
                                kind: 'block',
                                type: 'list_clear'
                            },
                            {
                                kind: 'block',
                                type: 'ast_tuple'
                            },
                            {
                                kind: 'block',
                                type: 'ast_set'
                            },
                            {
                                kind: 'block',
                                type: 'set_option'
                            },
                            {
                                kind: 'block',
                                type: 'ast_dict'
                            },
                            {
                                kind: 'block',
                                type: 'ast_dict_with_item'
                            },
                            {
                                kind: 'block',
                                type: 'dict_option'
                            }
                        ]
                    },
                    {
                        kind: 'category',
                        name: '基础 python 块',
                        contents: [
                            // {
                            //   kind: 'block',
                            //   type: 'ast_add'
                            // },
                            {
                                kind: 'block',
                                type: 'ast_assert'
                            },
                            {
                                kind: 'block',
                                type: 'ast_assign'
                            },
                            {
                                kind: 'block',
                                type: 'ast_bin_op'
                            },
                            {
                                kind: 'block',
                                type: 'ast_bool_op'
                            },
                            {
                                kind: 'block',
                                type: 'ast_break'
                            },
                            {
                                kind: 'block',
                                type: 'ast_class_def'
                            },
                            {
                                kind: 'block',
                                type: 'ast_compare'
                            },
                            {
                                kind: 'block',
                                type: 'ast_continue'
                            },
                            {
                                kind: 'block',
                                type: 'ast_dict'
                            },
                            {
                                kind: 'block',
                                type: 'ast_dict_with_item'
                            },
                            {
                                kind: 'block',
                                type: 'dict_option'
                            },
                            {
                                kind: 'block',
                                type: 'ast_expr'
                            },
                            {
                                kind: 'block',
                                type: 'ast_for_stmt'
                            },
                            {
                                kind: 'block',
                                type: 'ast_function_def'
                            },
                            {
                                kind: 'block',
                                type: 'ast_if'
                            },
                            {
                                kind: 'block',
                                type: 'ast_import_content'
                            },
                            {
                                kind: 'block',
                                type: 'ast_import'
                            },
                            {
                                kind: 'block',
                                type: 'ast_import_content'
                            },
                            {
                                kind: 'block',
                                type: 'ast_list'
                            },
                            {
                                kind: 'block',
                                type: 'list_append'
                            },
                            {
                                kind: 'block',
                                type: 'list_extend'
                            },
                            {
                                kind: 'block',
                                type: 'list_clear'
                            },
                            {
                                kind: 'block',
                                type: 'ast_NameConstantBoolean'
                            },
                            {
                                kind: 'block',
                                type: 'ast_NameConstantNone'
                            },
                            {
                                kind: 'block',
                                type: 'ast_nonlocal'
                            },
                            {
                                kind: 'block',
                                type: 'ast_number'
                            },
                            {
                                kind: 'block',
                                type: 'ast_pass'
                            },
                            {
                                kind: 'block',
                                type: 'ast_raw'
                            },
                            {
                                kind: 'block',
                                type: 'ast_return'
                            },
                            {
                                kind: 'block',
                                type: 'ast_return_full'
                            },
                            {
                                kind: 'block',
                                type: 'ast_set'
                            },
                            {
                                kind: 'block',
                                type: 'set_option'
                            },
                            {
                                kind: 'block',
                                type: 'ast_starred'
                            },
                            {
                                kind: 'block',
                                type: 'ast_str'
                            },
                            {
                                kind: 'block',
                                type: 'ast_image'
                            },
                            {
                                kind: 'block',
                                type: 'ast_str_multiline'
                            },
                            {
                                kind: 'block',
                                type: 'ast_str_docstring'
                            },
                            {
                                kind: 'block',
                                type: 'ast_sub_script'
                            },
                            {
                                kind: 'block',
                                type: 'ast_text_join'
                            },
                            {
                                kind: 'block',
                                type: 'ast_try'
                            },
                            {
                                kind: 'block',
                                type: 'ast_tuple'
                            },
                            {
                                kind: 'block',
                                type: 'ast_unary_op_uadd'
                            },
                            {
                                kind: 'block',
                                type: 'ast_unary_op_usub'
                            },
                            {
                                kind: 'block',
                                type: 'ast_unary_op_not'
                            },
                            {
                                kind: 'block',
                                type: 'ast_unary_op_invert'
                            },
                            {
                                kind: 'block',
                                type: 'ast_while'
                            },
                            {
                                kind: 'block',
                                type: 'ast_with'
                            }
                        ]
                    },
                    {
                        kind: 'category',
                        name: '基础 python 函数',
                        contents: [
                            {
                                kind: 'block',
                                type: 'id'
                            },
                            {
                                kind: 'sep',
                                cssConfig: {
                                    container: 'yourClassName'
                                }
                                // gap: '320'
                            },
                            {
                                kind: 'block',
                                type: 'get_id'
                            },
                            {
                                kind: 'block',
                                type: 'get_type'
                            },
                            {
                                kind: 'block',
                                type: 'type'
                            },
                            {
                                kind: 'block',
                                type: 'print_end_with'
                            },
                            {
                                kind: 'block',
                                type: 'print'
                            },
                            {
                                kind: 'block',
                                type: 'raw_input'
                            },
                            {
                                kind: 'block',
                                type: 'int_input'
                            },
                            {
                                kind: 'block',
                                type: 'input_with_info'
                            },
                            {
                                kind: 'block',
                                type: 'int'
                            },
                            {
                                kind: 'block',
                                type: 'str'
                            },
                            {
                                kind:'block',
                                type:'python_range'
                            }
                        ]
                    },
                    {
                        kind: 'category',
                        name: '变量',
                        custom: 'VARIABLE'
                    },
                    {
                        kind: 'category',
                        name: '自定义函数',
                        custom: 'PROCEDURE'
                    },
                ]
            },
            {
                "kind": "category",
                "name": "Pygame",
                "contents":[
                    {
                        kind: 'category',
                        name: '基础',
                        contents: [
                            {
                                kind: 'block',
                                type: 'pygame_init_block'
                            },
                            {
                                kind: 'block',
                                type: 'pygame_quit_block'
                            },
                            {
                                kind: 'block',
                                type: 'pygame_set_title_block'
                            },
                            {
                                kind: 'block',
                                type: 'pygame_setmode_block'
                            },
                            {
                                kind: 'block',
                                type: 'pygame_imageload_block'
                            },
                            {
                                kind: 'block',
                                type: 'pygame_transform_scale_block'
                            },
                            {
                                kind: 'block',
                                type: 'pygame_display_flip_block'
                            },
                            {
                                kind: 'block',
                                type: 'pygame_time_delay_block'
                            },
                            {
                                kind: 'block',
                                type: 'font_init'
                            }
                        ]
                    },
                    {
                        kind: 'category',
                        name: '事件',
                        contents:[
                            {
                                kind: 'block',
                                type: 'pygame_event_get_block'
                            },
                            {
                                kind: 'block',
                                type: 'pygame_key_down_1'
                            },
                            {
                                kind: 'block',
                                type: 'pygame_event_QUIT'
                            }
                        ]
                    },
                    {
                        kind: 'category',
                        name: '添油加醋',
                        contents:[
                            {
                                kind: 'block',
                                type: 'pygame_set_font_block'
                            },
                            {
                                kind: 'block',
                                type: 'font_write'
                            }
                        ]
                    },
                ]
            },
            // {
            //     "kind": "category",
            //     "name": "Random",
            //     "contents":[
            //         {
            //             kind: 'block',
            //             type: 'random_random'
            //         },
            //         {
            //             kind: 'block',
            //             type: 'random_randint'
            //         }
            //     ]
            // }
        ]
    }
}