/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The toolbox category built during the custom toolbox codelab, in es6.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */
import * as Blockly from 'blockly/core'
import iconImPath from "./logo_only.svg"
class ToolboxLabel extends Blockly.ToolboxItem {
  label: any
  /**
   * Constructor for a label in the toolbox.
   * @param {!Blockly.utils.toolbox.ToolboxItemInfo} toolboxItemDef The toolbox
   *    item definition. This comes directly from the toolbox definition.
   * @param {!Blockly.IToolbox} parentToolbox The toolbox that holds this
   *    toolbox item.
   * @override
   */
  constructor(
    toolboxItemDef: Blockly.utils.toolbox.ToolboxItemInfo,
    parentToolbox: Blockly.IToolbox
  ) {
    super(toolboxItemDef, parentToolbox)
    /**
     * The button element.
     * @type {?HTMLLabelElement}
     */
    this.label = null
  }

  /**
   * Init method for the label.
   * @override
   */
  init() {
    // Create the label.
    this.label = document.createElement('label')
    // Set the name.
    this.label.textContent = this.toolboxItemDef_['name']
    // Set the color.
    this.label.style.color = this.toolboxItemDef_['colour']
    // Any attributes that begin with css- will get added to a cssconfig.
    const cssConfig = this.toolboxItemDef_['cssconfig']
    // Add the class.
    if (cssConfig) {
      this.label.classList.add(cssConfig['label'])
    }
  }

  /**
   * Gets the div for the toolbox item.
   * @returns {HTMLLabelElement} The label element.
   * @override
   */
  getDiv() {
    return this.label
  }
}

// Blockly.registry.register(Blockly.registry.Type.TOOLBOX_ITEM, 'toolboxlabel', ToolboxLabel)

class CustomCategory extends Blockly.ToolboxCategory {
  /**
   * Constructor for a custom category.
   * @override
   */
  constructor(
    categoryDef: Blockly.utils.toolbox.CategoryInfo,
    toolbox: Blockly.IToolbox,
    opt_parent: Blockly.ICollapsibleToolboxItem | undefined
  ) {
    super(categoryDef, toolbox, opt_parent)
  }

  /**
   * Adds the colour to the toolbox.
   * This is called on category creation and whenever the theme changes.
   * @override
   */
  addColourBorder_(colour: string) {
    this.rowDiv_.style.backgroundColor = colour
  }

  /**
   * Sets the style for the category when it is selected or deselected.
   * @param {boolean} isSelected True if the category has been selected,
   *     false otherwise.
   * @override
   */
  setSelected(isSelected: string | number | boolean | string[]) {
    // We do not store the label span on the category, so use getElementsByClassName.
    var labelDom = this.rowDiv_.getElementsByClassName('blocklyTreeLabel')[0]
    if (isSelected) {
      // Change the background color of the div to white.
      this.rowDiv_.style.backgroundColor = 'white'
      // Set the colour of the text to the colour of the category.
      labelDom.style.color = this.colour_
      this.iconDom_.style.color = this.colour_
    } else {
      // Set the background back to the original colour.
      this.rowDiv_.style.backgroundColor = this.colour_
      // Set the text back to white.
      labelDom.style.color = 'white'
      this.iconDom_.style.color = 'white'
    }
    // This is used for accessibility purposes.
    Blockly.utils.aria.setState(
      /** @type {!Element} */ this.htmlDiv_,
      Blockly.utils.aria.State.SELECTED,
      isSelected
    )
  }

  /**
   * Creates the dom used for the icon.
   * @returns {HTMLElement} The element for the icon.
   * @override
   */
  createIconDom_() {
    const iconImg = document.createElement('img')
    iconImg.src = iconImPath
    iconImg.alt = 'Blockly Logo'
    iconImg.width = 25
    iconImg.height = 25
    return iconImg
  }
}

// Blockly.registry.register(
//   Blockly.registry.Type.TOOLBOX_ITEM,
//   Blockly.ToolboxCategory.registrationName,
//   CustomCategory,
//   true
// )
