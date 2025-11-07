// TODO: direct imports are not variables, because you can do stuff like:
//         import os.path
//       What should the variable be? Blockly will mangle it, but we should really be
//       doing something more complicated here with namespaces (probably make `os` the
//       variable and have some kind of list of attributes. But that's in the fading zone.
import type * as TmpBlockly from 'blockly'
import type { CodeGenerator } from "blockly";

export function addImportBlocks(
  Blockly: typeof TmpBlockly,
  pythonGenerator: CodeGenerator,
  workspaceSvg: any
) {
  function importFlyoutCategory(workspace: any) {
    const xmlList = []
    if (Blockly.Blocks['ast_import']) {
      {
        let block = Blockly.utils.xml.createElement('block')
        block.setAttribute('type', 'ast_import')
        xmlList.push(block)
      }
      {
        let block = Blockly.utils.xml.createElement('block')
        block.setAttribute('type', 'ast_import')
        let mutation = Blockly.utils.xml.createElement('mutation')
        mutation.setAttribute('names', '1')
        mutation.setAttribute('from', 'false')
        let regular = Blockly.utils.xml.createElement('regular')
        regular.setAttribute('name', 'false')
        mutation.appendChild(regular)
        block.appendChild(mutation)
        xmlList.push(block)
      }
      {
        let block = Blockly.utils.xml.createElement('block')
        block.setAttribute('type', 'ast_import')
        let mutation = Blockly.utils.xml.createElement('mutation')
        mutation.setAttribute('names', '1')
        mutation.setAttribute('from', 'true')
        let regular = Blockly.utils.xml.createElement('regular')
        regular.setAttribute('name', 'false')
        mutation.appendChild(regular)
        block.appendChild(mutation)
        xmlList.push(block)
      }
      {
        let block = Blockly.utils.xml.createElement('block')
        block.setAttribute('type', 'ast_import')
        let mutation = Blockly.utils.xml.createElement('mutation')
        mutation.setAttribute('names', '1')
        mutation.setAttribute('from', 'true')
        let regular = Blockly.utils.xml.createElement('regular')
        regular.setAttribute('name', 'true')
        mutation.appendChild(regular)
        block.appendChild(mutation)
        xmlList.push(block)
      }
    }

    const importList = workspace.getBlocksByType('ast_import', false).flatMap(function (
      block: any
    ) {
      const importList = []
      for (let i = 0; i < block.nameCount_; i++) {
        if (block.regulars_[i]) {
          importList.push(block.getField('NAME' + i).getValue())
        } else {
          // let xxx = pythonGenerator.nameDB_.getName(block.getFieldValue("ASNAME" + i), Blockly.Names.NameType.VARIABLE);
          // importList.push(xxx);
        }
      }
      return importList
    })
    for (let i = 0; i < importList.length; i++) {
      const name = importList[i]
      const block = Blockly.utils.xml.createElement('block')
      block.setAttribute('type', 'ast_import_content')
      const mutation = Blockly.utils.xml.createElement('mutation')
      mutation.setAttribute('module_name', name)
      block.appendChild(mutation)
      xmlList.push(block)
    }
    console.log(xmlList)
    return xmlList
  }
  workspaceSvg.registerToolboxCategoryCallback('IMPORT', importFlyoutCategory)
  function importCheckExist(block: TmpBlockly.Block, name: any) {
    const newName = name.trim()
    if (['base64', 'json', 'random', 'math', 'turtle'].indexOf(newName) === -1) {
      block.setFieldValue(`导入的包${newName}尚未安装，如有需要联系ChrisJaunes`, 'MODULE_CHECK')
    } else {
      block.setFieldValue('OK', 'MODULE_CHECK')
    }
    return name
  }
  Blockly.Blocks['ast_import_content'] = {
    init: function () {
      this.module_name = '123'
      this.appendDummyInput().appendField(this.module_name, 'MODULE_NAME')
      this.setOutput(true, null)
      this.setColour('#7FB6FF')
    },
    mutationToDom: function () {
      let container = document.createElement('mutation')
      container.setAttribute('module_name', this.module_name)
      return container
    },
    /**
     * Parse XML to restore the (non-editable) name and parameters.
     * @param {!Element} xmlElement XML storage element.
     * @this Blockly.Block
     */
    domToMutation: function (xmlElement: any) {
      console.log('_________')
      console.log(xmlElement)
      console.log(this.module_name)

      this.module_name = xmlElement.getAttribute('module_name')
      this.setFieldValue(this.module_name, 'MODULE_NAME')
    }
  }
  pythonGenerator.forBlock['ast_import_content'] = function (block: any) {
    console.log(block)
    let moduleName = block.getFieldValue('MODULE_NAME')
    return `${moduleName}`
  }
  Blockly.Blocks['ast_import'] = {
    init: function () {
      this.nameCount_ = 1
      this.from_ = false
      this.regulars_ = [true]
      this.appendDummyInput().appendField('', 'MODULE_CHECK')
      this.setInputsInline(false)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.updateShape_()
      this.setColour('#7FB6FF')
    },
    /**
     * Create XML to represent the (non-editable) name and arguments.
     * @return {!Element} XML storage element.
     * @this Blockly.Block
     */
    mutationToDom: function () {
      let container = document.createElement('mutation')
      container.setAttribute('names', this.nameCount_)
      container.setAttribute('from', this.from_)
      for (let i = 0; i < this.nameCount_; i++) {
        let parameter = document.createElement('regular')
        parameter.setAttribute('name', this.regulars_[i])
        container.appendChild(parameter)
      }
      return container
    },
    /**
     * Parse XML to restore the (non-editable) name and parameters.
     * @param {!Element} xmlElement XML storage element.
     * @this Blockly.Block
     */
    domToMutation: function (xmlElement: any) {
      this.nameCount_ = parseInt(xmlElement.getAttribute('names'), 10)
      this.from_ = xmlElement.getAttribute('from') === 'true'
      this.regulars_ = []
      for (let i = 0; i < xmlElement.childNodes.length; i++) {
        const childNode = xmlElement.childNodes[i]
        if (childNode.nodeName.toLowerCase() === 'regular') {
          this.regulars_.push(childNode.getAttribute('name') === 'true')
        }
      }
      this.updateShape_()
    },
    saveExtraState: function() {
      return { 'name_count': this.nameCount_, "from": this.from_, "regulars":  this.regulars_ };
    },
    loadExtraState: function(state: any) {
      this.nameCount_ = state['name_count'];
      this.from_ = state['from'];
      this.regulars_ = state['regulars'];
      this.updateShape_();
    },
    updateShape_: function () {
      let thisBlock = this
      // Possible FROM part
      if (this.from_ && !this.getInput('FROM')) {
        this.appendDummyInput('FROM')
          .setAlign(Blockly.inputs.Align.RIGHT)
          .appendField('from')
          .appendField(
            new Blockly.FieldTextInput('module', (newValue: string): string => {
              return importCheckExist(thisBlock, newValue)
            }),
            'MODULE'
          )
      } else if (!this.from_ && this.getInput('FROM')) {
        this.removeInput('FROM')
      }
      // Import clauses
      let i = 0
      for (; i < this.nameCount_; i++) {
        let input = this.getInput('CLAUSE' + i)
        if (!input) {
          input = this.appendDummyInput('CLAUSE' + i).setAlign(Blockly.inputs.Align.RIGHT)
          if (i === 0) {
            input.appendField('import')
          }
          if (this.from_) {
            input.appendField(new Blockly.FieldTextInput('module'), 'NAME' + i)
          } else {
            input.appendField(
              new Blockly.FieldTextInput('module', (newValue: string): string => {
                return importCheckExist(thisBlock, newValue)
              }),
              'NAME' + i
            )
          }
        }
        if (this.regulars_[i] && this.getField('AS' + i)) {
          input.removeField('AS' + i)
          input.removeField('ASNAME' + i)
        } else if (!this.regulars_[i] && !this.getField('AS' + i)) {
          input
            .appendField('as', 'AS' + i)
            .appendField(new Blockly.FieldVariable('alias'), 'ASNAME' + i)
        }
      }
      // Remove deleted inputs.
      while (this.getInput('CLAUSE' + i)) {
        this.removeInput('CLAUSE' + i)
        i++
      }
      // Reposition everything
      if (this.from_ && this.nameCount_ > 0) {
        this.moveInputBefore('FROM', 'CLAUSE0')
      }
      for (i = 0; i + 1 < this.nameCount_; i++) {
        this.moveInputBefore('CLAUSE' + i, 'CLAUSE' + (i + 1))
      }
    }
  }

  pythonGenerator.forBlock['ast_import'] = function (block: any) {
    // Optional from part
    let from = ''
    if (block.from_) {
      let moduleName = block.getFieldValue('MODULE')
      from = 'from ' + moduleName + ' '
    }
    // Create a list with any number of elements of any type.
    let elements = new Array(block.nameCount_)
    for (let i = 0; i < block.nameCount_; i++) {
      elements[i] = block.getFieldValue('NAME' + i)
      if (!block.regulars_[i]) {
        console.log(block.getFieldValue('ASNAME' + i))
        console.log(Blockly.Names.NameType.VARIABLE)
        let asName = pythonGenerator.nameDB_!.getName(
          block.getFieldValue('ASNAME' + i),
          Blockly.Names.NameType.VARIABLE
        )
        elements[i] += ' as ' + asName
      }
    }
    return from + 'import ' + elements.join(', ') + '\n'
  }
}

