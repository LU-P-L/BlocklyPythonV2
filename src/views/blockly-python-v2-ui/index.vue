<template>
  <n-message-provider>
    <n-dialog-provider>
      <basic-view
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
  NMessageProvider,
  NDialogProvider
} from 'naive-ui'
import {ref} from "vue";
import {storeToRefs} from "pinia";
import {BasicView, usePyodideInstanceStore} from "./blockly-python-lib/lib-ui.es";
import {addCustomBlocksV2} from "./blocks-custom/custom_blocks";

import {PyodideRuntimeTabTfvis} from "./blockly-python-lib/lib-ui.es"
import {addDefaultBlocks} from "./blockly-python-lib/lib-ui.es";
import * as tf from "@tensorflow/tfjs";
import * as tfvis from "@tensorflow/tfjs-vis";

const pyodideInstanceStore = usePyodideInstanceStore()
// blocklyEditor 加载前
const blocklyEditorOptOptions = {}
// blocklyEditor 结束
const blocklyEditorBlocksModalShow = ref<boolean>(false);
const blocklyEditorBlocksModalContent = ref<any>('案例');
const blocklyEditorMounted = (e: any) => {
  // 添加Block和更新Toolbox
  let {blocks, pythonGenerator, workspace, Blockly } = e;
  const context = {
    workspace: workspace,
    loadPackage: (name: string) => {
      pyodideInstanceStore.installPackage(name)
    },
    useDialog: function (content: any) {
      blocklyEditorBlocksModalShow.value = true;
      blocklyEditorBlocksModalContent.value = content;
    }
  }
  addDefaultBlocks(blocks, pythonGenerator, workspace, Blockly, context)
  addCustomBlocksV2(blocks, pythonGenerator, workspace, Blockly, context)
}
// Monaco 处理
const monacoEditorMounted = (editor: any) => {}
// pyodideRuntime 处理
const pyodideRuntimeTabs = [
  { name: 'matplotlib output', tab: '绘图输出', component: 'div', props: { id: 'pyodide-browser-gui-container', style: 'height: 1000px; width: 100%; overflow: scroll' } },
  { name: 'pygame output', tab: '动画输出', component: 'div', props: { style: 'height: 1000px; width: 100%; overflow: scroll', innerHTML: '<canvas id="canvas" style="margin: 0 auto; display: block;"></canvas>' } },
  { name: 'turtle output', tab: 'turtle输出', component: 'div', props: { style: 'height: 1000px; width: 100%; overflow: scroll', innerHTML: '<div id="browser_gui" style="margin: 0 auto; display: block;height: 1000px; width: 100%; overflow: scroll;"></div>' } },
  { name: 'tfvis output', tab: 'TF VIS输出', component: PyodideRuntimeTabTfvis, props: {} }
]
// pyodideRuntime 加载结束
declare global {
  interface  Document {
    pyodideMplTarget: HTMLDivElement
  }
  interface Window {
    pyodide: any;
    PyodideRuntimeInitHook: any;
    tf: any;
    tfvis: any;
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
  window.tf = tf
  window.tfvis = tfvis
}
</script>
<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    /* display: flex; */
    /* place-items: center; */
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
