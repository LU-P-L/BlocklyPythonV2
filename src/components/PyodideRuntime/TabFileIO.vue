<template>
  <div>
    <n-modal
      v-model:show="filesUploadModalShow"
      preset="dialog"
      title="上传文件"
      positive-text="确认"
      negative-text="算了"
      @positive-click="filesUploadCallback"
    >
      <n-alert title="提示" type="info"> 上传数据保存在/data/local/下面 </n-alert>
      <n-upload v-model:file-list="filesUploadFileList" :default-upload="false" multiple>
        <n-upload-dragger>
          <div style="margin-bottom: 12px">
            <n-icon size="48" :depth="3">
              <archive />
            </n-icon>
          </div>
          <n-text style="font-size: 16px"> 点击或者拖动文件到该区域来上传 </n-text>
        </n-upload-dragger>
      </n-upload>
    </n-modal>
    <n-modal
      v-model:show="filesMountDirModalShow"
      preset="dialog"
      title="挂载本地夹"
      positive-text="确认"
      negative-text="算了"
    >
      <n-alert title="提示" type="info"> 挂载的文件夹在/data/mount/下面 </n-alert>
      <n-button @click="filesMountDirCallback">选择文件夹</n-button>
      <n-data-table :bordered="false" :columns="filesMountDirColumns" :data="filesMountDirList" />
    </n-modal>
    <n-button @click="() => (filesUploadModalShow = true)">上传文件</n-button>
    <n-button @click="() => (filesMountDirModalShow = true)">挂载本地夹</n-button>
    <n-button @click="fileTreeInit">刷新</n-button>
    <n-tree
      block-line
      draggable
      :data="fileTree"
      :on-load="fileTreeLazyLoad"
      check-strategy="all"
      expand-on-click
      :node-props="fileTreeNodeMenu"
    >
      <n-dropdown
        trigger="manual"
        placement="bottom-start"
        :show="fileTreeNodeMenuShow"
        :options="fileTreeNodeMenuOptions"
        :x="fileTreeNodeMenuX"
        :y="fileTreeNodeMenuY"
        @select="fileTreeNodeMenuSelect"
      />
    </n-tree>
  </div>
</template>

<script setup lang="ts">
import {
  type DropdownOption,
  NAlert,
  NButton,
  NDataTable,
  NDropdown,
  NIcon,
  NModal,
  NText,
  NTree,
  NUpload,
  NUploadDragger,
  NTag,
  type TreeOption,
  type UploadFileInfo,
} from 'naive-ui'
import { Archive } from '@vicons/ionicons5'
import { h, ref } from 'vue'
import { log4TSProvider } from '@/components/Utils/Logger'
import { usePyodideInstanceStore } from './PyodideInstance'

declare global {
  interface Window {
    showDirectoryPicker: any
  }
}
const logger = log4TSProvider.getLogger('PyodideRuntime.TabPackageManage')
const pyodideInstanceStore = usePyodideInstanceStore()

// 用户上传文件
const filesUploadModalShow = ref(false)
const filesUploadFileList = ref<UploadFileInfo[]>([])
const filesUploadCallback = () => {
  filesUploadFileList.value.forEach((value) => {
    const reader = new FileReader()
    reader.onload = (res) => {
      pyodideInstanceStore.writeFSFile(
        `/data/local/${value.name}`,
        new Uint8Array(res.target?.result as ArrayBuffer)
      )
    }
    reader.readAsArrayBuffer(value.file as any)
  })
}
// 用户挂载文件
let filesMountDirModalShow = ref(false)
const filesMountDirList = ref<any>([])
const filesMountDirColumns = ref([
  {
    title: '挂载文件夹',
    key: 'mountDirName'
  },
  {
    title: '读写权限',
    key: 'mountDirPerm',
    render(row: any) {
      return row.mountDirPerm.map((tagKey: any) => {
        return h(
          NTag,
          {
            style: {
              marginRight: '6px'
            },
            type: 'info',
            bordered: false
          },
          {
            default: () => tagKey
          }
        )
      })
    }
  },
  {
    title: '操作',
    key: 'mountDirSaveActions',
    render(row: any) {
      return h(
        NButton,
        {
          size: 'small',
          onClick: () => {
            logger.info("mountDirHandle", row.mountDirHandle, row.mountDirFsHandle)
            row.mountDirFsHandle?.syncfs()}
        },
        { default: () => '保存到磁盘' }
      )
    }
  }
])
const filesMountDirCallback = async () => {
  const dirHandle = await window.showDirectoryPicker()
  // 判断用户是否授予可读/可写权限
  if ((await dirHandle.queryPermission({ mode: 'readwrite' })) !== 'granted') {
    if ((await dirHandle.requestPermission({ mode: 'readwrite' })) !== 'granted') {
      logger.info(`用户没有授权${dirHandle.name}的可读写权限，无法Mount`)
      return
    }
  }
  const nativeFS = await pyodideInstanceStore.mountNativeFS(`/data/mount/${dirHandle.name}`, dirHandle)
  filesMountDirList.value.push({
    "mountDirName": dirHandle.name,
    "mountDirPerm": ["可读", "可写"],
    "mountDirHandle": dirHandle,
    "mountDirFsHandle": nativeFS,
  })
}
// Model
const fileTree = ref<any[]>()
const fileTreeInit = function () {
  fileTree.value = [
    {
      key: '/data',
      label: 'data',
      isLeaf: false
    }
  ]
}
fileTreeInit()
const fileTreeLazyLoad = (node: TreeOption) => {
  return new Promise<void>((resolve, reject) => {
    const path = node.key as string;
    node.children = pyodideInstanceStore.getFSDir(path)
    if (node.children) {
      resolve()
    }
    reject()
  })
}
// 右键菜单
const fileTreeNodeMenuShow = ref(false)
const fileTreeNodeMenuOptions = ref<DropdownOption[]>([])
const fileTreeNodeMenuX = ref(0)
const fileTreeNodeMenuY = ref(0)
const fileTreeNodeMenuSelect = () => { }
const fileTreeNodeMenu = ({ option }: { option: TreeOption }) => {
  return {
    onContextmenu(e: MouseEvent): void {
      fileTreeNodeMenuShow.value = true
      fileTreeNodeMenuOptions.value = [option]
      fileTreeNodeMenuX.value = e.clientX
      fileTreeNodeMenuY.value = e.clientY
      e.preventDefault()
    }
  }
}
</script>

<style scoped lang="scss"></style>