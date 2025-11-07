import { fileURLToPath, URL } from 'node:url'

import {defineConfig, loadEnv, PluginOption, UserConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import { visualizer } from "rollup-plugin-visualizer";
// import { terser } from "rollup-plugin-terser";
import vitePluginBundleObfuscator from 'vite-plugin-bundle-obfuscator';

// import viteCompression from "vite-plugin-compression";

// import { terser } from "rollup-plugin-terser";
// https://vitejs.dev/config/
const __APP_VERSION__ = JSON.stringify('v1.1.0')

export const serve: UserConfig = {
  define: {
    __APP_VERSION__: __APP_VERSION__,
    __BLOCKLY_MEDIA_PATH__: JSON.stringify('assets/media'),
    __PYODIDE_PATH__: JSON.stringify('pyodide'),
  },
  publicDir: 'public/dev',
  plugins: [
    vue(),
    vueJsx(),
  ],
  base: '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    }
  },
  server: {
    proxy: {
      "/qwen-model-api": {
        target: "https://dashscope.aliyuncs.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/qwen-model-api/, ""),
      },
    },
  },
}
const lib_ui_path = 'src/views/blockly-python-v2-ui/blockly-python-lib';
const lib_ui: UserConfig = {
  ...serve,
  define: {
    __APP_VERSION__: __APP_VERSION__,
    __BLOCKLY_MEDIA_PATH__: undefined,
    __PYODIDE_PATH__: JSON.stringify('https://cdn.jsdelivr.net/pyodide/v0.26.1/full'),
  },
  plugins: [
    vue(),
    vueJsx(),
    dts({
      include: [
        // 'src/components/BlocklyEditor/**/*',
        // 'src/components/Copilot/**/*',
        // 'src/components/MonacoEditor/**/*',
        // 'src/components/PyodideRuntime/**/*',
        // 'src/components/JupyterRuntime/**/*',
        'src/views/BasicView.ts',
        'src/lib-ui.ts',
      ],
      outDir: lib_ui_path,
      tsconfigPath: './tsconfig.app.json',
      rollupTypes: true
    }),
    visualizer({
      gzipSize: true,
      brotliSize: true,
      emitFile: false,
      filename: "dist-dev/test.html",
      open:true,
    }) as PluginOption,
  ],
  build: {
    cssCodeSplit: false,
    // sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/lib-ui.ts'),
      name: 'blockly-python-ui-lib',
      fileName: (format) => `lib-ui.${format}.js`,
      formats: ['es'],
    },
    copyPublicDir: false,
    rollupOptions: {
      // plugins: [nodeResolve({dedupe: ['@tensorflow']})], /node_modules\/blockly/
      // plugins: [commonjs()],
      external: [
        'vue',
        'pinia',
        'naive-ui',
        '@tensorflow/tfjs',
        "@tensorflow/tfjs-vis",
        // /node_modules\/@tensorflow/,
      ], // 外部化 Vue 依赖
      output: {
        dir: lib_ui_path,
        entryFileNames: '[name].[format].js', // 默认入口文件路径
        chunkFileNames(chunkInfo: any) {
          // 根据chunk信息动态设置输出路径
          const name = chunkInfo.name;
          if (name === 'components') {
            return 'core/components-[hash].js';
          } else if (name === 'blocks-basic') {
            return 'core/blocks-basic-[hash].[format].js';
          } else if (name === 'blocks-basic') {
            return 'core/blocks-basic-[hash].[format].js';
          } else if (name == "monaco") {
            return 'core/monaco-[hash].[format].js';
          }
          return 'core/[name]-[hash].[format].js'; // 其他chunk文件路径
        },
        assetFileNames(chunkInfo: any) {
          const name = chunkInfo.name;
          if(name.includes("worker")) {
            console.log("build-assert", name);
            return 'core/[name]-[hash].[ext]';
          }
          if(name.includes("style")) {
            return "assets/style.css";
          }
          return 'assets/[name]-[hash].[ext]';
        },
        manualChunks(id: any){
          if (id.includes(resolve(__dirname, 'src/blocks'))) {
            return 'blocks-basic';
          }
          if (id.includes(resolve(__dirname, 'src/components'))) {
            return 'components';
          }
          const regex = /.*node_modules\/monaco-editor\/esm\/vs\/basic-languages.*/
          if (regex.test(id)) return 'components'
        },
        globals: {
          // vue: 'Vue',
          // pinia: 'Pinia',
          // 'naive-ui': 'naive-ui',
          'long': 'Long',
          '@tensorflow/tfjs': '_TF',
          "@tensorflow/tfjs-vis": "_TF_VIS"
        },
      }
    }
  }
}
const prod: UserConfig = {
  ...serve,
  publicDir: 'public/prod-basic',
  define: {
    __APP_VERSION__: __APP_VERSION__,
    __BLOCKLY_MEDIA_PATH__: JSON.stringify('assets/media'),
    __PYODIDE_PATH__: JSON.stringify('core/pyodide'),
  },
  plugins: [
    vue(),
    vueJsx(),
    vitePluginBundleObfuscator({
      options: {
        // your javascript-obfuscator options
        debugProtection: true,
      },
    }),
    // gzip 压缩
    // viteCompression({
    //   filter: (filename: string) => {
    //     return filename !== resolve(__dirname, 'dist/index.js') &&  filename !== resolve(__dirname, 'dist/blocks/blocks-custom.js')
    //   },
    //   deleteOriginFile: true, // 源文件压缩后是否删除,
    // }),
    // {
    //   name: 'html-transform',
    //   apply: 'build',
    //   enforce: 'post',
    //   transformIndexHtml(html) {
    //     return html.replace(/(<script\s+src="([^"]+\.js)"><\/script>|<link\s+rel="modulepreload"[^>]*href="([^"]+\.js)"[^>]*>)/g, (match, p1, p2, p3) => {
    //       const jsFile = p2 || p3; // 获取匹配到的 .js 文件路径
    //
    //       // 如果是 index.js 或者 /blocks/blocks-custom 目录下的 .js 文件，不替换
    //       if (jsFile.includes('index.js') || jsFile.includes('/blocks/blocks-custom')) {
    //         return match;
    //       }
    //       // 否则替换为 .js.gz
    //       return match.replace('.js', '.js.gz');
    //     });
    //   }
    // },
  // 可视化插件
    visualizer({
      gzipSize: true,
      brotliSize: true,
      emitFile: false,
      filename: "dist-dev/test.html",
      open:true,
    }) as PluginOption,
  ],
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        dir: 'dist',
        entryFileNames: '[name].js', // 默认入口文件路径
        chunkFileNames(chunkInfo: any) {
          // 根据chunk信息动态设置输出路径
          const name = chunkInfo.name;
          if (name === 'components') {
            return 'core/components.js';
          } else if (name === 'blocks-basic') {
            return 'core/blocks-basic.js';
          } else if (name === 'blocks/BlockLoader') {
            return 'blocks/BlockLoader.js';
          } else if (name === 'blocks/custom_blocks') {
            return 'blocks/custom_blocks.js';
          } else if (name == "monaco") {
            return 'core/monaco.js';
          }
          return 'core/[name]-[hash].js'; // 其他chunk文件路径
        },
        assetFileNames(chunkInfo: any) {
          const name = chunkInfo.name;
          if(name.includes("worker")) {
            console.log("build-assert", name);
            return 'core/[name].[ext]';
          }
          return 'assets/[name].[ext]';
        },
        manualChunks(id: any) {
          if (id.includes(resolve(__dirname, 'src/components'))) {
            return 'components'; // 将PyodideRuntime打包到指定文件
          }
          if (id.includes(resolve(__dirname, 'src/blocks/python-basic'))) {
            return 'blocks-basic';
          }
          if (id.includes(resolve(__dirname, 'src/blocks/tensorflow-basic'))) {
            return 'blocks-basic';
          }
          if (id.includes(resolve(__dirname, 'src/blocks/custom_blocks'))) {
            return 'blocks/custom_blocks';
          }
          const regex = /.*node_modules\/monaco-editor\/esm\/vs\/basic-languages.*/
          if (regex.test(id)) return 'components'
        }
      }
    }
  },
  worker: {
    format: 'es',
    rollupOptions: {
      output: {
        // assetFileNames: 'core/[name].[ext]',
        assetFileNames(chunkInfo: any) {
          console.log("worker-asset", chunkInfo)
          return 'core/[name].[ext]'
        },
        chunkFileNames(chunkInfo: any) {
          console.log("worker-chunk", chunkInfo)
          return 'core/[name].[ext]'
        },
        // manualChunks(id: any) {
        //   console.log("worker-manual", id)
        // }
      }
    }
  }
}
const prod_py: UserConfig = {
  ...prod,
  define: {
    __APP_VERSION__: __APP_VERSION__,
    __BLOCKLY_MEDIA_PATH__: JSON.stringify('assets/media'),
    __PYODIDE_PATH__: JSON.stringify('core/pyodide'),
  },
  publicDir: 'public/prod-basic',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    }
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        dir: 'dist',
        entryFileNames: '[name].js', // 默认入口文件路径
        chunkFileNames(chunkInfo: any) {
          // 根据chunk信息动态设置输出路径
          const name = chunkInfo.name;
          if (name === 'components') {
            return 'core/components.js';
          } else if (name === 'blocks-basic') {
            return 'blocks/blocks-basic.js';
          } else if (name === 'blocks-custom') {
            return 'blocks/blocks-custom.js';
          } else if (name === "monaco") {
            return 'core/monaco.js';
          } else if (name === "views") {
            return 'core/views.js'
          }
          return 'core/[name]-[hash].js'; // 其他chunk文件路径
        },
        assetFileNames(chunkInfo: any) {
          const name = chunkInfo.name;
          if(name.includes("worker")) {
            console.log("build-assert", name);
            return 'core/[name].[ext]';
          }
          return 'assets/[name].[ext]';
        },
        manualChunks(id: any) {
          if (id.includes(resolve(__dirname, 'src/components'))) {
            return 'components';
          }
          if (id.includes(resolve(__dirname, 'src/views'))) {
            return 'views';
          }
          if (id.includes(resolve(__dirname, 'src/blocks-basic'))) {
            return 'blocks-basic';
          }
          if (id.includes(resolve(__dirname, 'src/views/blockly-python-v2-ui/blocks-custom'))) {
            return 'blocks-custom';
          }
          const regex = /.*node_modules\/monaco-editor\/esm\/vs\/basic-languages.*/
          if (regex.test(id)) return 'components'
        }
      },
      plugins: [
        // terser({
        //   format: {
        //     comments: false, // 去除所有注释
        //   },
        // }),
      ],
    }
  },
}
const prod_tf: UserConfig = {
  ...prod,
  publicDir: 'public/prod-tf',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        dir: 'dist',
        entryFileNames: '[name].js', // 默认入口文件路径
        chunkFileNames(chunkInfo: any) {
          // 根据chunk信息动态设置输出路径
          const name = chunkInfo.name;
          if (name === 'components') {
            return 'core/components.js';
          } else if (name === 'blocks-basic') {
            return 'blocks/blocks-basic.js';
          } else if (name === 'blocks-custom') {
            return 'blocks/blocks-custom.js';
          } else if (name == "monaco") {
            return 'core/monaco.js';
          }
          return 'core/[name]-[hash].js'; // 其他chunk文件路径
        },
        assetFileNames(chunkInfo: any) {
          const name = chunkInfo.name;
          if(name.includes("worker")) {
            return 'core/[name].[ext]';
          }
          return 'assets/[name].[ext]';
        },
        manualChunks(id: any) {
          if (id.includes(resolve(__dirname, 'src/components'))) {
            return 'components';
          }
          if (id.includes(resolve(__dirname, 'src/blocks-basic/tensorflow-basic'))) {
            return 'blocks-basic';
          }
          if (id.includes(resolve(__dirname, 'src/views/blockly-python-v2-ui/blocks-custom'))) {
            return 'blocks-custom';
          }
          const regex = /.*node_modules\/monaco-editor\/esm\/vs\/basic-languages.*/
          if (regex.test(id)) return 'components'
        }
      }
    }
  }
}
export default defineConfig(({ command, mode}): UserConfig => {
  console.log(command, mode);
  if (command == 'serve') {
    // (prod_py["define"] ??= {})['process.env'] = loadEnv(mode, process.cwd())
    return serve
  }
  if (command == "build" && mode == "lib-ui") {
    // (prod_py["define"] ??= {})['process.env'] = loadEnv(mode, process.cwd())
    return lib_ui
  }
  if (command == "build" && mode == "prod-py") {
    // (prod_py["define"] ??= {})['process.env'] = loadEnv(mode, process.cwd())
    return prod_py
  }
  if (command == "build" && mode == "prod-tf") {
    // (prod_py["define"] ??= {})['process.env'] = loadEnv(mode, process.cwd())
    return prod_tf
  }
  return prod
})
