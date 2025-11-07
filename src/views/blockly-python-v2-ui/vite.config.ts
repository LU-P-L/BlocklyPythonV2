import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

const serve = {
  plugins: [
    vue(),
    vueJsx(),
  ],
  base: '/',
  resolve: {
    alias: {
    }
  },
}
const prod = {
  ...serve,
  plugins: [
    vue(),
    vueJsx(),
    // gzip 压缩
    // viteCompression({
    //   deleteOriginFile: true // 源文件压缩后是否删除
    // }),
    // // 可视化插件
    // visualizer({
    //   gzipSize: true,
    //   brotliSize: true,
    //   emitFile: false,
    //   filename: "dist-dev/test.html",
    //   open:true,
    // }) as PluginOption,
  ],
}
export default defineConfig(({ command, mode}) => {
  console.log(command, mode);
  if (command == 'serve') {
    return serve
  }
  return prod
})