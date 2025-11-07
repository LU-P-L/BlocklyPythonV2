<template>
    <n-layout style="height: 100%; width: 100%">
      <n-layout-header class="header-container" bordered>
        <logo-header></logo-header>
        <div class="button-row">
          <div class="button-container">
            <n-space align="center" fill item-style="flex: 1;">
              <!-- 编辑按钮 -->
              <n-dropdown trigger="click" :options="editOptions" @select="editOptionsSelect">
                <n-button
                  style="height: 25px; background-color: rgb(104, 156, 238); color: white"
                  round
                >
                  <edit-outlined-icon style="width: 24px; height: 24px" />
                  编辑
                </n-button>
              </n-dropdown>
              <!-- 查看案例按钮 -->
              <n-button
                style="height: 25px; background-color: rgb(104, 156, 238); color: white"
                round
                @click="caseButton()"
              >
                <document-text-outline-icon style="width: 24px; height: 24px; color: white" />
                案例
              </n-button>
            </n-space>
          </div>
          <div class="text-center-group">
            <n-button-group>
              <n-button style="font-size: 12px; height: 25px" @click="pyodideRuntimeActive('bottom')">
                <flag-sharp-icon style="width: 24px; height: 24px; color: rgb(72, 146, 224)" />
                打开Pyodide运行
              </n-button>
              <n-button style="font-size: 12px; height: 25px" @click="jupyterRuntimeActive('bottom')">
                <flag-sharp-icon style="width: 24px; height: 24px; color: rgb(72, 146, 224)" />
                打开Jupyter运行
              </n-button>
            </n-button-group>
            <n-drawer
              v-model:show="pyodideRuntimeDrawerShow"
              :default-width="502"
              :placement="runtimePlacementRef"
              default-height="500"
              display-directive="show"
              resizable
            >
              <n-drawer-content title="运行代码">
                <pyodide-runtime
                    ref="pyodideRuntimeRef"
                    :tabs="props.pyodideRuntimeTabs"
                    :code="workspaceValue"
                    :pre-code="pyodidePreCode"
                    :pre-prog="pyodidePreProg"
                    @runtime-mounted="pyodideRuntimeMounted"
                />
              </n-drawer-content>
            </n-drawer>
            <n-drawer
              v-model:show="jupyterRuntimeDrawerShow"
              :default-width="502"
              :placement="runtimePlacementRef"
              default-height="500"
              display-directive="show"
              resizable
            >
              <n-drawer-content title="运行代码">
                <JupyterRuntime ref="jupyterRuntimeRef" v-model:code="workspaceValue" />
              </n-drawer-content>
            </n-drawer>
          </div>
        </div>
      </n-layout-header>
      <n-layout-content content-style="padding: 0px;" has-sider>
        <n-grid :cols="2">
          <n-gi>
            <blockly-widget
              ref="blocklyEditorRef"
              :opt_options="props.blocklyEditorOptOptions"
              @editor-mounted="blocklyEditorMounted"
            />
          </n-gi>
          <n-gi>
            <monaco-editor-widget
              ref="monacoEditorRef"
              v-model="workspaceValue"
              :language="language"
              :hight-change="heightChange"
              @editor-mounted="monacoEditorMounted"
            />
          </n-gi>
        </n-grid>
      </n-layout-content>
      <CopyRightFooter/>
    </n-layout>
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
  NSpace,
  NDropdown,
  useMessage,
  useDialog
} from 'naive-ui'
import { EditOutlined as EditOutlinedIcon } from '@vicons/antd'
import { FlagSharp as FlagSharpIcon, DocumentTextOutline as DocumentTextOutlineIcon } from '@vicons/ionicons5'
import { onMounted, ref, onBeforeMount } from 'vue'
import type { DrawerPlacement } from 'naive-ui'

// 视图组件
import BlocklyWidget from '@/components/BlocklyEditor/index.vue'
import CopyRightFooter from '@/components/CopyRightFooter/index.vue'
import JupyterRuntime from '@/components/JupyterRuntime/index.vue'
import LogoHeader from '@/components/LogoHeader/index.vue'
import MonacoEditorWidget from '@/components/MonacoEditor/index.vue'
import PyodideRuntime from '@/components/PyodideRuntime/index.vue'
// 全局数据
import { usePyodideInstanceStore } from "@/components/PyodideRuntime/PyodideInstance";
import { usePyodideStdIORunInstanceStore } from '@/components/PyodideRuntime/TabStdIO/PyodideStdIORunInstance'
// 功能组件
import { CaseManagement } from '@/components/CaseManagement/CaseManagement'
import { InitManagement } from '@/components/CaseManagement/InitManagement'
import { loadFile, saveText2File, loadFile2Text } from '@/components/Utils/Tools'
import * as ZH from 'blockly/msg/zh-hans'
import { log4TSProvider } from "@/components/Utils/Logger";
import { pyodideGenerator } from '@/blocks-basic/PyodideGenerator'

