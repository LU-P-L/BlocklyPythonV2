<template>
<div>
  <n-modal
    v-model:show="stdInputValueBatchModifyFlag"
    preset="dialog"
    title="批量修改输入内容"
    positive-text="改好啦"
    negative-text="算了保持原来的内容"
    @positive-click="stdInputValueBatchModifyFinishBtn"
  >
    <!-- lockdown-install.js:1 null 是由于autosize引起的 -->
    <n-input
      v-model:value="stdInputValueText"
      type="textarea"
      placeholder="[Input]本处用于输入"
      clearable
      show-count
      autosize
    />
  </n-modal>
  <n-button @click="stdInputValueBatchModifyStartBtn">
    批量修改输入
  </n-button>
  <n-dynamic-input
      v-model:value="stdInputValueList"
      placeholder="[Input] 添加一行输入"
  >
  </n-dynamic-input>
</div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { NButton, NInput, NModal, NDynamicInput } from "naive-ui";
import { usePyodideStdIORunInstanceStore } from './PyodideStdIORunInstance';

const stdInputValueBatchModifyFlag = ref(false);
const { stdInputValueList } = storeToRefs(usePyodideStdIORunInstanceStore());
const stdInputValueText = ref<string | undefined>(undefined);
/* 标准输入页签 - 批量修改
  用户点击批量修改按钮的时候，修改 stdInputValueBatchModifyFlag = true， 显示批量修改框
  批量修改框的内容(stdInputValueText)由于stdInputValueList转化生成
 */
const stdInputValueBatchModifyStartBtn = () => {
  stdInputValueBatchModifyFlag.value = true
  stdInputValueText.value = stdInputValueList.value.join('\n');
}
/* 标准输入页签 - 批量修改
  用户确定批量修改按钮的时候，关闭批量修改框
  stdInputValueList 由 批量修改框的内容(stdInputValueText) 更新
 */
const stdInputValueBatchModifyFinishBtn = () => {
  stdInputValueList.value = stdInputValueText.value?.split('\n') || []
}
</script>

<style scoped lang="scss">

</style>