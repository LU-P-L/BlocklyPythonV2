<template>
  <n-layout-footer style="height: 64px; padding: 24px; text-align: center" id="blockly-python-copy-right" bordered>
    © All rights Reserved | Designed by Li Yue ChrisJaunes wxp0502
  </n-layout-footer>
</template>

<script lang="ts">
import {NLayoutFooter} from "naive-ui";
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CopyRightFooter',
  components: {
    NLayoutFooter
  },
  setup() {
    return {}
  }
})
</script>

<style scoped lang="scss">

</style>