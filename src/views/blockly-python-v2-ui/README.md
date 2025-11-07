# blockly-python-v2-ui

项目说明

目录结构
```
-
|--blockly-python-lib // blockly-python-lib 依赖库， 该库由ChrisJaunes维护，请勿修改
    |-- assets // 资源文件
       |-- style.css // 资源文件
    |-- core 
    |-- lib-ui.es.d.ts 声明文件
    |-- lib-ui.es.js ui-lib 源文件
|-- blocks-custom // 自定义blocks
    |-- custom_blocks.ts
|-- public
    |-- case // 案例所需要的内容
    |-- pyodide // python执行代码库，目前是0.26.1
index.html // 访问入口
index.ts // index.html 访问入口
index.vue // 由index.ts调用
```

## 安装
```shell
npm install
```

## 启动
```shell
npm run dev
```

## 导出
```shell
npm run build-only
```