export function addImportBlocksV2(blocks: typeof TmpBlockly.Blocks, pythonGenerator: TmpBlockly.Generator, Blockly: typeof TmpBlockly, content: any) {
  let {workspace, loadPackage}: {workspace: TmpBlockly.WorkspaceSvg, loadPackage?: any} = content
  workspace.registerButtonCallback("packageInstallButtonPressed", () => {
    const p = prompt()
    loadPackage(p)
  });
  workspace.registerToolboxCategoryCallback("IMPORT_PYODIDE", (p1): any => {
    return [{
      "kind": "button",
      "text": "安装包",
      "callbackKey": "packageInstallButtonPressed"
    }]
  })
  // workspaceSvg.registerToolboxCategoryCallback('IMPORT', importFlyoutCategory)
  // function importCheckExist(block: TmpBlockly.Block, name: any) {
  //   const newName = name.trim()
  //   if (['base64', 'json', 'random', 'math', 'turtle'].indexOf(newName) === -1) {
  //     block.setFieldValue(`导入的包${newName}尚未安装，如有需要联系ChrisJaunes`, 'MODULE_CHECK')
  //   } else {
  //     block.setFieldValue('OK', 'MODULE_CHECK')
  //   }
  //   return name
  // }
  // Blockly.Blocks['ast_import_content'] = {
  //   init: function () {
  //     this.module_name = '123'
  //     this.appendDummyInput().appendField(this.module_name, 'MODULE_NAME')
  //     this.setOutput(true, null)
  //     this.setColour('#7FB6FF')
  //   },
  //   mutationToDom: function () {
  //     let container = document.createElement('mutation')
  //     container.setAttribute('module_name', this.module_name)
  //     return container
  //   },
  //   /**
  //    * Parse XML to restore the (non-editable) name and parameters.
  //    * @param {!Element} xmlElement XML storage element.
  //    * @this Blockly.Block
  //    */
  //   domToMutation: function (xmlElement: any) {
  //     console.log('_________')
  //     console.log(xmlElement)
  //     console.log(this.module_name)
  //
  //     this.module_name = xmlElement.getAttribute('module_name')
  //     this.setFieldValue(this.module_name, 'MODULE_NAME')
  //   }
  // }
  // pythonGenerator.forBlock['ast_import_content'] = function (block: any) {
  //   console.log(block)
  //   let moduleName = block.getFieldValue('MODULE_NAME')
  //   return `${moduleName}`
  // }
  // Blockly.Blocks['ast_import'] = {
  //   init: function () {
  //     this.nameCount_ = 1
  //     this.from_ = false
  //     this.regulars_ = [true]
  //     this.appendDummyInput().appendField('', 'MODULE_CHECK')
  //     this.setInputsInline(false)
  //     this.setPreviousStatement(true, null)
  //     this.setNextStatement(true, null)
  //     this.updateShape_()
  //     this.setColour('#7FB6FF')
  //   },
  //   /**
  //    * Create XML to represent the (non-editable) name and arguments.
  //    * @return {!Element} XML storage element.
  //    * @this Blockly.Block
  //    */
  //   mutationToDom: function () {
  //     let container = document.createElement('mutation')
  //     container.setAttribute('names', this.nameCount_)
  //     container.setAttribute('from', this.from_)
  //     for (let i = 0; i < this.nameCount_; i++) {
  //       let parameter = document.createElement('regular')
  //       parameter.setAttribute('name', this.regulars_[i])
  //       container.appendChild(parameter)
  //     }
  //     return container
  //   },
  //   /**
  //    * Parse XML to restore the (non-editable) name and parameters.
  //    * @param {!Element} xmlElement XML storage element.
  //    * @this Blockly.Block
  //    */
  //   domToMutation: function (xmlElement: any) {
  //     this.nameCount_ = parseInt(xmlElement.getAttribute('names'), 10)
  //     this.from_ = xmlElement.getAttribute('from') === 'true'
  //     this.regulars_ = []
  //     for (let i = 0; i < xmlElement.childNodes.length; i++) {
  //       const childNode = xmlElement.childNodes[i]
  //       if (childNode.nodeName.toLowerCase() === 'regular') {
  //         this.regulars_.push(childNode.getAttribute('name') === 'true')
  //       }
  //     }
  //     this.updateShape_()
  //   },
  //   saveExtraState: function() {
  //     return { 'name_count': this.nameCount_, "from": this.from_, "regulars":  this.regulars_ };
  //   },
  //   loadExtraState: function(state: any) {
  //     this.nameCount_ = state['name_count'];
  //     this.from_ = state['from'];
  //     this.regulars_ = state['regulars'];
  //     this.updateShape_();
  //   },
  //   updateShape_: function () {
  //     let thisBlock = this
  //     // Possible FROM part
  //     if (this.from_ && !this.getInput('FROM')) {
  //       this.appendDummyInput('FROM')
  //           .setAlign(Blockly.inputs.Align.RIGHT)
  //           .appendField('from')
  //           .appendField(
  //               new Blockly.FieldTextInput('module', (newValue: string): string => {
  //                 return importCheckExist(thisBlock, newValue)
  //               }),
  //               'MODULE'
  //           )
  //     } else if (!this.from_ && this.getInput('FROM')) {
  //       this.removeInput('FROM')
  //     }
  //     // Import clauses
  //     let i = 0
  //     for (; i < this.nameCount_; i++) {
  //       let input = this.getInput('CLAUSE' + i)
  //       if (!input) {
  //         input = this.appendDummyInput('CLAUSE' + i).setAlign(Blockly.inputs.Align.RIGHT)
  //         if (i === 0) {
  //           input.appendField('import')
  //         }
  //         if (this.from_) {
  //           input.appendField(new Blockly.FieldTextInput('module'), 'NAME' + i)
  //         } else {
  //           input.appendField(
  //               new Blockly.FieldTextInput('module', (newValue: string): string => {
  //                 return importCheckExist(thisBlock, newValue)
  //               }),
  //               'NAME' + i
  //           )
  //         }
  //       }
  //       if (this.regulars_[i] && this.getField('AS' + i)) {
  //         input.removeField('AS' + i)
  //         input.removeField('ASNAME' + i)
  //       } else if (!this.regulars_[i] && !this.getField('AS' + i)) {
  //         input
  //             .appendField('as', 'AS' + i)
  //             .appendField(new Blockly.FieldVariable('alias'), 'ASNAME' + i)
  //       }
  //     }
  //     // Remove deleted inputs.
  //     while (this.getInput('CLAUSE' + i)) {
  //       this.removeInput('CLAUSE' + i)
  //       i++
  //     }
  //     // Reposition everything
  //     if (this.from_ && this.nameCount_ > 0) {
  //       this.moveInputBefore('FROM', 'CLAUSE0')
  //     }
  //     for (i = 0; i + 1 < this.nameCount_; i++) {
  //       this.moveInputBefore('CLAUSE' + i, 'CLAUSE' + (i + 1))
  //     }
  //   }
  // }
  //
  // pythonGenerator.forBlock['ast_import'] = function (block: any) {
  //   // Optional from part
  //   let from = ''
  //   if (this.from_) {
  //     let moduleName = block.getFieldValue('MODULE')
  //     from = 'from ' + moduleName + ' '
  //   }
  //   // Create a list with any number of elements of any type.
  //   let elements = new Array(block.nameCount_)
  //   for (let i = 0; i < block.nameCount_; i++) {
  //     elements[i] = block.getFieldValue('NAME' + i)
  //     if (!this.regulars_[i]) {
  //       console.log(block.getFieldValue('ASNAME' + i))
  //       console.log(Blockly.Names.NameType.VARIABLE)
  //       let asName = pythonGenerator.nameDB_.getName(
  //           block.getFieldValue('ASNAME' + i),
  //           Blockly.Names.NameType.VARIABLE
  //       )
  //       elements[i] += ' as ' + asName
  //     }
  //   }
  //   return from + 'import ' + elements.join(', ') + '\n'
  // }
}
