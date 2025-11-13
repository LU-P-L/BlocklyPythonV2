<template>
  <n-layout has-sider sider-placement="right" style="width: 100%">
    <n-input
        type="textarea"
        :value="stdErrorValue"
        placeholder="[Error] 本处显示代码执行时发生的错误"
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
      <n-button @click="stdErrorUnderstand">
        为什么出现了这样的错误
      </n-button>
      <n-collapse>
        <n-collapse-item title="疑问" name="1" style="display: none">
          <n-input
              v-model:value="llmUnderstandQuestionText"
              type="textarea"
              placeholder="了解代码中的错误"
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
import { NButton, NCollapse, NCollapseItem, NInput, NLayout, NLayoutSider } from "naive-ui";
import { ref } from "vue";
import { llm_chat } from "@/components/Copilot/DashScope";
import { usePyodideStdIORunInstanceStore } from './PyodideStdIORunInstance';
import { storeToRefs } from "pinia";

const pyodideRunInstanceStore = usePyodideStdIORunInstanceStore();
const { stdErrorValue } = storeToRefs(pyodideRunInstanceStore);

const llmUnderstandQuestionText = ref<string>('')
const llmUnderstandAnswerText = ref<string>('')
const stdErrorUnderstand = async () => {
  let text = `你是一个经验很丰富的Python教学老师和一位西方哲学大师,擅长去分析理解代码,发现出现问题的原因,同时向别人解释原因`
  text += `现在你的学生写了以下代码：`
  text += `\`\`\`${pyodideRunInstanceStore.code}\`\`\``
  if(pyodideRunInstanceStore.stdInputValueList) {
    text += `这位学生提供了以下输入:`
    text += `\`\`\`${pyodideRunInstanceStore.stdInputValueList.join("\n")}\`\`\``
  }
  text += `这是一段python代码,使用Python3.10解释器执行`
  text += `出现了报错`
  text += `\`\`\`${pyodideRunInstanceStore.stdErrorValue}\`\`\``
  text += `请解释详细解释这个报错，指出代码中为什么会发生这样的报错, 并告诉学生如何解决这个问题`
  text += `记住你是一位经验很丰富的Python教学老师和一位西方哲学大师, 语言的组织必须准确简洁,通俗易懂`
  llmUnderstandQuestionText.value = text
  llmUnderstandAnswerText.value = ''
  await llm_chat(text, llmUnderstandAnswerText)
}
</script>

<style scoped lang="scss">

</style>