<template>
  <n-message-provider>
    <n-dialog-provider>
      <BasicView
          :blocklyEditorOptOptions="blocklyEditorOptOptions"
          @blockly-editor-mounted="blocklyEditorMounted"
          @monaco-editor-mounted="monacoEditorMounted"
          :pyodideRuntimeTabs="pyodideRuntimeTabs"
          @pyodide-runtime-mounted="pyodideRuntimeMounted"
      />
      <n-modal
          v-model:show="blocklyEditorBlocksModalShow"
          preset="dialog"
      >
        <div v-html="blocklyEditorBlocksModalContent"></div>
      </n-modal>
    </n-dialog-provider>
  </n-message-provider>
</template>

<script setup lang="ts">
import {
  NModal,
  NMessageProvider, NDialogProvider,
} from 'naive-ui'
import {ref} from "vue";
import {storeToRefs} from "pinia";
import type TmpBlockly from "blockly";

import BasicView from "@/views/BasicView.vue";
import {addPythonBasicBlocks, addPythonBasicBlocksV2} from "@/blocks-basic/python-basic";
import {addPythonPackageBlocksV2} from "@/blocks-basic/python-package";
import {usePyodideInstanceStore} from "@/components/PyodideRuntime/PyodideInstance";

//
const pyodideInstanceStore = usePyodideInstanceStore()
// blocklyEditor 加载前
const blocklyEditorOptOptions = {}
// blocklyEditor 结束
// blocklyEditor 添加默认块
function addDefaultBlocks(
    blocks: typeof TmpBlockly.Blocks,
    pythonGenerator: TmpBlockly.Generator,
    workspace: TmpBlockly.WorkspaceSvg,
    Blockly: typeof TmpBlockly,
    content: any
) {
  // 添加默认块 V1 接口
  addPythonBasicBlocks(Blockly, pythonGenerator, workspace)
  // 添加默认块 V2 接口
  addPythonBasicBlocksV2(blocks, pythonGenerator, Blockly, content)
  addPythonPackageBlocksV2(blocks, pythonGenerator, Blockly, content)
}
const blocklyEditorBlocksModalShow = ref<boolean>(false);
const blocklyEditorBlocksModalContent = ref<any>('案例');
const blocklyEditorMounted = (e: any) => {
  // 添加Block和更新Toolbox
  let {blocks, pythonGenerator, workspace, Blockly } = e;
  addDefaultBlocks(blocks, pythonGenerator, workspace, Blockly, {
    workspace: workspace,
    loadPackage: (name: string) => {
      pyodideInstanceStore.installPackage(name)
    },
    useDialog: function (content: any) {
      blocklyEditorBlocksModalShow.value = true;
      blocklyEditorBlocksModalContent.value = content;
    }
  })
}
// Monaco 处理
const monacoEditorMounted = (editor: any) => {}
// pyodideRuntime 处理
const pyodideRuntimeTabs = [
  { name: 'matplotlib output', tab: '绘图输出', component: 'div', props: { id: 'pyodide-browser-gui-container', style: 'height: 1000px; width: 100%; overflow: scroll' } },
  { name: 'pygame output', tab: '动画输出', component: 'div', props: { style: 'height: 1000px; width: 100%; overflow: scroll', innerHTML: '<canvas id="canvas" style="margin: 0 auto; display: block;"></canvas>' } },
  { name: 'turtle output', tab: 'turtle输出', component: 'div', props: { style: 'height: 1000px; width: 100%; overflow: scroll', innerHTML: '<div id="browser_gui" style="margin: 0 auto; display: block;height: 1000px; width: 100%; overflow: scroll;"></div>' } },
]
// pyodideRuntime 加载结束
declare global {
  interface  Document {
    pyodideMplTarget: HTMLDivElement;
  }
  interface Window {
    pyodide: any;
    PyodideRuntimeInitHook: any;
  }
}
const pyodideRuntimeMounted = (e: any) => {
  // matplotlib 专用
  document.pyodideMplTarget = document.getElementById('pyodide-browser-gui-container') as HTMLDivElement
  // pygame 专用
  const canvas = document.getElementById("canvas");
  if (canvas) {
    pyodideInstanceStore.pyodide?.canvas?.setCanvas2D(canvas as HTMLCanvasElement);
  }
  // 对外暴露的接口
  const {pyodide} = storeToRefs(pyodideInstanceStore);
  const {context} = e;
  if (window.hasOwnProperty('PyodideRuntimeInitHook')) {
    window.pyodide = pyodide;
    window.PyodideRuntimeInitHook(context)
  }
}
</script>

<style scoped>
</style>