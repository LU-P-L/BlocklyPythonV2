<template>
  <div id="vpl-widget" class="BlocklyEditor"></div>
</template>

<script setup lang="ts">
/**
 * Blockly编辑器组件
 * 功能：
 * 1. Blockly编辑器的初始化和渲染
 * 2. 工作区状态管理
 * 3. 代码生成与同步
 * 4. 工具箱配置
 * 5. 主题设置
 */
import { onMounted, onBeforeUnmount } from 'vue'
import { Theme, WorkspaceSvg } from 'blockly';
import * as Blockly from 'blockly/core';
import { blocks as ProcedureBlock, unregisterProcedureBlocks } from '@blockly/block-shareable-procedures'
import { log4TSProvider } from "@/components/Utils/Logger";
import { editorProps } from './BlocklyEditorType'
import './CustomToolbar'

const logger = log4TSProvider.getLogger("PyodideInstance");

// 定义props和emits
const props = defineProps(editorProps)
const emit = defineEmits(['editor-mounted'])

// workspace 不使用ref，避免响应式包装带来的问题
let workspace: WorkspaceSvg

// 初始化工作区主题
const initWorkspaceTheme = (workspace: WorkspaceSvg) => {
  workspace.setTheme(
    new Theme(
      'custom',
      {
        'logic_blocks': { 'colourPrimary': '#7FB6FF' },
        'loop_blocks': { 'colourPrimary': '#7FB6FF' },
        'list_blocks': { 'colourPrimary': '#7FB6FF' },
      },
      {},
      {
        toolboxBackgroundColour: '#7FB6FF',
        flyoutBackgroundColour: '#7FB6FF40',
        workspaceBackgroundColour: '#7FB6FF10'
      }
    )
  )
}

onMounted(() => {
  try {
    // 初始化Blockly blocks
    unregisterProcedureBlocks()
    Blockly.common.defineBlocks(ProcedureBlock)
    
    // 初始化工作区
    workspace = Blockly.inject(
      'vpl-widget',
      Object.assign(editorProps.opt_options.default(), props.opt_options)
    )
    initWorkspaceTheme(workspace)
    // 通知父组件编辑器已挂载
    emit('editor-mounted', {
      blocks: Blockly.Blocks,
      workspace,
      Blockly,
    })
  } catch (error) {
    logger.error('Blockly编辑器初始化失败:', error)
  }
})

onBeforeUnmount(() => {
  if (workspace) {
    workspace.dispose()
  }
})

// 暴露给父组件的方法
defineExpose({
  setLocale: (value: { [key: string]: string }) => {
    Blockly.setLocale(value)
  },
  loadToolbox: (value: any) => {
    workspace?.updateToolbox(value)
  },
  clearWorkspace: () => {
    workspace?.clear()
  },
  saveWorkspaceState: () => {
    return workspace ? Blockly.serialization.workspaces.save(workspace) : null
  },
  loadWorkspaceState: (state: any) => {
    if (workspace && state) {
      Blockly.serialization.workspaces.load(state, workspace)
    }
  },
  loadWorkspaceDom: (xmlText: string) => {
    if (workspace && xmlText) {
      try {
        const dom = Blockly.utils.xml.textToDom(xmlText)
        Blockly.Xml.clearWorkspaceAndLoadFromXml(dom, workspace)
      } catch (error) {
        console.error('加载工作区XML失败:', error)
      }
    }
  }
})
</script>

<style lang="scss">
.BlocklyEditor {
  flex: 1;
  min-height: 200px;
  height: 800px;
  overflow-y: auto;
}
</style>
