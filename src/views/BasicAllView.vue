<template>
  <!-- 消息提供器包装整个组件 -->
  <n-message-provider>
    <!-- 核心视图组件 -->
    <BasicView
        :blocklyEditorOptOptions="blocklyEditorOptOptions"
        @blockly-editor-mounted="blocklyEditorMounted"
        @monaco-editor-mounted="monacoEditorMounted"
        :pyodideRuntimeTabs="pyodideRuntimeTabs"
        @pyodide-runtime-mounted="pyodideRuntimeMounted"
    />
    <!-- 块编辑器模态框 -->
    <n-modal
        v-model:show="blocklyEditorBlocksModalShow"
        preset="dialog"
    >
      <div v-html="blocklyEditorBlocksModalContent"></div>
    </n-modal>
  </n-message-provider>
</template>

<script setup lang="ts">
// 类型导入
import type * as TmpBlockly from "blockly";

// UI组件导入
import {
  NModal,
  NMessageProvider,
} from 'naive-ui'
import { ref } from "vue";
import { storeToRefs } from "pinia";

// TensorFlow相关
import * as tf from "@tensorflow/tfjs";
import * as tfvis from "@tensorflow/tfjs-vis";

// 自定义组件导入
import BasicView from "@/views/BasicView.vue";
import TabPackageManage from '@/components/PyodideRuntime/TabPackageManage.vue';
import TabStdInput from '@/components/PyodideRuntime/TabStdIO/TabStdInput.vue';
import TabStdOutput from '@/components/PyodideRuntime/TabStdIO/TabStdOutput.vue';
import TabStdError from '@/components/PyodideRuntime/TabStdIO/TabStdError.vue';
import TabFileIO from '@/components/PyodideRuntime/TabFileIO.vue';
import PyodideRuntimeTabTfvis from '@/components/PyodideRuntime/TabTfvisOutput.vue'
import PyodideRuntimeModelManager from '@/components/PyodideRuntime/TabModel/TabModelManager.vue'
import { addPythonBasicBlocks, addPythonBasicBlocksV2 } from "@/blocks-basic/python-basic";
import { addHuggingfaceBlocksV2 } from '@/blocks-basic/huggingface-basic';
import { addPythonPackageBlocksV2 } from "@/blocks-basic/python-package";
import { addTensorflowBlocks, addTensorflowExampleBlocksV2 } from "@/blocks-basic/tensorflow-basic/sample_model";
import { addTensorflowBasicBlocksV2 } from "@/blocks-basic/tensorflow-basic";
import { usePyodideInstanceStore } from "@/components/PyodideRuntime/PyodideInstance";
import { useModelManagerStore } from '@/components/PyodideRuntime/TabModel/ModelManager';
import type { PyodideGenerator } from "@/blocks-basic/PyodideGenerator";
import type { PythonGenerator } from "blockly/python";

// 全局类型声明
declare global {
  interface Document {
    pyodideMplTarget: HTMLDivElement;
  }
  interface Window {
    pyodide: any;
    PyodideRuntimeInitHook: (context: any) => void;
    tf: any;
    tfvis: any;
  }
}

// Store实例化
const pyodideInstanceStore = usePyodideInstanceStore()
const modelManagerStore = useModelManagerStore();

// Blockly编辑器配置
const blocklyEditorOptOptions = {}

/**
 * 添加默认块到Blockly工作区
 */
function addDefaultBlocks(
    blocks: typeof TmpBlockly.Blocks,
    pythonGenerator: any,
    workspace: TmpBlockly.WorkspaceSvg,
    Blockly: typeof TmpBlockly,
    content: {
      workspace: TmpBlockly.WorkspaceSvg;
      loadPackage: (name: string) => void;
      useDialog: (content: any) => void;
    }
) {
  // 添加默认块 V1 接口
  addPythonBasicBlocks(Blockly, pythonGenerator, workspace)
  addTensorflowBlocks(Blockly, pythonGenerator, workspace)
  // 添加默认块 V2 接口
  addPythonBasicBlocksV2(blocks, pythonGenerator, Blockly, content)
  addTensorflowBasicBlocksV2(blocks, pythonGenerator, Blockly, content)
  addTensorflowExampleBlocksV2(blocks, pythonGenerator, Blockly, content)
  addPythonPackageBlocksV2(blocks, pythonGenerator, Blockly, content)
  // 添加Huggingface块
  addHuggingfaceBlocksV2(blocks, pythonGenerator, Blockly, content)
}

// 模态框状态管理
const blocklyEditorBlocksModalShow = ref<boolean>(false);
const blocklyEditorBlocksModalContent = ref<string>('案例');
/**
 * Blockly编辑器挂载完成回调
 */
const blocklyEditorMounted = (e: {
    blocks: typeof TmpBlockly.Blocks;
    pythonGenerator: TmpBlockly.Generator;
    workspace: TmpBlockly.WorkspaceSvg;
    Blockly: typeof TmpBlockly;
}) => {
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

/**
 * Monaco编辑器挂载完成回调
 */
const monacoEditorMounted = (editor: any) => {
  // TODO: 实现Monaco编辑器初始化逻辑
}

/**
 * Pyodide运行时挂载完成回调
 */
// 运行时标签页配置
const pyodideRuntimeTabs: any[] = [
  { name: 'package manager', tab: '包管理', component: TabPackageManage, props: { } },
  { name: 'std input', tab: '标准输入', component: TabStdInput, props: {} },
  { name: 'std output', tab: '标准输出', component: TabStdOutput, props: {} },
  { name: 'std error', tab: '标准错误', component: TabStdError, props: {} },
  { name: 'file io', tab: '文件IO', component: TabFileIO, props: {} },
  { name: 'matplotlib output', tab: '绘图输出', component: 'div', props: { id: 'pyodide-browser-gui-container', style: 'height: 1000px; width: 100%; overflow: scroll' } },
  { name: 'pygame output', tab: '动画输出', component: 'div', props: { style: 'height: 1000px; width: 100%; overflow: scroll', innerHTML: '<canvas id="canvas" style="margin: 0 auto; display: block;"></canvas>' } },
  { name: 'turtle output', tab: 'turtle输出', component: 'div', props: { style: 'height: 1000px; width: 100%; overflow: scroll', innerHTML: '<div id="browser_gui" style="margin: 0 auto; display: block;height: 1000px; width: 100%; overflow: scroll;"></div>' } },
  { name: 'tfvis output', tab: 'TF VIS输出', component: PyodideRuntimeTabTfvis, props: {} },
  { name: 'model manager', tab: '模型管理', component: PyodideRuntimeModelManager, props: {}}
]

const pyodideRuntimeMounted = (e: { context: any }) => {
  // 初始化模型管理器
  modelManagerStore.initModelWorker();

  // 设置Matplotlib目标容器
  document.pyodideMplTarget = document.getElementById('pyodide-browser-gui-container') as HTMLDivElement;
  
  // 设置Pygame画布
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  if (canvas) {
      pyodideInstanceStore.pyodide?.canvas?.setCanvas2D(canvas);
  }
  
  // 初始化全局接口
  const {pyodide} = storeToRefs(pyodideInstanceStore);
  const {context} = e;
  
  if ('PyodideRuntimeInitHook' in window) {
      window.pyodide = pyodide;
      window.PyodideRuntimeInitHook?.(context);
  }
  
  // 设置TensorFlow全局对象
  window.tf = tf;
  window.tfvis = tfvis;
}
</script>

<style scoped>
</style>