const logger = log4TSProvider.getLogger("BasicView")

// 父子组件交互
const props = defineProps<{
  blocklyEditorOptOptions: any,
  pyodideRuntimeTabs: any[]
}>()

const emit = defineEmits([
  'blockly-editor-mounted',
  'monaco-editor-mounted',
  'pyodide-runtime-mounted',
])

/**
 * Blockly编辑器
 */
const blocklyEditorRef = ref<typeof BlocklyWidget>();
const workspaceValue = ref('')
const pyodidePreCode = ref("")
const blocklyEditorMounted = (e:any) => {
  // BlocklyEditor加载完成
  logger.info("BlocklyEditor 已经加载完成");
  // 设置语言
  blocklyEditorRef.value?.setLocale(ZH);
  // 为workspace添加监听
  let { blocks, workspace, Blockly } = e;
  workspace.addChangeListener(() => {
    const { pre_code, code } = pyodideGenerator.workspaceToPyodideCode(workspace);
    workspaceValue.value = code;
    pyodidePreCode.value = pre_code;
  })
  // 挂载完成回调
  emit('blockly-editor-mounted', {
    blocks, pythonGenerator: pyodideGenerator, workspace, Blockly
  });
}
/**
 * Monaco 编辑器
 */
let monacoEditorRef = ref<typeof MonacoEditorWidget>()
const language = ref('python')
const heightChange = ref<any>(false)
const monacoEditorMounted = (editor: any) => {
  logger.info("Monaco编辑器已经加载完成");
  emit('monaco-editor-mounted', editor);
}
/**
 * Runtime 处理
 */
const runtimePlacementRef = ref<DrawerPlacement>('bottom')
// JupyterRuntime 处理
const jupyterRuntimeDrawerShow = ref(false)
const jupyterRuntimeActive = (place: DrawerPlacement) => {
  jupyterRuntimeDrawerShow.value = true
  runtimePlacementRef.value = place
}
// pyodideRuntime 处理
declare global {
  interface Window {
    PYODIDE_PATH: string;
  }
}
const pyodideInstanceStoreInit = () => {
  // 添加packages
  fetch('case/pyodide-package.json').then(function(response) {
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    return response.text();
  }).then(function(data) {
    caseLoader["pyodide-package-json"](data)
  }).catch(function(err) {
    logger.error("pyodideInstance加载失败", err);
  });
}

const pyodideInstanceStore = usePyodideInstanceStore()
pyodideInstanceStore.initPyodide(window.PYODIDE_PATH || __PYODIDE_PATH__);
pyodideInstanceStore.$subscribe((mutation: any, state: any) => {
  if (state.pyodide !== null) {
    pyodideInstanceStoreInit()
  }
})

const pyodideRunInstanceStore = usePyodideStdIORunInstanceStore();
const { pyodideStdInputFactory, pyodideStdOutputFactory, pyodideStdErrorFactory } = usePyodideStdIORunInstanceStore();
pyodideInstanceStore.pyodideStdInputFactory = pyodideStdInputFactory
pyodideInstanceStore.pyodideStdOutputFactory = pyodideStdOutputFactory
pyodideInstanceStore.pyodideStdErrorFactory = pyodideStdErrorFactory

