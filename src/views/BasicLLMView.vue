<template>
  <n-message-provider>
    <BasicView
        @blockly-editor-mounted="blocklyEditorMounted"
    />
  </n-message-provider>
</template>

<script setup lang="ts">
import {
  NButton,
  NLayout,
  NLayoutContent,
  NLayoutHeader,
  NGrid,
  NGi,
  NDrawer,
  NDrawerContent,
  NButtonGroup,
  NModal,
  NMessageProvider,
  NSpace,
  NDropdown
} from 'naive-ui'
import BasicView from "@/views/BasicView.vue";
import TmpBlockly from "blockly";
import {addPythonBasicBlocks, addPythonBasicBlocksV2} from "@/blocks-basic/python-basic";
import {addPythonPackageBlocksV2} from "@/blocks-basic/python-package";

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

const blocklyEditorMounted = (e: any) => {
  // 添加Block和更新Toolbox
  let {blocks, pythonGenerator, workspace, Blockly } = e;
  addDefaultBlocks(blocks, pythonGenerator, workspace, Blockly, {
    workspace: workspace,
    loadPackage: (name: string) => {
      // pyodideRuntimeRef.value.packageInstallBasicFunc(name)
    },
    useDialog: function (content: any) {
      // blocklyEditorBlocksModalShow.value = true;
      // blocklyEditorBlocksModalContent.value = content;
    }
  })
  // blocklyEditorRef.value.loadToolbox(toolbox);
  // fetch('case/blockly-workspace-tf-exp-test.json').then(function(response) {
  //   return response.text();
  // }).then(function(data) {
  //   caseLoader["blockly-workspace-json"](data)
  // }).catch(function(err) {
  //   console.log("error", err);
  // });
  // fetch('case/blockly-toolbox.json').then(function(response) {
  //   return response.text();
  // }).then(function(data) {
  //   caseLoader["blockly-toolbox-json"](data)
  // }).catch(function(err) {
  //   console.log("error", err);
  // });
}
</script>

<style scoped>
</style>