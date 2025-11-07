// 视图组件
import BasicView from '@/views/BasicView.vue'
import BasicAllView from '@/views/BasicAllView.vue'
import BlocklyWidget from '@/components/BlocklyEditor/index.vue'
import Copilot from '@/components/Copilot'
import CopyRightFooter from '@/components/CopyRightFooter/index.vue'
import JupyterRuntime from '@/components/JupyterRuntime/index.vue'
import LogoHeader from '@/components/LogoHeader/index.vue'
import MonacoEditorWidget from '@/components/MonacoEditor/index.vue'
import PyodideRuntime from '@/components/PyodideRuntime/index.vue'
import PyodideRuntimeTabTfvis from '@/components/PyodideRuntime/TabTfvisOutput.vue'
export {BasicView, BasicAllView, BlocklyWidget, Copilot, CopyRightFooter, JupyterRuntime, LogoHeader, MonacoEditorWidget, PyodideRuntime, PyodideRuntimeTabTfvis}
// 全局数据
import {usePyodideInstanceStore} from "@/components/PyodideRuntime/PyodideInstance";
export {usePyodideInstanceStore}
// 功能组件
import {CaseManagement} from '@/components/CaseManagement/CaseManagement'
import {CustomRenderer} from '@/components/BlocklyEditor/CustomRenderer'
import {loadFile, saveText2File, loadFile2Text, loadFile2Project} from '@/components/Utils/Tools'
import '@/assets/main.css'
export {CaseManagement, CustomRenderer, loadFile, saveText2File, loadFile2Text, loadFile2Project}
// 数据组件 - Blocks
import {addTensorflowBlocks, addTensorflowExampleBlocksV2} from "@/blocks-basic/tensorflow-basic/sample_model";
import {addTensorflowBasicBlocksV2} from "@/blocks-basic/tensorflow-basic";
import {addPythonPackageBlocksV2} from "@/blocks-basic/python-package";
import {addPythonBasicBlocks, addPythonBasicBlocksV2} from "@/blocks-basic/python-basic";
import type TmpBlockly from "blockly";

export function addDefaultBlocks(
    blocks: typeof TmpBlockly.Blocks,
    pythonGenerator: TmpBlockly.Generator,
    workspace: TmpBlockly.WorkspaceSvg,
    Blockly: typeof TmpBlockly,
    content: any
) {
    // 添加默认块 V1 接口
    addPythonBasicBlocks(Blockly, pythonGenerator, workspace)
    addTensorflowBlocks(Blockly, pythonGenerator, workspace)
    // 添加默认块 V2 接口
    addPythonBasicBlocksV2(blocks, pythonGenerator, Blockly, content)
    addTensorflowBasicBlocksV2(blocks, pythonGenerator, Blockly, content)
    addTensorflowExampleBlocksV2(blocks, pythonGenerator, Blockly, content)
    addPythonPackageBlocksV2(blocks, pythonGenerator, Blockly, content)
}
export function defaultPyodideTabs() {
    return [
        { name: 'matplotlib output', tab: '绘图输出', component: 'div', props: { id: 'pyodide-browser-gui-container', style: 'height: 1000px; width: 100%; overflow: scroll' } },
        { name: 'pygame output', tab: '动画输出', component: 'div', props: { style: 'height: 1000px; width: 100%; overflow: scroll', innerHTML: '<canvas id="canvas" style="margin: 0 auto; display: block;"></canvas>' } },
        { name: 'turtle output', tab: 'turtle输出', component: 'div', props: { style: 'height: 1000px; width: 100%; overflow: scroll', innerHTML: '<div id="browser_gui" style="margin: 0 auto; display: block;height: 1000px; width: 100%; overflow: scroll;"></div>' } },
        { name: 'tfvis output', tab: 'TF VIS输出', component: PyodideRuntimeTabTfvis, props: {} }
    ]
}

console.log(`blockly-python项目，UI-CORE-VERSION: ${__APP_VERSION__} \n ProjectManager: LiYue \nAuthor: ChrisJaunes、wxp0502、cindyismeaooo、starkingd(HuangGuoMing); `)