const pyodideRuntimeRef = ref()
const pyodideRuntimeDrawerShow = ref(false)
const pyodideRuntimeActive = (place: DrawerPlacement) => {
  if (pyodideInstanceStore.pyodide !== null) {
    pyodideRuntimeDrawerShow.value = true
    runtimePlacementRef.value = place
  } else {
    message.warning(`pyodide 正在加载`);
  }
}
const pyodidePreProg = ref("");
const pyodideRuntimeMounted = (e: any) => {
  logger.info("pyodide运行时已经加载完成");
  // 添加Input
  fetch('case/pyodide-std-input.txt').then(function(response) {
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    return response.text();
  }).then(function(data) {
    caseLoader["pyodide-std-input"](data)
  }).catch(function(err) {
    logger.error("加载pyodide-标准输入出现异常", err);
  });
  // 添加 pyodide 预处理的代码
  fetch('case/pyodide-pre-prog.txt').then(function(response) {
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    return response.text();
  }).then(function(data) {
    caseLoader["pyodide-pre-prog"](data)
  }).catch(function(err) {
    logger.error("加载pyodide-预处理程序出现异常", err);
  });
  emit('pyodide-runtime-mounted', e);
}
// 加载器
let caseIntroduction: string = "";
const caseLoader = {
  "blockly-toolbox-json": (text: string) => {
    blocklyEditorRef.value?.loadToolbox(JSON.parse(text));
  },
  "blockly-workspace-json": (text: string) => {
    blocklyEditorRef?.value?.loadWorkspaceState(JSON.parse(text));
  },
  "pyodide-std-input" : (text: string) => {
    pyodideRunInstanceStore.stdInputValueList = text.split('\n');
  },
  "pyodide-pre-prog": (text: string) => {
    pyodidePreProg.value = text;
  },
  "pyodide-package-json": (text: string) => {
    for(const item of JSON.parse(text)) {
      const {name, channel} = item;
      if (channel == "default channel") {
        pyodideInstanceStore.installPackage(name)
      } else {
        pyodideInstanceStore.installPackage(channel)
      }
    }
  },
  "case-introduction": (text: string) => {
    caseIntroduction = text;
  },
};
// 编辑按钮
const message = useMessage()
const editOptions = [{
    label: '下载项目文件',
    key: 'saveProject'
  },
  {
    label: '上传项目文件',
    key: 'loadProject'
  },{
    label: '清除工作区',
    key: 'clearWorkspace',
  },
  {
    label: '加载Dom格式的工作区文件',
    key: 'loadWorkspaceDom'
  },
  {
    label: '加载Json格式的工作区文件',
    key: 'loadWorkspaceJson'
  },
  {
    label: '下载Json格式的工作区文件',
    key: 'saveWorkspaceJson'
  },
]
const editOptionsSelect = (key: string | number) => {
  if (key === 'clearWorkspace') {
    blocklyEditorRef?.value?.clearWorkspace()
  } else if (key == 'loadWorkspaceDom') {
    loadFile2Text((text: string) => {
      blocklyEditorRef?.value?.loadWorkspaceDom(text)
    })
  } else if (key === 'saveProject') {
    const caseManagement = new CaseManagement();
    caseManagement.save({
      blockly_workspace_json: blocklyEditorRef?.value?.saveWorkspaceState(),
      pyodide_package_json: pyodideInstanceStore.getLoadedPackages(),
      pyodide_std_input: pyodideRunInstanceStore.stdInputValueList.join('\n'),
    }, 'blockly-python-project.zip');
  } else if (key === 'loadProject') {
    loadFile((content: string | ArrayBuffer) => {
      const caseManagement = new CaseManagement();
      caseManagement.loadCase(content as any, caseLoader);
    });
  } else if(key === 'saveWorkspaceJson') {
    if (blocklyEditorRef.value?.hasOwnProperty("saveWorkspaceState")) {
      const text = JSON.stringify(blocklyEditorRef?.value?.saveWorkspaceState())
      saveText2File(text, 'workspace.json')
    } else {
      message.error("没有加载完成")
    }
  } else if(key == 'loadWorkspaceJson') {
    if (blocklyEditorRef.value?.hasOwnProperty("loadWorkspaceState")) {
      loadFile2Text((text: string) => {
        blocklyEditorRef?.value?.loadWorkspaceState(JSON.parse(text) )
      })
    }
  }
}
const dialog = useDialog();
const caseButton = () => {
  dialog.success({
    title: '成功',
    content: caseIntroduction,
    positiveText: 'OK',
  })
}
onMounted(()=>{
  if (blocklyEditorRef.value === undefined) {
    throw new Error("Blockly编辑器加载失败");
  }
  const initManagement = new InitManagement();
  initManagement.loadCase(caseLoader);
})
</script>

<style scoped>
/*可移动栅栏*/

/* .resizable-container {
  display: flex;
  align-items: stretch;
}

.resizable-panel {
  flex-grow: 1;
  overflow: hidden;
}

.resizer {
  cursor: ew-resize;
  background: #ccc;
  width: 8px;
  height: 100%;
} */
/* //可移动栅栏 */
.header-container {
  height: 40px;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.button-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.button-container {
  display: flex;
  justify-content: space-between;
  flex: 1;
}

.icon-style {
  width: 24px;
  height: 24px;
  color: rgb(38, 101, 183);
}

.button-style {
  height: 25px;
}

.text-center-group {
  height: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.exit-button {
  margin-right: 50px;
}
</style>
