# BlocklyPythonV2

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
    1) Run `Extensions: Show Built-in Extensions` from VSCode's command palette
    2) Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run End-to-End Tests with [Playwright](https://playwright.dev)

```sh
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
npm run build

# Runs the end-to-end tests
npm run test:e2e
# Runs the tests only on Chromium
npm run test:e2e -- --project=chromium
# Runs the tests of a specific file
npm run test:e2e -- tests/example.spec.ts
# Runs the tests in debug mode
npm run test:e2e -- --debug
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## 初始化配置
npm init vue@latest       

Vue.js - The Progressive JavaScript Framework

✔ Project name: … BlocklyPythonV2
✔ Package name: … blocklypythonv2
✔ Add TypeScript? … No / Yes
✔ Add JSX Support? … No / Yes
✔ Add Vue Router for Single Page Application development? … No / Yes
✔ Add Pinia for state management? … No / Yes
✔ Add Vitest for Unit Testing? … No / Yes
✔ Add an End-to-End Testing Solution? › Playwright
✔ Add ESLint for code quality? … No / Yes
✔ Add Prettier for code formatting? … No / Yes

Scaffolding project in /Users/judgehuang/github/blockly_teaching/BlocklyPythonV2...

Done. Now run:

  cd BlocklyPythonV2
  npm install
  npm run format
  npm run dev


Vite + Vue3 + Ts 解决打包生成的index.html页面 显示空白、报资源跨域、找不到资源、404-Page Not Found等错误
https://blog.csdn.net/muguli2008/article/details/122306515


vue3+vite+ts使用monaco-editor编辑器
https://blog.csdn.net/weixin_43909743/article/details/127633552
monaco-editor打包优化
https://juejin.cn/post/7133041161618325512


Jupyter Notebook 跨域连接 Kernel 的方法
https://blog.csdn.net/weixin_34270606/article/details/91905685


我有一个正在运行的jupyter，其服务地址是  http://localhost:8888
jupyter服务是使用
```
python -m jupyter notebook --no-browser --NotebookApp.allow_origin='http://localhost:5173' --NotebookApp.disable_check_xsrf=True --NotebookApp.allow_credentials=True
```
启动的

我编写了一个html页面，其地址是http://localhost:5173/， 
这个html页面中创建一个code的textarea，这个textarea可以用来编写python代码；
然后创建一个名为run的button，点击botton的时候，将code发到http://localhost:8888的jupyter执行，并且其返回结果使用jupyter的outputArea展示
我希望在独立的HTML页面（例如http://localhost:5173/）上运行此代码，因此我打算使用Jupyter的REST API，请求时我希望使用原生的JavaScript fetch()和WebSocket
通过访问http://localhost:8888/api/kernels可以创建一个新的Kernel
接着我使用WebSocket去连接ws://localhost:8888/api/kernels/${kernel.id}/channels
我应该如何实现

```shell
git subtree push -P BlocklyPythonV2/src/views/blockly-python-v2-ui git@github.com:ChrisJaunes/blockly-python-v2-ui.git main
```

## BlocklyEditor
### UI-Hook
以下内容对于UI开发暴露
setLocale: 设置语言
```typescript
import * as ZH from 'blockly/msg/zh-hans'
blocklyEditorRef.value.setLocale(ZH);
```
loadToolbox: 设置Toolbox
```typescript
const toolbox = {
    kind: 'categoryToolbox',
    contents: [
        {
            kind: 'category',
            name: 'Variables',
            custom: 'VARIABLE'
        }
    ]
}
blocklyEditorRef.value.loadToolbox(toolbox);
```
clearWorkspace: 清除工作区
```typescript
blocklyEditorRef?.value?.clearWorkspace()
```

## PyodideRuntime
### Hook
#### Pyodide Lib Path
在Pyodide加载前指定Lib的位置，不然会使用默认位置
```javascript
    window.PYODIDE_PATH = ''
```
#### PyodideRuntimeInitHook
在Pyodide加载后调用，可以在这里面对Pyodide进行一些初始化操作
例如：
```javascript
window.PyodideRuntimeInitHook = (context: any) => {
  console.log(context);
  context.pyodide.loadPackage("numpy")
}
```



# 版本更新日志

**20250319**
git subtree add --prefix=src/blocks-basic https://github.com/ChrisJaunes/blockly_teaching_blocks.git master --squash

git subtree push -P BlocklyPythonV2/src/views/blockly-python-v2-ui git@github.com:ChrisJaunes/blockly-python-v2-ui.git main


**20240720**
pygame version：https://github.com/pyodide/pyodide/issues/289

- pyodide 现在的目前更新到了0.26.1，如果使用本地的pyodide的同学，需要更新到最新的lib
  - pyodide 0.26.1 的开发：https://github.com/pyodide/pyodide/releases/tag/0.26.1
  - pyodide 支持的Packages列表： https://pyodide.org/en/0.26.1/usage/packages-in-pyodide.html