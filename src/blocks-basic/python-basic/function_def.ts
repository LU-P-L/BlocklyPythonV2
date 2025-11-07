/**
 * AST function 依据: https://docs.python.org/3/reference/grammar.html#:~:text=from%27%20expression%20%5D%20%0A%20%20%20%20%7C%20%27raise%27-,function_def,-%3A%0A%20%20%20%20%7C%20decorators%20function_def_raw%20%0A%20%20%20%20%7C%20function_def_raw
 * 参数顺序必须为：必选参数、默认参数、可变参数、命名关键字参数和关键字参数
 * @author ChrisJaunes
 */
export function addFunctionDefBlocks(Blockly: any, pythonGenerator: any, workspaceSvg: any) {
  Blockly.defineBlocksWithJsonArray([
    {
      type: 'ast_function_mutant_with_container',
      message0: '设置函数参数: %1 %2 设置返回值 %3',
      args0: [
        { type: 'input_dummy' },
        { type: 'input_statement', name: 'STACK', align: 'RIGHT' },
        { type: 'field_checkbox', name: 'RETURNS', checked: true, align: 'RIGHT' }
      ],
      enableContextMenu: false,
      colour: '#7FB6FF'
    }
  ])

  let mutantTypeList: any[] = []

  ;[
    [
      'parameter',
      '必选参数',
      '',
      false,
      false,
      ['parameter', 'parameter_type'],
      [
        'parameter',
        'parameter_type',
        'parameter_default',
        'parameter_default_type',
        'parameter_vararg',
        'parameter_vararg_type',
        'parameter_name_kwarg',
        'parameter_name_kwarg_type',
        'parameter_kwarg',
        'parameter_kwarg_type'
      ]
    ],
    [
      'parameter_type',
      '必选参数(有类型提示)',
      '',
      true,
      false,
      ['parameter', 'parameter_type'],
      [
        'parameter',
        'parameter_type',
        'parameter_default',
        'parameter_default_type',
        'parameter_vararg',
        'parameter_vararg_type',
        'parameter_name_kwarg',
        'parameter_name_kwarg_type',
        'parameter_kwarg',
        'parameter_kwarg_type'
      ]
    ],
    [
      'parameter_default',
      '默认参数',
      '',
      false,
      true,
      ['parameter', 'parameter_type', 'parameter_default', 'parameter_default_type'],
      [
        'parameter_default',
        'parameter_default_type',
        'parameter_vararg',
        'parameter_vararg_type',
        'parameter_name_kwarg',
        'parameter_name_kwarg_type',
        'parameter_kwarg',
        'parameter_kwarg_type'
      ]
    ],
    [
      'parameter_default_type',
      '默认参数(有类型提示)',
      '',
      true,
      true,
      ['parameter', 'parameter_type', 'parameter_default', 'parameter_default_type'],
      [
        'parameter_default',
        'parameter_default_type',
        'parameter_vararg',
        'parameter_vararg_type',
        'parameter_name_kwarg',
        'parameter_name_kwarg_type',
        'parameter_kwarg',
        'parameter_kwarg_type'
      ]
    ],
    [
      'parameter_vararg',
      '可变参数',
      '*',
      false,
      false,
      ['parameter', 'parameter_type', 'parameter_default', 'parameter_default_type'],
      [
        'parameter_name_kwarg',
        'parameter_name_kwarg_type',
        'parameter_kwarg',
        'parameter_kwarg_type'
      ]
    ],
    [
      'parameter_vararg_type',
      '可变参数(有类型提示)',
      '*',
      true,
      false,
      ['parameter', 'parameter_type', 'parameter_default', 'parameter_default_type'],
      [
        'parameter_name_kwarg',
        'parameter_name_kwarg_type',
        'parameter_kwarg',
        'parameter_kwarg_type'
      ]
    ],
    [
      'parameter_name_kwarg',
      '命名关键字参数',
      '',
      false,
      false,
      [
        'parameter',
        'parameter_type',
        'parameter_default',
        'parameter_default_type',
        'parameter_vararg',
        'parameter_vararg_type',
        'parameter_name_kwarg',
        'parameter_name_kwarg_type'
      ],
      [
        'parameter_name_kwarg',
        'parameter_name_kwarg_type',
        'parameter_kwarg',
        'parameter_kwarg_type'
      ]
    ],
    [
      'parameter_name_kwarg_type',
      '命名关键字参数(有类型提示)',
      '',
      true,
      false,
      [
        'parameter',
        'parameter_type',
        'parameter_default',
        'parameter_default_type',
        'parameter_vararg',
        'parameter_vararg_type',
        'parameter_name_kwarg',
        'parameter_name_kwarg_type'
      ],
      [
        'parameter_name_kwarg',
        'parameter_name_kwarg_type',
        'parameter_kwarg',
        'parameter_kwarg_type'
      ]
    ],
    [
      'parameter_name_kwarg_default',
      '默认命名关键字参数',
      '',
      false,
      false,
      [
        'parameter',
        'parameter_type',
        'parameter_default',
        'parameter_default_type',
        'parameter_vararg',
        'parameter_vararg_type',
        'parameter_name_kwarg',
        'parameter_name_kwarg_type'
      ],
      [
        'parameter_name_kwarg',
        'parameter_name_kwarg_type',
        'parameter_kwarg',
        'parameter_kwarg_type'
      ]
    ],
    [
      'parameter_name_kwarg_default_type',
      '默认命名关键字参数(有类型提示)',
      '',
      true,
      false,
      [
        'parameter',
        'parameter_type',
        'parameter_default',
        'parameter_default_type',
        'parameter_vararg',
        'parameter_vararg_type',
        'parameter_name_kwarg',
        'parameter_name_kwarg_type'
      ],
      [
        'parameter_name_kwarg',
        'parameter_name_kwarg_type',
        'parameter_kwarg',
        'parameter_kwarg_type'
      ]
    ],
    [
      'parameter_kwarg',
      '关键字参数',
      '**',
      false,
      false,
      [
        'parameter',
        'parameter_type',
        'parameter_default',
        'parameter_default_type',
        'parameter_vararg',
        'parameter_vararg_type',
        'parameter_name_kwarg',
        'parameter_name_kwarg_type'
      ],
      []
    ],
    [
      'parameter_kwarg_type',
      '关键字参数(有类型提示)',
      '**',
      true,
      false,
      [
        'parameter',
        'parameter_type',
        'parameter_default',
        'parameter_default_type',
        'parameter_vararg',
        'parameter_vararg_type',
        'parameter_name_kwarg',
        'parameter_name_kwarg_type'
      ],
      []
    ]
  ].forEach(function (item) {
    let paramType = item[0],
      paramDescription = item[1],
      paramPrefix = item[2],
      paramTyped = item[3],
      paramDefault = item[4],
      paramPrev = item[5],
      paramNext = item[6]
    // 定义 Mutant 块
    let mutantType = `ast_function_mutant_with_${paramType}`
    Blockly.Blocks[mutantType] = {
      init: function () {
        this.appendDummyInput().appendField(paramDescription)
        this.setPreviousStatement(true, paramPrev)
        this.setNextStatement(true, paramNext)
        this.setColour('#7FB6FF')
        this.contextMenu = false
      }
    }
    mutantTypeList.push(mutantType)
    // 定义 Parameter 块
    let blockType = `ast_function_with_${paramType}`
    Blockly.Blocks[blockType] = {
      init: function () {
        this.appendDummyInput()
          .appendField(paramPrefix)
          .appendField(new Blockly.FieldVariable('param'), 'NAME')
        if (paramTyped) this.appendValueInput('TYPE').appendField(' : ')
        if (paramDefault) this.appendValueInput('DEFAULT').appendField(' = ')
        this.setInputsInline(true)
        this.setOutput(true)
        this.setColour('#7FB6FF')
        this.contextMenu = false
      }
    }
    pythonGenerator.forBlock['ast_function_with_' + paramType] = function (block: any) {
      let name = pythonGenerator.nameDB_.getName(
        block.getFieldValue('NAME'),
        Blockly.VARIABLE_CATEGORY_NAME
      )
      let typed = ''
      if (paramTyped) {
        typed =
          ': ' + (pythonGenerator.valueToCode(block, 'TYPE', pythonGenerator.ORDER_NONE) || 'Any')
      }
      let defaulted = ''
      if (paramDefault) {
        defaulted =
          '=' +
          (pythonGenerator.valueToCode(block, 'DEFAULT', pythonGenerator.ORDER_NONE) || 'None')
      }
      return [paramPrefix + name + typed + defaulted, pythonGenerator.ORDER_ATOMIC]
    }
  })
  // function findLegalName(name: string, block: Block): string {
  //   if (block.isInFlyout) {
  //     // Flyouts can have multiple procedures called 'do something'.
  //     return name;
  //   }
  //   name = name || Msg['UNNAMED_KEY'] || 'unnamed';
  //   while (!isLegalName(name, block.workspace, block)) {
  //     // Collision with another procedure.
  //     const r = name.match(/^(.*?)(\d+)$/);
  //     if (!r) {
  //       name += '2';
  //     } else {
  //       name = r[1] + (parseInt(r[2]) + 1);
  //     }
  //   }
  //   return name;
  // }
  // function rename(this: Field, name: string): string {
  //   // Strip leading and trailing whitespace.  Beyond this, all names are legal.
  //   name = name.trim();
  //
  //   const legalName = findLegalName(name, (this.getSourceBlock()));
  //   const oldName = this.getValue();
  //   if (oldName !== name && oldName !== legalName) {
  //     // Rename any callers.
  //     const blocks = this.getSourceBlock().workspace.getAllBlocks(false);
  //     for (let i = 0; i < blocks.length; i++) {
  //       // Assume it is a procedure so we can check.
  //       const procedureBlock = blocks[i] as unknown as ProcedureBlock;
  //       if (procedureBlock.renameProcedure) {
  //         procedureBlock.renameProcedure(oldName as string, legalName);
  //       }
  //     }
  //   }
  //   return legalName;
  // };

  function functionRename(name: any) {
    // const newName = name.trim();
    // const isSnakeCase = /^[a-z_]+[a-z0-9_]*$/.test(newName);
    // if (!isSnakeCase) {
    //     this.getSourceBlock().setFieldValue("按照PEP8，函数建议采用SnakeCase", "NAME_CHECK");
    // } else {
    //     this.getSourceBlock().setFieldValue("", "NAME_CHECK");
    // }
    // const oldName = this.getValue();
    // if (oldName !== newName) {
    //     // this.getSourceBlock().setFieldValue(newName, "NAME_CHECK");
    // }
  }

  Blockly.Blocks['ast_function_def'] = {
    init: function () {
      this.decoratorsCount_ = 0
      this.parametersCount_ = 0
      this.hasReturn_ = false
      this.mutatorComplexity_ = 0
      this.setColour('#7FB6FF')
      const nameField = new Blockly.FieldTextInput('func', functionRename)
      nameField.setSpellcheck(false)
      this.appendDummyInput()
        .appendField('定义')
        .appendField(nameField, 'NAME')
        .appendField('', 'NAME_CHECK')
      this.appendStatementInput('BODY').setCheck(null)
      this.setInputsInline(false)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setMutator(new Blockly.icons.MutatorIcon(mutantTypeList, this))
      this.updateShape_()
    },
    mutationToDom: function () {
      let container = document.createElement('mutation')
      container.setAttribute('decorators_count', this.decoratorsCount_)
      container.setAttribute('parameters_count', this.parametersCount_)
      container.setAttribute('has_returns', this.hasReturn_)
      return container
    },
    domToMutation: function (xmlElement: any) {
      this.decoratorsCount_ = parseInt(xmlElement.getAttribute('decorators_count'), 10)
      this.parametersCount_ = parseInt(xmlElement.getAttribute('parameters_count'), 10)
      this.hasReturn_ = xmlElement.getAttribute('has_returns') === 'true'
      // Blockly.Procedures.mutateCallers(this);
      this.updateShape_()
    },
    saveExtraState: function() {
      return {
        'decorators_count': this.decoratorsCount_,
        'parameters_count': this.parametersCount_,
        'has_returns': this.hasReturn_ };
    },
    loadExtraState: function(state: any) {
      this.decoratorsCount_ = state['decorators_count'];
      this.parametersCount_ = state['parameters_count'];
      this.hasReturn_ = state['has_returns'];
      this.updateShape_();
    },
    decompose: function (workspace: any) {
      let containerBlock = workspace.newBlock('ast_function_mutant_with_container')
      containerBlock.initSvg()
      containerBlock.setFieldValue(this.hasReturn_ ? 'TRUE' : 'FALSE', 'RETURNS')

      let connection = containerBlock.getInput('STACK').connection
      let parameters = []
      for (let i = 0; i < this.parametersCount_; i++) {
        let parameter = this.getInput('PARAMETER' + i).connection
        let sourceType = parameter.targetConnection.getSourceBlock().type
        let createName =
          'ast_function_mutant_with_' + sourceType.substring('ast_function_with_'.length)
        let itemBlock = workspace.newBlock(createName)
        itemBlock.initSvg()
        connection.connect(itemBlock.previousConnection)
        connection = itemBlock.nextConnection
        parameters.push(itemBlock)
      }
      return containerBlock
    },
    compose: function (containerBlock: any) {
      let itemBlock = containerBlock.getInputTargetBlock('STACK')
      let connections = []
      let blockTypes = []
      while (itemBlock && !itemBlock.isInsertionMarker()) {
        connections.push(itemBlock.valueConnection_)
        blockTypes.push(itemBlock.type)
        itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock()
      }
      for (let i = 0; i < this.parametersCount_; i++) {
        let connection = this.getInput('PARAMETER' + i).connection.targetConnection
        if (connection && connections.indexOf(connection) === -1) {
          let connectedBlock = connection.getSourceBlock()
          for (let j = 0; j < connectedBlock.inputList.length; j++) {
            let field = connectedBlock.inputList[j].connection
            if (field && field.targetConnection) {
              field.targetConnection.getSourceBlock().unplug(true)
            }
          }
          connection.disconnect()
          connection.getSourceBlock().dispose()
        }
      }
      this.parametersCount_ = connections.length
      this.updateShape_()
      for (let i = 0; i < this.parametersCount_; i++) {
        Blockly.Mutator.reconnect(connections[i], this, 'PARAMETER' + i)
        if (!connections[i]) {
          let createName =
            'ast_function_with_' + blockTypes[i].substring('ast_function_mutant_with_'.length)
          let itemBlock = this.workspace.newBlock(createName)

          itemBlock.setDeletable(false)
          itemBlock.setMovable(false)
          itemBlock.initSvg()
          // this.getInput("PARAMETER" + i).connection.connect(itemBlock.outputConnection);
          itemBlock.outputConnection.connect(this.getInput('PARAMETER' + i).connection)
          // itemBlock 的 render 会导致一个异常，其中 blockRendering.Drawer.layoutField_ 中提示 setAttribute 为 null
          // layoutField_ 使用了a.field.getSvgRoot()，调用了 Field 下的 getSvgRoot, 但执行时 fieldGroup_ 为 null，所以抛出异常，推测时由于异步执行引起的
          try {
            itemBlock.render()
          } catch (e) {
            console.log(e)
          }
        }
      }
      let hasReturns = containerBlock.getFieldValue('RETURNS')
      if (hasReturns !== null) {
        hasReturns = hasReturns === 'TRUE'
        if (this.hasReturn_ !== hasReturns) {
          if (hasReturns) {
            this.setReturnAnnotation_(true)
            Blockly.Mutator.reconnect(this.returnConnection_, this, 'RETURNS')
            this.returnConnection_ = null
          } else {
            let returnConnection = this.getInput('RETURNS').connection
            this.returnConnection_ = returnConnection.targetConnection
            if (this.returnConnection_) {
              let returnBlock = returnConnection.targetBlock()
              returnBlock.unplug()
              returnBlock.bumpNeighbours_()
            }
            this.setReturnAnnotation_(false)
          }
        }
      }
    },
    saveConnections: function (containerBlock: any) {
      let itemBlock = containerBlock.getInputTargetBlock('STACK')
      let i = 0
      while (itemBlock) {
        let input = this.getInput('PARAMETER' + i)
        itemBlock.valueConnection_ = input && input.connection.targetConnection
        i++
        itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock()
      }
    },
    updateShape_: function () {
      let block = this
      ;[
        ['DECORATOR', 'decoratorsCount_', null, 'decorated by'],
        ['PARAMETER', 'parametersCount_', 'Parameter', 'parameters:']
      ].forEach(function (childTypeTuple) {
        let childTypeName: any = childTypeTuple[0],
          countVariable: any = childTypeTuple[1],
          inputCheck: any = childTypeTuple[2],
          childTypeMessage: any = childTypeTuple[3]
        let i = 0
        for (; i < block[countVariable]; i++) {
          if (!block.getInput(childTypeName + i)) {
            let input = block
              .appendValueInput(childTypeName + i)
              .setCheck(inputCheck)
              .setAlign(Blockly.ALIGN_RIGHT)
            if (i === 0) {
              input.appendField(childTypeMessage)
            }
          }
          block.moveInputBefore(childTypeName + i, 'BODY')
        }
        while (block.getInput(childTypeName + i)) {
          block.removeInput(childTypeName + i)
          i++
        }
      })
      this.setReturnAnnotation_(this.hasReturn_)
    },
    setReturnAnnotation_: function (status: any) {
      let currentReturn = this.getInput('RETURNS')
      if (status) {
        if (!currentReturn) {
          this.appendValueInput('RETURNS')
            .setCheck(null)
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField('returns')
        }
        this.moveInputBefore('RETURNS', 'BODY')
      } else if (!status && currentReturn) {
        this.removeInput('RETURNS')
      }
      this.hasReturn_ = status
    },
    renameVarById: function (oldId: any, newId: any) {
      const oldVariable = this.workspace.getVariableById(oldId)
      if (oldVariable.type !== '') {
        // Procedure arguments always have the empty type.
        return
      }
      const oldName = oldVariable.name
      const newVar = this.workspace.getVariableById(newId)

      let change = false
      for (let i = 0; i < this.argumentVarModels_.length; i++) {
        if (this.argumentVarModels_[i].getId() === oldId) {
          this.arguments_[i] = newVar.name
          this.argumentVarModels_[i] = newVar
          change = true
        }
      }
      if (change) {
        this.displayRenamedVar_(oldName, newVar.name)
        // Procedures.mutateCallers(this);
      }
    },
    updateVarName: function (variable: any) {
      const newName = variable.name
      let change = false
      let oldName
      for (let i = 0; i < this.argumentVarModels_.length; i++) {
        if (this.argumentVarModels_[i].getId() === variable.getId()) {
          oldName = this.arguments_[i]
          this.arguments_[i] = newName
          change = true
        }
      }
      if (change) {
        this.displayRenamedVar_(oldName, newName)
        // Procedures.mutateCallers(this);
      }
    },
    /**
     * Update the display to reflect a newly renamed argument.
     * @param {string} oldName The old display name of the argument.
     * @param {string} newName The new display name of the argument.
     * @private
     * @this {Block}
     */
    displayRenamedVar_: function (oldName: any, newName: any) {
      this.updateParams_()
      // Update the mutator's variables if the mutator is open.
      // if (this.mutator && this.mutator.isVisible()) {
      //     const blocks = this.mutator.workspace_.getAllBlocks(false);
      //     for (let i = 0, block; (block = blocks[i]); i++) {
      //         if (block.type === "procedures_mutatorarg"
      //     && Names.equals(oldName, block.getFieldValue("NAME"))) {
      //             block.setFieldValue(newName, "NAME");
      //         }
      //     }
      // }
    }
  }

  pythonGenerator.forBlock['ast_function_def'] = function (block: any) {
    let name = pythonGenerator.nameDB_.getName(
      block.getFieldValue('NAME'),
      Blockly.VARIABLE_CATEGORY_NAME
    )
    let decorators = new Array(block.decoratorsCount_)
    for (let i = 0; i < block.decoratorsCount_; i++) {
      let decorator =
        pythonGenerator.valueToCode(block, 'DECORATOR' + i, pythonGenerator.ORDER_NONE) ||
        pythonGenerator.blank
      decorators[i] = '@' + decorator + '\n'
    }
    let parameters = new Array(block.parametersCount_)
    for (let i = 0; i < block.parametersCount_; i++) {
      parameters[i] =
        pythonGenerator.valueToCode(block, 'PARAMETER' + i, pythonGenerator.ORDER_NONE) ||
        pythonGenerator.blank
    }
    let returns = ''
    if (this.hasReturn_) {
      returns =
        ' -> ' + pythonGenerator.valueToCode(block, 'RETURNS', pythonGenerator.ORDER_NONE) || 'Any'
    }
    let body = pythonGenerator.statementToCode(block, 'BODY') || pythonGenerator.PASS
    return (
      decorators.join('') +
      'def ' +
      name +
      '(' +
      parameters.join(', ') +
      ')' +
      returns +
      ':\n' +
      body
    )
  }
}
