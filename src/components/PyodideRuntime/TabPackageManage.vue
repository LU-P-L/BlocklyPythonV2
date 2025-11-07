<template>
  <n-spin :show="packageInstallState">
    <n-input-group>
      <n-input
        v-model:value="packageInstallName"
        placeholder="安装一个新包"
        clearable
        autosize
        :style="{ width: '15%' }"
      />
      <n-button type="primary" ghost @click="packageInstallFunc">安装</n-button>
      <n-button type="primary" ghost @click="setPackageList">刷新</n-button>
    </n-input-group>
    <n-data-table
      :columns="[
        {
          title: '包名',
          key: 'name'
        },
        {
          title: '安装通道',
          key: 'channel'
        }
      ]"
      :data="packageList"
      :bordered="false"
    />
  </n-spin>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { NButton, NDataTable, NInput, NSpin, NInputGroup, useMessage } from "naive-ui";
import { log4TSProvider } from "@/components/Utils/Logger";
import { usePyodideInstanceStore } from './PyodideInstance';

const logger = log4TSProvider.getLogger("PyodideRuntime.TabPackageManage")
const pyodideInstanceStore = usePyodideInstanceStore()

// 用于获取按照包的信息
type Package = { name: string, channel: string }
const packageList = ref<Package[]>([])
const setPackageList = () => {
  packageList.value = pyodideInstanceStore.getLoadedPackages()
}
onMounted(() => setPackageList())
// 安装包
const packageInstallName = ref<string>('');
const packageInstallState = ref(false)
const message = useMessage()
const packageInstallFunc = () => {
  const package_name = packageInstallName.value;
  if (!package_name) {
    message.warning("必须输入需要安装的包名")
    return
  }
  packageInstallState.value = true
  const res = pyodideInstanceStore.installPackage(package_name)
  if (!res) {
    message.warning(`pyodide-runtime尚未初始化, 请等待初始化完成`)
    packageInstallState.value = false
    return
  }
  res.then(
    ()=>{
      setPackageList();
      if (packageList.value.filter(({name, channel}) => name === package_name || channel === package_name).length>0) {
        message.success(`成功安装${package_name}`);
      } else {
        throw Error("无法安装")
      }
    }
  ).catch(
    (err: any)=>{
      message.error(`无法安装${package_name}这个库，检查是否在支持列表中，或者联系ChrisJaunes/LiYue`);
      logger.error(`无法安装${package_name}这个库，检查是否在支持列表中，或者联系ChrisJaunes/LiYue`, err);
    }
  ).finally(
    () => {packageInstallState.value=false}
  )
}
</script>

<style scoped lang="scss">

</style>