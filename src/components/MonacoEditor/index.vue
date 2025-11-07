<template>
  <div ref="monacoEditorRef" class="monacoEditor" :class="hightChange && 'monacoEditor1'"></div>
</template>
<script lang="ts">
import { defineComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue'
// import PythonWorker from 'monaco-editor/esm/vs/basic-languages/python/python'
// import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker.js?worker&url'
// import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker.js?worker'
import * as monaco from 'monaco-editor'
// import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'


import { editorProps } from './MonacoEditorType'

export default defineComponent({
  name: 'MonacoEditor',
  props: editorProps,
  emits: ['editor-mounted', 'update:modelValue'],
  setup(props, { emit }) {
    // ;(self as any).MonacoEnvironment = {
    //   getWorker(_: string, label: string) {
    //     return new EditorWorker()
    //   }
    // }
    let editor: any
    const monacoEditorRef = ref()
    onMounted(() => {
      // monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      //   noSemanticValidation: true,
      //   noSyntaxValidation: false
      // })
      // monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      //   target: monaco.languages.typescript.ScriptTarget.ES2020,
      //   allowNonTsExtensions: true
      // })
      editor = monaco.editor.create(monacoEditorRef.value, {
        value: props.modelValue,
        language: props.language,
        readOnly: props.readOnly,
        theme: props.theme,
        ...props.options
      })
      // 监听值的变化
      editor.onDidChangeModelContent(() => {
        const value = editor.getValue() // 给父组件实时返回最新文本
        emit('update:modelValue', value)
      })
    })
    onBeforeUnmount(() => {
      editor.dispose()
    })
    watch(
      () => props.modelValue,
      (newValue) => {
        if (editor) {
          const value = editor.getValue()
          console.log('newValue', newValue)
          console.log('value', value)
          if (newValue !== value) {
            editor.setValue(newValue)
          }
        }
      }
    )
    watch(
      () => props.options,
      (newValue) => {
        editor.updateOptions(newValue)
      },
      { deep: true }
    )
    watch(
      () => props.readOnly,
      () => {
        console.log('props.readOnly', props.readOnly)
        editor.updateOptions({ readOnly: props.readOnly })
      },
      { deep: true }
    )
    watch(
      () => props.language,
      (newValue) => {
        monaco.editor.setModelLanguage(editor.getModel()!, newValue)
      }
    )
    emit('editor-mounted', {editor: editor})
    return { monacoEditorRef }
  }
})
</script>
<style lang="scss">
.monacoEditor {
  width: 100%;
  height: 100%;
  overflow-y: auto;
}
</style>
