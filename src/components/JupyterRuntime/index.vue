<template>
  <div ref="jupyterRuntimeRef" class="jupyterRuntime"></div>
  <n-card title="JupytereRuntime" style="margin-bottom: 16px">
    <template #header-extra>
      <n-button circle @click="runCode()">
        <template #icon>
          <n-icon><code-twotone /></n-icon>
        </template>
      </n-button>
    </template>
    <n-tabs type="line" animated>
      <n-tab-pane name="jupyter 连接管理" tab="jupyter 连接管理">
        <n-alert title="提示" type="info">
          适用已经有jupyter服务器，并且jupyter服务器已经安装好了kernel
          可以适用kernel安装tensorflow等库 启动命令: python -m jupyter notebook --no-browser
          --NotebookApp.allow_origin='http://localhost:5173' --NotebookApp.disable_check_xsrf=True
          --NotebookApp.allow_credentials=True
          --NotebookApp.allow_origin_pat='^http://localhost:5173$'</n-alert
        >
        <n-input
          v-model:value="jupyterServerHost"
          type="textarea"
          default-value="http://localhost:8888/api/kernels?token=token"
          clearable
          show-count
          autosize
        />
      </n-tab-pane>
      <n-tab-pane name="std output" tab="标准输出">
        <div id="jupyter-output-area-container" style="width: 50px; height: 100px"></div>
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>
<script lang="ts">
import { RenderMimeRegistry, standardRendererFactories } from '@jupyterlab/rendermime'
import { OutputArea, OutputAreaModel } from '@jupyterlab/outputarea'

import { defineComponent, onMounted, ref } from 'vue'
import {
  NCard,
  NTabs,
  NTabPane,
  NInput,
  useMessage,
  NModal,
  NUpload,
  NUploadDragger,
  NIcon,
  NText,
  NButton,
  NDataTable,
  NAlert
} from 'naive-ui'
import { Cash, Archive } from '@vicons/ionicons5'
import { CodeTwotone } from '@vicons/antd'
import * as nbformat from "@jupyterlab/nbformat";
import {KernelMessage} from "@jupyterlab/services";

async function shutdownKernel(kernelId: any) {
  return fetch(`http://localhost:8888/api/kernels/${kernelId}`, {
    method: 'DELETE',
    credentials: 'include'
  })
}

export default defineComponent({
  components: {
    NAlert,
    NDataTable,
    NCard,
    NTabs,
    NTabPane,
    NInput,
    useMessage,
    NModal,
    NUpload,
    NUploadDragger,
    NIcon,
    NText,
    NButton,
    Cash,
    ArchiveIcon: Archive,
    CodeTwotone
  },
  name: 'JupyterRuntime',
  props: ['code'],
  emits: ['done'],
  setup(props, { emit }) {
    // 标准输出页签相关
    let outputArea: any
    const jupyterServerHost = ref<string>("http://localhost:8888/api/kernels?token=d21c71fe0ad81b8591f979ac0f3e71ceaadfbd8030a9602d")
    const createKernel = async () => {
      console.log(jupyterServerHost.value)
      const response = await fetch(
          jupyterServerHost.value,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
              name: 'python3'
            })
          }
      )

      return response.json()
    }
    const shutdownKernel = async (kernelId: any) => {
      return fetch(`http://localhost:8888/api/kernels/${kernelId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
    }

    onMounted(() => {
      const rendermime = new RenderMimeRegistry({
        initialFactories: standardRendererFactories
      })
      outputArea = new OutputArea({
        model: new OutputAreaModel(),
        rendermime: rendermime
      })
    })
    const runCode = async () => {
      console.log(props.code)
      const message = {
        header: {
          msg_id: 'execute_1',
          username: 'username',
          session: 'session',
          msg_type: 'execute_request',
          version: '5.2'
        },
        parent_header: {},
        metadata: {},
        content: {
          code: props.code,
          silent: false,
          store_history: true,
          user_expressions: {},
          allow_stdin: false
        }
      }
      const kernel = await createKernel()
      outputArea.model.clear()
      // const content: KernelMessage.IExecuteRequestMsg['content'] = {
      //   props.code,
      //   stop_on_error: true
      // };
      // kernel.requestExecute(content, false).onStdin = (msg:any) => {
      //   console.log(msg)
      //   let value = prompt()
      //   outputArea.model.add({
      //     output_type: 'stream',
      //     name: 'stdin',
      //     text: value + '\n'
      //   });
      // }
      // 发送代码执行请求
      const socket = new WebSocket(`ws://localhost:8888/api/kernels/${kernel.id}/channels`)
      socket.onopen = () => {
        console.log('WebSocket connection opened')
        socket.send(JSON.stringify(message))
      }
      socket.onmessage = (event) => {
        const message = JSON.parse(event.data)
        console.log('WebSocket message received:', message, message.parent_header.msg_type)
        if (['execute_result', 'display_data', 'stream'].includes(message.header.msg_type)) {
          const output = {
            output_type: message.header.msg_type,
            data: message.content.data,
            metadata: message.content.metadata,
            execution_count: message.content.execution_count
          }
          if (message.header.msg_type === 'stream') {
            output.name = message.content.name
            output.text = message.content.text
          }
          outputArea.model.add(output)
          // stdOutputValue.value = outputArea.node
          console.log(outputArea.node)
        document.getElementById('jupyter-output-area-container')?.appendChild(outputArea.node)
        }

      }
      console.log(kernel)
      // shutdownKernel(kernel.id)
    }
    return {
      jupyterServerHost,
      createKernel,
      runCode
    }
  }
})
</script>
<style lang="scss" scoped>
.monacoEditor {
  width: 100%;
  flex: 1;
  min-height: 200px;
  // height: 200px;
  overflow-y: auto;
}
.monacoEditor1 {
  height: calc(100% - 3px);
}
#interactive-title-container {
  width: 100%;
  height: 10%;
  display: flex;
  text-align: center;
  margin-block-end: 0px;
}
#interactive-title-container li {
  list-style-type: none;
  float: left;
  width: 133.3px;
  height: 20px;
  border-width: 2px;
  border-style: outset;
}
#interactive-area-content {
  width: 100%;
  height: 90%;
}
#interactive-area-content > * {
  width: 95%;
  height: 100%;
  background-color: rgb(227, 244, 255);
  padding-inline-start: 40px;
  border-width: 1px;
  border-style: solid;
  overflow: scroll;
  margin-top: 0px;
}
#tfjs-visor-container > * {
  overflow: scroll;
  position: relative;
  width: 100%;
  background-color: rgb(227, 244, 255);
}
#tfjs-visor-container > .visor > .visor-controls {
  display: none;
}
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
