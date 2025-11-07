<template>
  <div style="display: flex; align-items: center">
    <n-avatar :size="40" :src="logoUrl"/>
    <n-text
        style="
            font-family: 'Fredoka One', cursive;
            font-style: italic;
            font-size: 20px;
            color: black;
            vertical-align: middle;
          "
    >
      计小白学编程
    </n-text>
  </div>
</template>
<script setup lang="ts">
import {NAvatar, NText} from "naive-ui";
import logoUrl from './jixiaobai.png'
</script>
<style scoped lang="scss">

</style>