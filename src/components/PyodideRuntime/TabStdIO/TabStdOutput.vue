<template>
  <n-layout has-sider sider-placement="right" style="width: 100%">
    <n-input
      type="textarea"
      :value="stdOutputValue"
      placeholder="[Output] 本处用于输出代码执行结果"
      :disabled="true"
      autosize
    />
    <n-layout-sider
      collapse-mode="width"
      :collapsed-width="120"
      :width="480"
      :native-scrollbar="true"
      :show-collapsed-content="false"
      show-trigger="arrow-circle"
      content-style="padding: 0px 20px 20px 20px;"
      bordered
    >
      <n-button @click="stdOutputUnderstand">
        为什么出现了这样的输出
      </n-button>
      <n-collapse>
        <n-collapse-item title="疑问" name="1" style="display: none">
          <n-input
              v-model:value="llmUnderstandQuestionText"
              type="textarea"
              placeholder="了解代码中的输出"
              clearable
              show-count
              autosize
              disabled
          />
        </n-collapse-item>
        <n-collapse-item title="回答" name="2">
          <n-input
              v-model:value="llmUnderstandAnswerText"
              type="textarea"
              placeholder=""
              clearable
              show-count
              autosize
              disabled
          />
        </n-collapse-item>
      </n-collapse>
    </n-layout-sider>
  </n-layout>
</template>

<script setup lang="ts">
import {NInput, NLayout, NLayoutSider, NButton, NCollapse, NCollapseItem} from "naive-ui";
import {ref} from "vue";
import {llm_chat} from "@/components/Copilot/DashScope";
import { storeToRefs } from "pinia";
import { usePyodideStdIORunInstanceStore } from './PyodideStdIORunInstance';

const pyodideRunInstanceStore = usePyodideStdIORunInstanceStore();
const { stdOutputValue } = storeToRefs(pyodideRunInstanceStore);

const llmUnderstandQuestionText = ref<string>('')
const llmUnderstandAnswerText = ref<string>('')
const stdOutputUnderstand = async () => {
  let text = `你是一个经验很丰富的Python教学老师和一位西方哲学大师, 擅长去分析理解代码, 发现出现问题的原因, 同时向别人解释原因`
  text += `现在你的学生写了以下代码：`
  text += `\`\`\`${pyodideRunInstanceStore.code}\`\`\``
  if(pyodideRunInstanceStore.stdInputValueList) {
    text += `这位学生提供了以下输入:`
    text += `\`\`\`${pyodideRunInstanceStore.stdInputValueList.join("\n")}\`\`\``
  }
  text += `这是一段python代码, 使用Python3.10解释器执行`
  text += `得到了以下输出`
  text += `\`\`\`${pyodideRunInstanceStore.stdOutputValue}\`\`\``
  text += `请解释详细解释这个输出`
  text += `记住你是一位经验很丰富的Python教学老师和一位西方哲学大师， 语言的组织必须准确简洁，通俗易懂`
  llmUnderstandQuestionText.value = text
  llmUnderstandAnswerText.value = ''
  await llm_chat(text, llmUnderstandAnswerText)
}
</script>

<style scoped lang="scss">

</style>