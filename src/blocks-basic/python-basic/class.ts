import type * as TmpBlockly from 'blockly'
import { type Block, VariableModel, type Blocks, type CodeGenerator } from 'blockly'
import { Order } from 'blockly/python'

const CLASS_COLOR = '#7FB6FF';

export function addClassBlocksV2(
    blocks: typeof Blocks,
    pythonGenerator: CodeGenerator,
    Blockly: typeof TmpBlockly,
    content: any
) {
    function classFlyoutCategory(workspace: any) {
        const nodeList: any[] = [
            {
                "kind": "block",
                "type": "ast_class_def"
            },
        ]
        workspace.getBlocksByType('ast_class_def', false).forEach(
            (block: any) => {
                if (block.propertyNameList) {
                    nodeList.push({
                        "kind": "block",
                        "type": "ast_class_inst_init",
                        "extraState": {
                            "propertyNameList": block.propertyNameList,
                        },
                        "fields": {
                            "className": block.className,
                            ...block.propertyNameList.reduce((acc: any, v: any, idx: any) => {
                                acc['basic_class_' + idx + '_name'] = v
                                return acc
                            }, {})
                        }
                    })
                    nodeList.push({
                        "kind": "block",
                        "type": "ast_class_def_function_def_variable_get",
                        "extraState": {
                            "className": block.className,
                            "functionName": block.functionConfigList[0]?.name
                        },
                        "fields": {
                            "className": block.className,
                            "functionName": block.functionConfigList[0]?.name
                        }
                    })
                    nodeList.push({
                        "kind": "block",
                        "type": "ast_class_def_function_def_variable_set",
                        "extraState": {
                            "className": block.className,
                            "functionName": block.functionConfigList[0]?.name
                        },
                        "fields": {
                            "className": block.className,
                            "functionName": block.functionConfigList[0]?.name
                        }
                    })
                    nodeList.push({
                        "kind": "block",
                        "type": "ast_class_inst_property_get",
                        "fields": {
                            "className": block.className,
                            "propertyName": block.propertyNameList[0]
                        }
                    })
                    nodeList.push({
                        "kind": "block",
                        "type": "ast_class_inst_property_set",
                        "fields": {
                            "className": block.className,
                            "propertyName": block.propertyNameList[0]
                        }
                    })
                    nodeList.push({
                        "kind": "block",
                        "type": "ast_class_inst_function",
                        "extraState": {
                            "parameterList": [],
                        },
                        "fields": {
                            "className": block.className,
                            "functionName": block.functionConfigList[0]?.name
                        }
                    })
                }
            }
        )
        return nodeList
    }
    content.workspace.registerToolboxCategoryCallback('CLASS_PALETTE', classFlyoutCategory)
    Blockly.defineBlocksWithJsonArray([
        {
            type: 'ast_class_def_basic_class',
            message0: '继承名为 %1 的类',
            args0: [
                { type: 'field_input', name: 'name' },
            ],
            inputsInline: null,
            previousStatement: "CLASS_DEF_BASIC_CLASS",
            nextStatement: "CLASS_DEF_BASIC_CLASS",
            colour: CLASS_COLOR,
            enableContextMenu: false
        },
        {
            type: 'ast_class_def_property',
            message0: '声明一个叫 %1 的属性',
            args0: [
                { type: 'field_input', name: 'name' },
            ],
            inputsInline: null,
            previousStatement: "CLASS_DEF_PROPERTY",
            nextStatement: "CLASS_DEF_PROPERTY",
            colour: CLASS_COLOR,
            enableContextMenu: false
        },
        {
            type: 'ast_class_def_function',
            message0: '声明一个叫 %1 的方法 \n 参数 %2',
            args0: [
                { type: 'field_input', name: 'name' },
                { type: 'input_statement', name: 'parameter_stack', check: 'CLASS_DEF_FUNCTION_PARAMETER' },
            ],
            inputsInline: null,
            previousStatement: "CLASS_DEF_FUNCTION",
            nextStatement: "CLASS_DEF_FUNCTION",
            colour: CLASS_COLOR,
            enableContextMenu: false
        },
        {
            type: 'ast_class_def_function_parameter',
            message0: '该方法声明一个叫 %1 的参数',
            args0: [{ type: 'field_input', name: 'name' }],
            inputsInline: null,
            previousStatement: "CLASS_DEF_FUNCTION_PARAMETER",
            nextStatement: "CLASS_DEF_FUNCTION_PARAMETER",
            colour: CLASS_COLOR,
            enableContextMenu: false
        },
        {
            type: 'ast_class_def_container',
            inputsInline: null,
            message0: '类名 %1 \n 基类 %2 属性 %3 方法 %4',
            args0: [
                { type: 'field_input', name: 'class_name' },
                { type: 'input_statement', name: 'base_class_stack', check:'CLASS_DEF_BASIC_CLASS' },
                { type: 'input_statement', name: 'property_stack' , check: 'CLASS_DEF_PROPERTY'},
                { type: 'input_statement', name: 'function_stack' , check: 'CLASS_DEF_FUNCTION'},
            ],
            previousStatement: true,
            nextStatement: true,
            colour: CLASS_COLOR,
            enableContextMenu: false
        },
        {
            type: 'ast_class_inst_init_container',
            inputsInline: null,
            message0: '初始化变量%1',
            args0: [
                { type: 'input_statement', name: 'property_stack' , check: 'CLASS_DEF_PROPERTY'},
            ],
            previousStatement: true,
            nextStatement: true,
            colour: CLASS_COLOR,
            enableContextMenu: false
        },
        {
            type: 'ast_class_inst_function_container',
            inputsInline: null,
            message0: '调用该实例中方法 \n 需要的参数 %1 \n 需要返回值 %2',
            args0: [
                { type: 'input_statement', name: 'parameter_stack', check: 'CLASS_DEF_FUNCTION_PARAMETER' },
                { type: 'field_checkbox', name: 'return_flag' },
            ],
            previousStatement: true,
            nextStatement: true,
            colour: CLASS_COLOR,
            enableContextMenu: false
        }
    ])
    const AST_CLASS_DEF_MUTATOR_MIXIN = {
        className: '',
        basicClassNameList: ["A", "B"],
        propertyNameList: ["a", "b"],
        functionConfigList: [{name: "fun", parameter: ["pa", "pb"]}],
        getRandomVariableName() {
            return "a_" + Math.random().toString(36).slice(-6)
        },
        decompose: function (this: any, workspace: any) {
            let containerBlock = workspace.newBlock('ast_class_def_container');
            containerBlock.initSvg();
            // 处理类名
            containerBlock.getField("class_name")?.setValue(this.className);
            // 处理基类和实例属性
            [
                ['ast_class_def_basic_class', containerBlock.getInput('base_class_stack'), this.basicClassNameList],
                ['ast_class_def_property', containerBlock.getInput('property_stack'), this.propertyNameList]
            ].forEach(([stackType, stackBlock, stackNameList]) => {
                let connection = stackBlock?.connection;
                for (let name of stackNameList) {
                    let itemBlock = workspace.newBlock(stackType);
                    itemBlock.getField("name")?.setValue(name)
                    itemBlock.initSvg();
                    connection.connect(itemBlock.previousConnection);
                    connection = itemBlock.nextConnection;
                }
            });
            {
                let connection = containerBlock.getInput('function_stack')?.connection;
                for (let funcConfig of this.functionConfigList) {
                    let funcBlock = workspace.newBlock('ast_class_def_function');
                    funcBlock.initSvg();
                    connection.connect(funcBlock.previousConnection);
                    connection = funcBlock.nextConnection;

                    funcBlock.getField("name")?.setValue(funcConfig["name"]);
                    let funcConnection = funcBlock.getInput('parameter_stack')?.connection;
                    for (let funcParam of funcConfig["parameter"]) {
                        let paramBlock = workspace.newBlock('ast_class_def_function_parameter');
                        paramBlock.initSvg();
                        paramBlock.getField("name")?.setValue(funcParam);
                        funcConnection.connect(paramBlock.previousConnection);
                        funcConnection = paramBlock.nextConnection;
                    }
                }
            }
            return containerBlock
        },
        compose: function (this: any, containerBlock: TmpBlockly.BlockSvg) {
            // 处理类名
            this.className = containerBlock.getFieldValue("class_name");
            // 处理基类
            let newBasicClassList: string[] = [];
            {
                let block = containerBlock.getInputTargetBlock('base_class_stack')
                while (block && !block.isInsertionMarker()) {
                    newBasicClassList.push(block.getFieldValue("name"));
                    block = block.nextConnection && block.nextConnection.targetBlock();
                }
            }
            // 处理实例属性
            let newPropertyNameList: string[] = [];
            {
                let block = containerBlock.getInputTargetBlock('property_stack')
                while (block && !block.isInsertionMarker()) {
                    newPropertyNameList.push(block.getFieldValue("name") || this.getRandomVariableName());
                    block = block.nextConnection && block.nextConnection.targetBlock();
                }
            }
            // 处理实例函数
            let [newFunctionConfigList, functionConnections]: [any[], TmpBlockly.Connection[]] = [[], []];
            {
                let funcBlock: any = containerBlock.getInputTargetBlock('function_stack');
                while (funcBlock && !funcBlock.isInsertionMarker()) {
                    let paramList = []
                    {
                        let paramBlock = funcBlock.getInputTargetBlock('parameter_stack')
                        while (paramBlock && !paramBlock.isInsertionMarker()) {
                            paramList.push(paramBlock.getFieldValue("name") || this.getRandomVariableName());
                            paramBlock = paramBlock.nextConnection && paramBlock.nextConnection.targetBlock();
                        }
                    }
                    newFunctionConfigList.push({
                        name: funcBlock.getFieldValue("name") || this.getRandomVariableName(),
                        parameter: paramList
                    })
                    functionConnections.push(funcBlock.valueConnection_)
                    funcBlock = funcBlock.nextConnection && funcBlock.nextConnection.targetBlock();
                }
            }
            this.basicClassNameList = newBasicClassList;
            this.propertyNameList = newPropertyNameList;
            this.functionConfigList = newFunctionConfigList;
            this.updateShape_();
            for(let i in functionConnections) {
                functionConnections[i]?.reconnect(this, `function_${i}_statement`)
            }
        },
        saveConnections: function (this: any, containerBlock: any) {
            let itemBlock = containerBlock.getInputTargetBlock('function_stack')
            let i = 0
            while (itemBlock) {
                let input = this.getInput(`function_${i}_statement`)
                itemBlock.valueConnection_ = input && input.connection.targetConnection
                i++
                itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock()
            }
        },
        updateShapeInput_: function (
            this: any, inputType: string, inputNameList: string[],
            input_add_handle: any, input_del_handle: any
        ) {
            let i = 0;
            while (i < inputNameList.length) {
                const inputName = inputType + i;
                const inputValue = inputNameList[i];
                input_add_handle(inputName, inputValue);
                i++;
            }
            while (this.getInput(inputType + i)) {
                input_del_handle(inputType + i)
                i++;
            }
        },
        updateShape_: function (this: any) {
            // 处理类名
            if (!this.getInput('className')) {
                let fieldVariable = new Blockly.FieldVariable(this.className, undefined, ['global@class'], 'global@class')
                fieldVariable.setEnabled(false)
                this.appendDummyInput('className')
                    .appendField('定义一个名为')
                    .appendField(fieldVariable, 'className_name')
                    .appendField('的类')
            } else {
                const variable = this.getField('className_name').getVariable();
                if (variable) {
                    this.workspace.renameVariableById(variable.getId(), this.className);
                }
            }
            this.moveInputBefore('className', 'body');
            // 处理基类
            this.updateShapeInput_(
                'basic_class_',
                this.basicClassNameList,
                (inputName: string, inputValue: string) => {
                    if (!this.getInput(inputName)) {
                        let fieldTextInput = new Blockly.FieldTextInput(inputValue)
                        fieldTextInput.setEnabled(false)
                        this.appendDummyInput(inputName)
                            .appendField('继承一个叫')
                            .appendField(fieldTextInput, inputName + "_name")
                            .appendField('的父类')
                            .setAlign(Blockly.inputs.Align.LEFT)
                    } else {
                        this.getField(inputName + "_name").setValue(inputValue)
                    }
                    this.moveInputBefore(inputName, 'body');
                },
                (inputName: string) => {
                    this.removeInput(inputName)
                }
            );
            function varDeleteFnFactory(varType: string, varNameList: string[], workspace: TmpBlockly.WorkspaceSvg) {
                workspace.getVariablesOfType(varType)
                    .filter(
                        (v: VariableModel) => !varNameList.includes(v.name)
                    ).forEach(
                        (v: VariableModel) => workspace.deleteVariableById(v.getId())
                    );
            }
            // 处理实例属性
            this.updateShapeInput_(
                'property_',
                [],
                () => { },
                (inputName: string) => this.removeInput(inputName)
            )
            this.updateShapeInput_(
                'property_',
                this.propertyNameList,
                (inputName: string, inputValue: string) => {
                    let fieldVariable = new Blockly.FieldVariable(inputValue, undefined, [`global#${this.className}@property`], `global#${this.className}@property`)
                    fieldVariable.setEnabled(false)
                    this.appendDummyInput(inputName)
                        .appendField('声明一个叫')
                        .appendField(fieldVariable, inputName + "_name")
                        .appendField('的属性')
                        .setAlign(Blockly.inputs.Align.LEFT)
                    this.moveInputBefore(inputName, 'body');
                },
                () => { }
            );
            varDeleteFnFactory(`global#${this.className}@property`, this.propertyNameList, this.workspace)
            // 处理实例方法
            const functionConfigDict = this.functionConfigList.reduce((acc: {[key: string] : string[] }, item: any) => {
                acc[item.name] = item.parameter;
                return acc
            }, {} as {[key: string] : string[] } );

            this.updateShapeInput_(
                'function_',
                [],
                () => {},
                (inputName: string) => {
                    // 函数名
                    this.removeInput(inputName);
                    // 函数参数
                    this.updateShapeInput_(
                        inputName + '_parameter_',
                        [],
                        () => {},
                        (inputName: string) => this.removeInput(inputName)
                    );
                    // 函数体
                    this.removeInput(inputName + '_statement')
                }
            )
            this.updateShapeInput_(
                'function_',
                this.functionConfigList,
                (inputName: string, inputValue: any) => {
                    const funcName = inputValue['name'];
                    // 函数名
                    let fieldVariable = new Blockly.FieldVariable(funcName, undefined, [`global#${this.className}@function`], `global#${this.className}@function`)
                    fieldVariable.setEnabled(false)
                    this.appendDummyInput(inputName)
                        .appendField('声明一个叫')
                        .appendField(fieldVariable, inputName +"_name")
                        .appendField("的方法")
                    this.moveInputBefore(inputName, 'body');
                    // 函数参数
                    this.updateShapeInput_(
                        inputName + '_parameter_',
                        inputValue['parameter'],
                        (inputName: string, inputValue: string) => {
                            let fieldVariable = new Blockly.FieldVariable(inputValue, undefined, [`global#${this.className}#${funcName}@parameter`], `global#${this.className}#${funcName}@parameter`)
                            fieldVariable.setEnabled(false)
                            this.appendDummyInput(inputName)
                                .appendField('参数名')
                                .appendField(fieldVariable, inputName +"_name")
                                .setAlign(Blockly.inputs.Align.RIGHT)
                            this.moveInputBefore(inputName, 'body');
                        },
                        () => { }
                    );
                    // 函数体
                    this.appendStatementInput(inputName + '_statement')
                    this.moveInputBefore(inputName+ '_statement', 'body');
                },
                () => { }
            );
            this.workspace.getVariablesOfType(
                `global#${this.className}@function`
            ).forEach(
                (v: VariableModel) => {
                    if ( v.name in functionConfigDict ) {
                        // 清理该方法声明失效的参数
                        varDeleteFnFactory(
                            `global#${this.className}#${v.name}@parameter`,
                            functionConfigDict[v.name],
                            this.workspace
                        )
                    } else {
                        // 清理该方法声明的全部参数
                        varDeleteFnFactory(
                            `global#${this.className}#${v.name}@parameter`,
                            [],
                            this.workspace
                        )
                        // 清理该方法
                        this.workspace.deleteVariableById(v.getId())
                    }
                }
            );
        },
        saveExtraState: function (this: any) {
            return {
                "className": this.className,
                "basicClassNameList": this.basicClassNameList,
                "propertyNameList": this.propertyNameList,
                "functionConfigList": this.functionConfigList
            };
        },
        loadExtraState: function (this: any, state: any) {
            this.className = state['className'];
            this.basicClassNameList = state['basicClassNameList'];
            this.propertyNameList = state['propertyNameList'];
            this.functionConfigList = state['functionConfigList'];
            this.updateShape_();
        },
    }
    try {
        Blockly.Extensions.registerMutator(
            'ast_class_def_mutator',
            AST_CLASS_DEF_MUTATOR_MIXIN,
            null as unknown as undefined, // TODO
            ['ast_class_def_basic_class', 'ast_class_def_property', 'ast_class_def_function', 'ast_class_def_function_parameter'],
        );
    } catch (e) {
        console.error(e)
    }

    blocks['ast_class_def'] = {
        init: function () {
            this.jsonInit({
                message0: '%1',
                args0: [{
                    type: 'input_dummy', name: 'body'
                }],
                "inputsInline": true,
                "colour": 330,
                'mutator': 'ast_class_def_mutator',
            })
            this.className = 'CLASS_' + this.getRandomVariableName()
            this.setColour(CLASS_COLOR)
            this.setInputsInline(false)
            this.updateShape_()
        }
    }
    pythonGenerator.forBlock['ast_class_def'] = function (block: any) {
        // 装饰器
        // let decoratorList = new Array(block.decoratorCount);
        // for (let i = 0; i < decoratorList.length; i++) {
        //   let decorator =
        //     pythonGenerator.valueToCode(block, 'DECORATOR' + i, Order.NONE) ||
        //     pythonGenerator.NONE
        //   decoratorList[i] = '@' + decorator + '\n'
        // }
        // 类名
        let className = block.getField("className_name")?.getText();
        // 基类
        let basicClassNameList = new Array(block.basicClassNameList.length)
        for (let i = 0; i < basicClassNameList.length; i++) {
            basicClassNameList[i] = block.getFieldValue(`basic_class_${i}_name`)
        }
        // 实例属性
        let propertyName = new Array(block.propertyNameList.length)
        let propertyList = new Array(block.propertyNameList.length)
        for (let i = 0; i < propertyList.length; i++) {
            let name = block.getField(`property_${i}_name`).getText()
            // let property = pythonGenerator.valueToCode(block, `property_${i}`, Order.NONE) || name
            propertyName[i] = name
            propertyList[i] = "self." + name + " = " + name
        }
        propertyName.unshift('self')

        let def_init = 'def __init__(' + propertyName.join(', ') + '):' + '\n' + pythonGenerator.prefixLines(propertyList.join("\n"), "    ") + "\n"
        // 方法
        let functionList = new Array(block.functionConfigList.length)
        for (let i = 0; i < functionList.length; i++) {
            const func = block.functionConfigList[i];
            const funcName = func['name'];
            const funcParam = ['self', ...func['parameter']].join(', ');
            const funcStatement = pythonGenerator.statementToCode(block, `function_${i}_statement`) || pythonGenerator.prefixLines('pass', pythonGenerator.INDENT);
            functionList[i] = `def ${funcName}(${funcParam}): \n${funcStatement}`
        }
        functionList.unshift(def_init)
        return (
          `class ${className}(${basicClassNameList.join(',')}):\n` +
          pythonGenerator.prefixLines(functionList.join('\n'), '    ')
        )
    }

    function ast_class_def_function_def_variable_init(block: any) {
        block.getField('className')?.setEnabled(false);
        block.getInput('function')?.appendField(new Blockly.FieldDropdown(()=> {
                const className = block.className;
                const options: [string, string][] = [];
                if (!block.isDeadOrDying()) {
                    let variableModelList: VariableModel[] = block.workspace.getVariablesOfType(`global#${className}@function`)
                    variableModelList.sort(VariableModel.compareByName);
                    for (let i = 0; i < variableModelList.length; i++) {
                        options[i] = [variableModelList[i].name, variableModelList[i].name];
                    }
                }
                if (options.length) {
                    return options
                }
                return [["无方法", "无方法"]]
            }, (newValue: string) => {
                block.functionName = newValue
                block.updateShape_()
                return newValue
            }), 'functionName');
    }
    blocks['ast_class_def_function_def_variable_get'] = {
        className: '', functionName: '',
        init: function () {
            this.jsonInit({
                "message0": "类 %1 中方法 %2 可以使用的变量 %3",
                "args0": [
                    {
                        "type": "field_input",
                        "name": "className",
                        "align": "RIGHT",
                    },
                    {
                        "type": "input_dummy",
                        "name": "function",
                    },
                    {
                        "type": "input_dummy",
                        "name": "functionVar",
                    },
                ],
                "inputsInline": true,
                "output": null,
                "colour": CLASS_COLOR,
            })
            ast_class_def_function_def_variable_init(this);
        },
        saveExtraState: function () {
            return {
                className: this.className,
                functionName: this.functionName
            }
        },
        loadExtraState: function (state: any) {
            this.className = state['className']
            this.functionName = state['functionName']
            this.updateShape_()
        },
        updateShape_: function () {
            const className = this.className
            const functionName = this.functionName
            let functionVar = this.getInput("functionVar")
            functionVar.removeField('functionVarName', true);
            functionVar.appendField(new Blockly.FieldVariable(
                "局部变量",
                undefined,
                [`global#${className}@property`, `global#${className}#${functionName}@parameter`, `global#${className}#${functionName}@local`],
                `global#${className}#${functionName}@local`
            ), 'functionVarName')
        }
    }
    pythonGenerator.forBlock['ast_class_def_function_def_variable_get'] = function (block: any) {
        let variable = block.getField("functionVarName")?.getVariable();
        if (variable && variable.type === `global#${block.className}@property`) {
            return [`self.${variable.name}`, Order.ATOMIC]
        }
        return [variable.name, Order.ATOMIC]
    };

    blocks['ast_class_def_function_def_variable_set'] = {
        className: '', functionName: '',
        init: function () {
            this.jsonInit({
                "message0": "类 %1 中方法 %2 将 %3 赋值给变量 %4",
                "args0": [
                    {
                        "type": "field_input",
                        "name": "className",
                        "align": "RIGHT",
                    },
                    {
                        "type": "input_dummy",
                        "name": "function",
                    },
                    {
                        "type": "input_value",
                        "name": "functionVarValue",
                    },
                    {
                        "type": "input_dummy",
                        "name": "functionVar",
                    },
                ],
                "inputsInline": true,
                "previousStatement": null,
                "nextStatement": null,
                "colour": CLASS_COLOR,
            })
            ast_class_def_function_def_variable_init(this);
        },
        saveExtraState: function () {
            return {
                className: this.className,
                functionName: this.functionName
            }
        },
        loadExtraState: function (state: any) {
            this.className = state['className']
            this.functionName = state['functionName']
            this.updateShape_()
        },
        updateShape_: function () {
            const className = this.className
            const functionName = this.functionName
            let functionVar = this.getInput("functionVar")
            functionVar.removeField('functionVarName', true);
            functionVar.appendField(new Blockly.FieldVariable(
                "局部变量",
                undefined,
                [`global#${className}@property`, `global#${className}#${functionName}@parameter`, `global#${className}#${functionName}@local`],
                `global#${className}#${functionName}@local`
            ), 'functionVarName')
        }
    }
    pythonGenerator.forBlock['ast_class_def_function_def_variable_set'] = function (block: any) {
        let variable = block.getField("functionVarName")?.getVariable();
        let variableValue = pythonGenerator.valueToCode(block, 'functionVarValue', Order.NONE) || 'None';

        if (variable && variable.type === `global#${block.className}@property`) {
            return `self.${variable.name} = ${variableValue}`
        }
        return `${variable.name} = ${variableValue}`
    };

    blocks['ast_class_inst_init'] = {
        propertyNameList: [],
        init: function () {
            this.jsonInit({
                "message0": "实例化 \n 由 %1 生成的对象： %2 %3 \n 对该对象进行初始化\n  %4",
                "args0": [
                    {
                        "type": "field_input",
                        "name": "className",
                        "align": "RIGHT",
                    },
                    {
                        "type": "input_dummy"
                    },
                    {
                        "type": "field_variable",
                        "name": "varName",
                        "variable": "A",
                        "variableTypes": ["global"],
                        "defaultType": "global"
                    },
                    {
                        "type": "input_dummy",
                        "name": "body",
                    },
                ],
                "inputsInline": false,
                "previousStatement": null,
                "nextStatement": null,
                "colour": CLASS_COLOR,
                extensions: ['basic_introduction_extension']
            })
            this.setMutator(new Blockly.icons.MutatorIcon(['ast_class_def_property'], this))
            this.getField("className").setEnabled(false);
            this.updateShape_()
        },
        saveExtraState: function () {
            return { propertyNameList: this.propertyNameList }
        },
        loadExtraState: function (state: any) {
            this.propertyNameList = state['propertyNameList']
            this.updateShape_()
        },
        decompose: function (workspace: any) {
            let containerBlock = workspace.newBlock('ast_class_inst_init_container')
            containerBlock.initSvg()
            let connection = containerBlock.getInput('property_stack').connection;
            for (let name of this.propertyNameList) {
                let itemBlock = workspace.newBlock("ast_class_def_property");
                itemBlock.getField("name")?.setValue(name)
                itemBlock.initSvg();
                connection.connect(itemBlock.previousConnection);
                connection = itemBlock.nextConnection;
            }
            return containerBlock
        },
        compose: function (containerBlock: any) {
            let block = containerBlock.getInputTargetBlock("property_stack")
            let [oldItemNameList, newItemNameList, itemConnections]: [string[], string[], TmpBlockly.Connection[]] = [this.propertyNameList, [], []];
            while (block && !block.isInsertionMarker()) {
                itemConnections.push(block.valueConnection_);
                newItemNameList.push(block.getFieldValue("name"));
                block = block.nextConnection && block.nextConnection.targetBlock();
            }
            oldItemNameList.forEach((name: string, idx: number) => {
                let connection = this.getInput("property_" + idx)?.connection.targetConnection
                if (connection && itemConnections.indexOf(connection) === -1) {
                    connection.disconnect()
                }
            })
            this.propertyNameList = newItemNameList;
            this.updateShape_()
            for (let i = 0; i < this.propertyNameList.length; i++) {
                if (itemConnections[i]) {
                    itemConnections[i].reconnect(this, 'property_' + i)
                }
            }
        },
        saveConnections: function (containerBlock: any) {
            let itemBlock = containerBlock.getInputTargetBlock('property_stack')
            let i = 0
            while (itemBlock) {
                let input = this.getInput('property_' + i)
                itemBlock.valueConnection_ = input && input.connection.targetConnection
                i++
                itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock()
            }
        },
        updateShape_: function () {
            const inputType = "property_";
            const inputNameList = this.propertyNameList;
            let i = 0;
            while (i < inputNameList.length) {
                const inputName = inputType + i;
                const inputValue = inputNameList[i];
                if (!this.getInput(inputName)) {
                    let fieldTextInput = new Blockly.FieldTextInput(inputValue)
                    fieldTextInput.setEnabled(false)
                    this.appendValueInput(inputName)
                        .appendField('声明一个叫')
                        .appendField(fieldTextInput, inputName +"_name")
                        .appendField("的属性")
                } else {
                    this.getField(inputName + "_name").setValue(inputValue)
                }
                this.moveInputBefore(inputName, 'body');
                i++;
            }
            while (this.getInput(inputType + i)) {
                this.removeInput(inputType + i)
                i++;
            }
        }
    }
    pythonGenerator.forBlock['ast_class_inst_init'] = function (block: any) {
        let value_object = block.getField('varName').getText();
        let value_class = block.getFieldValue("className");
        // 属性
        let propertyList = new Array(block.propertyNameList.length)
        for (let i = 0; i < propertyList.length; i++) {
            let name = block.getFieldValue(`property_${i}_name`)
            let property = pythonGenerator.valueToCode(block, 'property_' + i, Order.NONE) || 'None'
            propertyList[i] = name + " = " + property
        }
        return `${value_object} = ${value_class}(${propertyList.join(', ')})\n`
    }

    function ast_class_inst_property_init(block: typeof Blocks) {
        block.getField("className").setEnabled(false);
        block.getInput('property')
            .appendField(new Blockly.FieldDropdown(()=> {
                const className = block.getFieldValue("className")
                const options: [string, string][] = [];
                if (!block.isDeadOrDying()) {
                    let variableModelList: VariableModel[] = block.workspace.getVariablesOfType(`global#${className}@property`)
                    variableModelList.sort(VariableModel.compareByName);
                    for (let i = 0; i < variableModelList.length; i++) {
                        options[i] = [variableModelList[i].name, variableModelList[i].name];
                    }
                }
                if (options.length) {
                    return options
                }
                return [["无属性", "无属性"]]
            }), 'propertyName');

    }
    blocks['ast_class_inst_property_get'] = {
        init: function () {
            this.jsonInit({
                "message0": "由 %1 %2 生成的对象： %3 %4 调用该对象上的属性： %5",
                "args0": [
                    {
                        "type": "input_dummy"
                    },
                    {
                        "type": "field_input",
                        "name": "className",
                        "align": "RIGHT",
                    },
                    {
                        "type": "input_dummy"
                    },
                    {
                        "type": "field_variable",
                        "name": "varName",
                        "variable": "A",
                        "variableTypes": ["global"],
                        "defaultType": "global"
                    },
                    {
                        "type": "input_dummy",
                        "name": "property",
                    },
                ],
                "inputsInline": true,
                "output": null,
                "colour": CLASS_COLOR,
            });
            ast_class_inst_property_init(this);
        },
    }
    pythonGenerator.forBlock['ast_class_inst_property_get'] = function (block: any) {
        let varName = block.getField("varName")?.getText();
        let propertyName = block.getFieldValue("propertyName");
        return [varName + '.' + propertyName, Order.ATOMIC]
    };

    blocks['ast_class_inst_property_set'] = {
        init: function () {
            this.jsonInit({
                "message0": "由 %1 %2 生成的对象： %3 %4 将 %5 赋值给对象上的属性：%6",
                "args0": [
                    {
                        "type": "input_dummy"
                    },
                    {
                        "type": "field_input",
                        "name": "className",
                        "align": "RIGHT",
                    },
                    {
                        "type": "input_dummy"
                    },
                    {
                        "type": "field_variable",
                        "name": "varName",
                        "variable": "A",
                        "variableTypes": ["global"],
                        "defaultType": "global"
                    },
                    {
                        "type": "input_value",
                        "name": "propertyValue",
                    },
                    {
                        "type": "input_dummy",
                        "name": "property",
                    },
                ],
                "inputsInline": true,
                "previousStatement": null,
                "nextStatement": null,
                "colour": CLASS_COLOR,
            })
            ast_class_inst_property_init(this);
        }
    }
    pythonGenerator.forBlock['ast_class_inst_property_set'] = function (block: any) {
        let varName = block.getField("varName")?.getText();
        let propertyName = block.getFieldValue("propertyName");
        let propertyValue = pythonGenerator.valueToCode(block, 'propertyValue', Order.NONE);
        return varName + '.' + propertyName + '=' + propertyValue
    };

    blocks['ast_class_inst_function'] = {
        parameterList: [],
        returnFlag: 'FALSE',
        init: function () {
            this.jsonInit({
                "message0": "由 %1 生成的对象： %2 %3 \n 调用该对象上的方法： %4 %5\n",
                "args0": [
                    {
                        "type": "field_input",
                        "name": "className",
                        "align": "RIGHT",
                    },
                    {
                        "type": "input_dummy"
                    },
                    {
                        "type": "field_variable",
                        "name": "varName",
                        "variable": "A",
                        "variableTypes": ["global"],
                        "defaultType": "global"
                    },
                    {
                        "type": "input_dummy",
                        "name": "function",
                    },
                    {
                        "type": "input_dummy",
                        "name": "body",
                    },
                ],
                "inputsInline": false,
                "previousStatement": null,
                "nextStatement": null,
                "colour": CLASS_COLOR,
            })
            this.setMutator(new Blockly.icons.MutatorIcon(['ast_class_def_function_parameter'], this))
            this.getField("className").setEnabled(false);
            this.getInput('function')
                .appendField(new Blockly.FieldDropdown(()=> {
                    const className = this.getFieldValue("className")
                    const options: [string, string][] = [];
                    if (!this.isDeadOrDying()) {
                        let variableModelList: VariableModel[] = this.workspace.getVariablesOfType(`global#${className}@function`)
                        variableModelList.sort(VariableModel.compareByName);
                        for (let i = 0; i < variableModelList.length; i++) {
                            options[i] = [variableModelList[i].name, variableModelList[i].name];
                        }
                    }
                    if (options.length) {
                        return options
                    }
                    return [["无方法", "无方法"]]
                }, (newValue) => {
                    const className = this.getFieldValue("className");
                    let variableModelList: VariableModel[] = this.workspace.getVariablesOfType(`global#${className}#${newValue}@parameter`);
                    this.parameterList = [];
                    for (let i = 0; i < variableModelList.length; i++) {
                        this.parameterList.push(variableModelList[i].name);
                    }
                    this.updateShape_();
                    return newValue
                }
                ), 'functionName');
            this.updateShape_();
        },
        decompose: function (workspace: any) {
            let containerBlock = workspace.newBlock('ast_class_inst_function_container')
            containerBlock.initSvg()
            let connection = containerBlock.getInput('parameter_stack').connection;
            for (let name of this.parameterList) {
                let itemBlock = workspace.newBlock("ast_class_def_function_parameter");
                itemBlock.getField("name")?.setValue(name)
                itemBlock.initSvg();
                connection.connect(itemBlock.previousConnection);
                connection = itemBlock.nextConnection;
            }
            containerBlock.getField('return_flag').setValue(this.returnFlag)
            return containerBlock
        },
        compose: function (containerBlock: any) {
            let block = containerBlock.getInputTargetBlock('parameter_stack');
            let [oldItemNameList, newItemNameList, itemConnections]: [string[], string[], TmpBlockly.Connection[]] = [this.parameterList, [], []];
            while (block && !block.isInsertionMarker()) {
                itemConnections.push(block.valueConnection_)
                newItemNameList.push(block.getFieldValue("name"));
                block = block.nextConnection && block.nextConnection.targetBlock()
            }
            oldItemNameList.forEach((name: string, idx: number) => {
                let connection = this.getInput("PARAM_" + idx)?.connection.targetConnection
                if (connection && itemConnections.indexOf(connection) === -1) {
                    connection.disconnect()
                }
            })
            this.parameterList = newItemNameList
            this.returnFlag = containerBlock.getFieldValue('return_flag')
            this.updateShape_()
            for (let i = 0; i < newItemNameList.length; i++) {
                if (itemConnections[i]) {
                    itemConnections[i].reconnect(this, 'PARAM_' + i)
                }
            }
        },
        saveConnections: function (containerBlock: any) {
            let itemBlock = containerBlock.getInputTargetBlock('parameter_stack')
            let i = 0
            while (itemBlock) {
                let input = this.getInput('PARAM_' + i)
                itemBlock.valueConnection_ = input && input.connection.targetConnection
                i++
                itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock()
            }
        },
        updateShape_: function () {
            let i = 0;
            while (i < this.parameterList.length) {
                let inputName = 'PARAM_' + i;
                let inputValue = this.parameterList[i]
                if (!this.getInput(inputName)) {
                    this.appendValueInput(inputName)
                        .appendField(inputValue, inputName + '_name')
                        .setAlign(Blockly.inputs.Align.RIGHT)
                } else {
                    this.getField(inputName + '_name').setValue(inputValue)
                }
                this.moveInputBefore(inputName, 'body');
                i++;
            }
            while (this.getInput('PARAM_' + i)) {
                this.removeInput('PARAM_' + i)
                i++
            }
            if (this.returnFlag === 'TRUE') {
                this.setPreviousStatement(false);
                this.setNextStatement(false);
                this.setOutput(true);
            } else {
                this.setPreviousStatement(true);
                this.setNextStatement(true);
                this.setOutput(false);
            }
        },
        saveExtraState: function () {
            return {
                returnFlag: this.returnFlag,
                parameterList: this.parameterList
            }
        },
        loadExtraState: function (state: any) {
            this.returnFlag = state['returnFlag']
            this.parameterList = state['parameterList']
            this.updateShape_()
        },
    }
    pythonGenerator.forBlock['ast_class_inst_function'] = function (block: any) {
        let varName = block.getField('varName').getText();
        let funcName = block.getFieldValue("functionName");
        let parameterList = [];
        for (let i = 0; i < block.parameterList.length; i++) {
            const paramName = block.parameterList[i];
            const paramValue = pythonGenerator.valueToCode(block, `PARAM_${i}`, Order.NONE) || 'None';
            if (paramName) {
                parameterList.push(`${paramName} = ${paramValue}`)
            } else {
                parameterList.push(paramValue)
            }
        }
        if (block.returnFlag === 'TRUE') {
            return [`${varName}.${funcName}(${parameterList.join(',')})`, Order.NONE]
        }
        return `${varName}.${funcName}(${parameterList.join(',')})\n`
    };
}