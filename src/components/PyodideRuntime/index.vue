<template>
  <n-card title="PyodideRuntime" style="margin-bottom: 16px">
    <template #header-extra>
      <n-button @click="runCode()">
        <template #icon>
          <n-icon><code-twotone /></n-icon>
        </template>
        运行
      </n-button>
    </template>
    <n-tabs type="line" animated>
      <n-tab-pane v-for="(tab, index) in props.tabs" :key="index" :name="tab.name" :tab="tab.tab" display-directive="show">
        <component :is="tab.component" v-bind="tab.props"/>
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>
<script setup lang="ts">
import { NButton, NCard, NIcon, NTabPane, NTabs } from 'naive-ui';
import { CodeTwotone } from '@vicons/antd';
import { usePyodideInstanceStore } from './PyodideInstance';

const props = defineProps<{
  tabs: { name: string; tab: string; component: string; props: any }[],
  code: string,
  preCode: string,
  preProg: string
}>();
const emit = defineEmits(['runtime-mounted']);

// 初始化并且产生一个Pyodide
const pyodideInstanceStore = usePyodideInstanceStore();

const runCode = async () => {
  pyodideInstanceStore.runPythonCode(props.code, props.preProg + '\n' + props.preCode);
}

// 发送 pyodide-load-finish 信号，由父组件处理pyodide-runtime加载完成时的东西
emit('runtime-mounted', {})
</script>
<style lang="scss" scoped>
textarea::-webkit-input-placeholder {
  /* WebKit browsers */
  font-family: var(--jp-code-font-family);
  font-size: var(--jp-code-font-size);
  line-height: var(--jp-code-line-height);
  color: rgb(84, 150, 211);
}
textarea:-moz-placeholder {
  /* Mozilla Firefox 4 to 18 */
  font-family: var(--jp-code-font-family);
  font-size: var(--jp-code-font-size);
  line-height: var(--jp-code-line-height);
  color: rgb(84, 150, 211);
}
textarea::-moz-placeholder {
  /* Mozilla Firefox 19+ */
  font-family: var(--jp-code-font-family);
  font-size: var(--jp-code-font-size);
  line-height: var(--jp-code-line-height);
  color: rgb(84, 150, 211);
}
textarea::-ms-input-placeholder {
  /* Internet Explorer 10+ */
  font-family: var(--jp-code-font-family);
  font-size: var(--jp-code-font-size);
  line-height: var(--jp-code-line-height);
  color: rgb(84, 150, 211);
}
</style>
