import * as Blockly from 'blockly'
import { pythonGenerator } from 'blockly/python'
import carsData from './carsData.json'
;(window as any).blockly_tensorflow = (window as any).blockly_tensorflow || {}
;(window as any).blockly_dataset = (window as any).blockly_dataset || {}
;(window as any).carsModel = (window as any).carsModel || {}
;(window as any).blockly_dataset.uploadData = (window as any).blockly_dataset.uploadData || {}

const CARS_COLOR = '#46546a'

const INTRODUCE_ICON =
  'data:image/svg+xml;base64,PHN2ZyB0PSIxNjQwMTUzMjIxMzA3IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjIwNzMiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cGF0aCBkPSJNNjQzLjYwMyA1NzQuNTQySDI4Mi41MzRjLTYuNTc1IDAtMTEuODc1IDguOTIzLTExLjg3NSAxOS44NzUgMCAxMC45NiA1LjMgMTkuODEzIDExLjg3NSAxOS44MTNoMzYxLjA2OWM2LjU2IDAgMTEuODY0LTguODUyIDExLjg2NC0xOS44MTMgMC0xMC45NjItNS4zMDUtMTkuODc1LTExLjg2NC0xOS44NzV6IG0wIDBNNjQzLjYwMyA0ODIuOTE3SDI4Mi41MzRjLTYuNTc1IDAtMTEuODc1IDguODg3LTExLjg3NSAxOS44ODIgMCAxMC45NTcgNS4zIDE5LjgxNCAxMS44NzUgMTkuODE0aDM2MS4wNjljNi41NiAwIDExLjg2NC04Ljg1OCAxMS44NjQtMTkuODE0IDAtMTAuOTk1LTUuMzA1LTE5Ljg4Mi0xMS44NjQtMTkuODgyeiBtMCAwTTY0My42MDMgMzkxLjM1NEgyODIuNTM0Yy02LjU3NSAwLTExLjg3NSA4Ljg2Mi0xMS44NzUgMTkuODIzIDAgMTAuOTU2IDUuMyAxOS44NDkgMTEuODc1IDE5Ljg0OWgzNjEuMDY5YzYuNTYgMCAxMS44NjQtOC44OTMgMTEuODY0LTE5Ljg1IDAtMTAuOTYtNS4zMDUtMTkuODIyLTExLjg2NC0xOS44MjJ6IG0wIDAiIHAtaWQ9IjIwNzQiPjwvcGF0aD48cGF0aCBkPSJNOTAwLjE1OCAxNzhjMC02Mi4zMDgtNTAuNjE0LTExMy4wMTctMTEyLjgyOS0xMTMuMDE3SDIzNC4yMDJjLTAuMjU4IDAtMC40ODMgMC4wMzktMC43NjQgMC4wNTUtMC4yNjMtMC4wMTYtMC41MDgtMC4wNTUtMC43NzEtMC4wNTUtNjAuNTcgMC0xMDkuODU2IDUwLjcwOS0xMDkuODU2IDExMy4wMTd2NjYwLjcwOWMwIDguMzI4IDMuMjY0IDE2LjI2IDkuMDg1IDIyLjAwM2w4OS43NTIgODkuMDU2YzExLjUxIDExLjM5OCAyOS43MTggMTEuMzk4IDQxLjIyNiAwbDkxLjU2NS05MC44NSA5NC45OTggOTQuMjQzYzExLjUxMiAxMS40NDggMjkuNzM2IDExLjQ0OCA0MS4yNDcgMGw5NS4wMDQtOTQuMjQ0IDk1LjAxMiA5NC4yNDRjNS43NTQgNS43MSAxMy4xOTEgOC41OCAyMC41OTggOC41OCA3LjQyOSAwIDE0Ljg3OS0yLjg3IDIwLjYzMy04LjU4bDg2LTg1LjMwOGM1LjgwNi01Ljc3OCA5LjA4My0xMy43MDYgOS4wODMtMjEuOTk4VjI4Ni45NmM0Ny44NDUtMTMuMTM4IDgzLjE0NC01Ni45NjMgODMuMTQ0LTEwOC45NjF6IG0tMTkzLjMgNzE5LjkzM2wtOTcuMzAzLTk2LjUzOWMtMTEuNzY2LTExLjcwNi0zMC40MS0xMS43MDYtNDIuMiAwbC05Ny4yOCA5Ni41MzktOTcuMjkzLTk2LjUzOWMtMTEuNzg4LTExLjcwNi0zMC40MzEtMTEuNzA2LTQyLjIyMyAwbC05My43NjUgOTMuMDEtNjEuNTA2LTYxVjE3MC4wODdjMC0yOS4zMzEgMjMuMTg0LTUzLjE4IDUxLjY4LTUzLjE4IDAuMjU2IDAgMC40ODQtMC4wNzYgMC43MTgtMC4wNzYgMC4zMDQgMCAwLjU3NiAwLjA3NyAwLjg1NyAwLjA3N2gwLjEwNmMzMC4xMyAwLjA2NyA1NC42MTYgMjMuOTA0IDU0LjYxNiA1My4xNzkgMCAyOS4zMjMtMjQuNTQxIDUzLjE5My01NC43MjIgNTMuMTkzLTE2LjgwNCAwLTMwLjM5NCAxMy45OC0zMC4zOTQgMzEuMjU0IDAgMTcuMjk1IDEzLjU5IDMxLjMxNCAzMC4zOTQgMzEuMzE0aDUzNnY1NTQuODI5bC01Ny42ODYgNTcuMjU1eiBtNjcuOTg0LTY2MS45NjlsLTQ3My40NzctMy4wMjhjMjguODM0LTE0LjEzNCAyOC44NTQtNDIuNTQgMjguODM0LTUxLjA4MS0wLjA3My0zMS44ODQtNC45MS00NS45ODQtMTMuMDQtNjEuNjk4bDQ3NC4wMjYtMC43OThjMjkuNzQgMCA2MC43NjUgMzEuMTg3IDYwLjc2NSA2MC4wODUgMCAyOC44OS0zMS40IDU1LjA0NC02MS4xMzggNTUuMDQ0bC0xNS45NyAxLjQ3NnogbTAgMCIgcC1pZD0iMjA3NSI+PC9wYXRoPjwvc3ZnPg=='
const INTRODUCE_MESSAGE = document.createElement('div')
INTRODUCE_MESSAGE.style.cssText = `
overflow: scroll;
`
INTRODUCE_MESSAGE.innerHTML = `
<h1> [计小白小课堂] </h1>
<hr>
<p>
const model = tf.sequential();<br>
这样会实例化 tf.Model 对象。此模型是 sequential，因为其输入直接向下流至其输出。其他类型的模型可以有分支，甚至可以有多个输入和输出，但在许多情况下，模型将是贯序的。贯序模型还更易于使用API。<br>
<br>
model.add(tf.layers.dense({inputShape: [1], units: 1, useBias: true}));<br>
此操作会向我们的网络添加输入层，从而自动连接到包含一个隐藏单元的 dense 层。 dense 是一种层，可将输入与矩阵（称为“权重”）相乘，并向结果添加一个数字（称为“偏差”）。由于这是网络的第一层，因此我们需要定义 inputShape。inputShape 是 [1]，因为我们将 1 数字用作输入（某辆指定汽车的马力）。
<br>
units 用于设置权重矩阵在层中的大小。将其设置为 1 即表示数据的每个输入特征的权重为 1。<br>
<br>
model.add(tf.layers.dense({units: 1}));<br>
上述代码用于创建我们的输出层。我们将 units 设置为 1，因为我们想要输出数字 1。
<br>
</p>
`

export function addLinearRegressionBlocks(Blockly: any, pythonGenerator: any, workspaceSvg: any) {
  Blockly.Blocks['import_tf_module'] = {
    init: function () {
      this.setPreviousStatement(false, null)
      this.setNextStatement(true, null)
      this.setColour(CARS_COLOR)
      this.appendDummyInput('dummyInput').appendField('导入tf相关库')
    }
  }

  pythonGenerator.forBlock['import_tf_module'] = function () {
    ;(window as any).blockly_tensorflow = (window as any).blockly_tensorflow || {}
    return `from js import tf, tfvis
from js import blockly_tensorflow, blockly_dataset

from pyodide.ffi import to_js\n\n`
  }

  Blockly.Blocks['linear_regression_get_data'] = {
    init: function () {
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(CARS_COLOR)
      this.appendDummyInput('dummyInput').appendField('获取马力-每加仑英里数的数据')
    }
  }

  pythonGenerator.forBlock['linear_regression_get_data'] = function () {
    // (window as any).blockly_tensorflow.carsData = getData();
    ;(window as any).blockly_dataset.getCarsData = function () {
      const cleaned = carsData
        .map((car) => ({
          mpg: car.Miles_per_Gallon,
          horsepower: car.Horsepower
        }))
        .filter((car) => car.mpg != null && car.horsepower != null)
      console.log('-----------cleaned-------------\n')
      console.log(typeof cleaned)
      console.log(cleaned)
      return cleaned
    }
    return 'carsData = blockly_dataset.getCarsData()\n\n'
  }

  Blockly.Blocks["linear_regression_upload_data"] = {
    init: function () {
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(CARS_COLOR);
        this.appendDummyInput("dummyInput")
            .appendField("点击上传线性拟合数据")
            .appendField(
                new Blockly.FieldImage(INTRODUCE_ICON, 20, 20, "上下文管理器的介绍", async function() {
                    let input = document.createElement("input");
                    input.setAttribute("type", "file");
                    input.setAttribute("accept", ".json");
                    input.onchange = function () {
                        let file = input.files[0];
                        console.log(file, file.name);
                        const reader = new FileReader();
                        // 异步处理文件数据
                        reader.readAsText(file, 'UTF-8');
                        // 处理完成后立马触发 onload
                        reader.onload = fileReader => {
                            console.log("-----------fileReader.target.result-------------\n");
                            console.log(typeof fileReader.target?.result);
                            const jsonObj = JSON.parse(fileReader.target.result);
                            console.log(jsonObj);
                            window.blockly_dataset.uploadData = jsonObj;
                        };
                        console.log("-----------window.blockly_dataset.uploadData-------------\n");
                        console.log(typeof window.blockly_dataset.uploadData);
                        console.log(window.blockly_dataset.uploadData);
                    };
                    await input.click();
                }));
    }
};

pythonGenerator.forBlock["linear_regression_upload_data"] = function () {
    
    return 'carsData = blockly_dataset.uploadData\n\n';
};

  Blockly.Blocks['linear_regression_show_data'] = {
    init: function () {
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(CARS_COLOR)
      this.appendDummyInput('dummyInput').appendField(`展示数据的散点图`)
      // .appendField(
      //     new Blockly.FieldImage(INTRODUCE_ICON, 20, 20, "上下文管理器的介绍", async function() {
      //         CustomDialog.show("展示散点图", INTRODUCE_MESSAGE, {showOkay: true});
      //     }));
    }
  }

  pythonGenerator.forBlock['linear_regression_show_data'] = function () {
    ;(window as any).blockly_dataset.showCarsData = async function (data) {
      console.log('showCarsData')
      let xKey = Object.keys(data[0])[0],
        yKey = Object.keys(data[0])[1]
      console.log(xKey, yKey)
      let values = data.map((d) => ({
        x: d[xKey],
        y: d[yKey]
      }))
      tfvis.render.scatterplot(
        { name: `${xKey} v ${yKey}` },
        { values },
        {
          xLabel: xKey,
          yLabel: yKey,
          height: 300
        }
      )
    }
    return 'blockly_dataset.showCarsData(carsData)\n\n'
  }

  Blockly.Blocks['linear_regression_create_model'] = {
    init: function () {
      this.appendDummyInput().appendField('定义模型架构')
      // .appendField(
      //     new Blockly.FieldImage(INTRODUCE_ICON, 20, 20, "", async function() {
      //         CustomDialog.show("", INTRODUCE_MESSAGE, {showOkay: true});
      //     }));
      this.appendDummyInput()
      this.appendValueInput('input_units')
        .setCheck('Number')
        .appendField('         ')
        .appendField('输入层')
        .appendField(' units    =')
      this.appendValueInput('input_useBias')
        .setCheck(null)
        .appendField('                     ')
        .appendField(' useBias =')
      this.appendValueInput('hidden_units')
        .setCheck('Number')
        .appendField('         ')
        .appendField('输出层')
        .appendField('units     =')
      this.appendValueInput('hidden_useBias')
        .setCheck(null)
        .appendField('                     ')
        .appendField('useBias =')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(CARS_COLOR)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }
  
  pythonGenerator.forBlock['linear_regression_create_model'] = function (block: any) {
    let input_units = pythonGenerator.valueToCode(block,'input_units', pythonGenerator.ORDER_ATOMIC)
  let input_useBias = pythonGenerator.valueToCode(block,'input_useBias', pythonGenerator.ORDER_ATOMIC)
  let hidden_units = pythonGenerator.valueToCode(block,'hidden_units', pythonGenerator.ORDER_ATOMIC)
  let hidden_useBias = pythonGenerator.valueToCode(block,'hidden_useBias', pythonGenerator.ORDER_ATOMIC)
    return `carsModel = tf.sequential()
carsModel.add(tf.layers.dense(
    inputShape=to_js([1]),
 
  units=${input_units},
  useBias=${input_useBias},

))
carsModel.add(tf.layers.dense(
 
    units=${hidden_units},
  useBias=${hidden_useBias},
))\n\n`
  }

  Blockly.Blocks['linear_regression_model_summary'] = {
    init: function () {
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(CARS_COLOR)
      this.appendDummyInput('dummyInput').appendField('显示模型上各层的摘要')
    }
  }

  pythonGenerator.forBlock['linear_regression_model_summary'] = function () {
    ;(window as any).blockly_tensorflow.modelSummary = function (model) {
      ;(window as any).carsModel = model //
      tfvis.show.modelSummary({ name: 'Model Summary' }, model)
    }
    return 'blockly_tensorflow.modelSummary(carsModel)\n\n'
  }

  Blockly.Blocks['linear_regression_convert_to_tensor'] = {
    init: function () {
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(CARS_COLOR)
      this.appendDummyInput('dummyInput').appendField('将数据转换为张量')
      // .appendField(
      //     new Blockly.FieldImage(INTRODUCE_ICON, 20, 20, "处理数据", async function() {
      //         CustomDialog.show("", INTRODUCE_MESSAGE, {showOkay: true});
      //     }));
    }
  }

  pythonGenerator.forBlock['linear_regression_convert_to_tensor'] = function () {
    ;(window as any).blockly_tensorflow.convertToTensor = function (data) {
      return tf.tidy(() => {
        // Step 1. Shuffle the data
        tf.util.shuffle(data)

        let xKey = Object.keys(data[0])[0],
          yKey = Object.keys(data[0])[1]

        // Step 2. Convert data to Tensor
        const inputs = data.map((d) => d[xKey])
        const labels = data.map((d) => d[yKey])

        const inputTensor = tf.tensor2d(inputs, [inputs.length, 1])
        const labelTensor = tf.tensor2d(labels, [labels.length, 1])

        //Step 3. Normalize the data to the range 0 - 1 using min-max scaling
        const inputMax = inputTensor.max()
        const inputMin = inputTensor.min()
        const labelMax = labelTensor.max()
        const labelMin = labelTensor.min()

        const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin))
        const normalizedLabels = labelTensor.sub(labelMin).div(labelMax.sub(labelMin))

        return {
          inputs: normalizedInputs,
          labels: normalizedLabels,
          // Return the min/max bounds so we can use them later.
          inputMax,
          inputMin,
          labelMax,
          labelMin
        }
      })
    }
    return 'tensorData = blockly_tensorflow.convertToTensor(carsData)\n'
  }

  Blockly.Blocks['linear_regression_train_model'] = {
    init: function () {
      this.appendDummyInput().appendField('训练模型')
      // .appendField(
      //     new Blockly.FieldImage(INTRODUCE_ICON, 20, 20, "", async function() {
      //         CustomDialog.show("", INTRODUCE_MESSAGE, {showOkay: true});
      //     }));
      this.appendValueInput('batchSize').setCheck('Number').appendField('设置batchSize为')
      this.appendValueInput('epochs').setCheck('Number').appendField('设置epochs为')
      this.setInputsInline(false)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(CARS_COLOR)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  pythonGenerator.forBlock['linear_regression_train_model'] = function (block) {
    let batch_size = pythonGenerator.valueToCode(block, 'batchSize', pythonGenerator.ORDER_ATOMIC)
    let epochs = pythonGenerator.valueToCode(block, 'epochs', pythonGenerator.ORDER_ATOMIC)
    ;(window as any).blockly_tensorflow.trainModel = async function trainModel(
      model,
      tensorData,
      batchSize,
      epochs
    ) {
      const { inputs, labels } = tensorData
      model.compile({
        optimizer: tf.train.adam(),
        loss: tf.losses.meanSquaredError,
        metrics: ['mse']
      })

      return await model.fit(inputs, labels, {
        batchSize,
        epochs,
        shuffle: true,
        callbacks: tfvis.show.fitCallbacks({ name: 'Training Performance' }, ['loss', 'mse'], {
          height: 200,
          callbacks: ['onEpochEnd']
        })
      })
    }

    return `await blockly_tensorflow.trainModel(carsModel, tensorData, ${batch_size}, ${epochs})\n`
  }

  Blockly.Blocks['linear_regression_test_model'] = {
    init: function () {
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(CARS_COLOR)
      this.appendDummyInput('dummyInput').appendField('做出预测并显示')
    }
  }

  pythonGenerator.forBlock['linear_regression_test_model'] = function () {
    ;(window as any).blockly_tensorflow.testModel = function testModel(
      model,
      inputData,
      normalizationData
    ) {
      console.log('---------------------sleep begin ----------------\n')
      // await (window as any).blockly_tensorflow.trainModel(model, normalizationData, 32, 60);
      console.log('---------------------sleep end ----------------\n')
      const { inputMax, inputMin, labelMin, labelMax } = normalizationData

      // Generate predictions for a uniform range of numbers between 0 and 1;
      // We un-normalize the data by doing the inverse of the min-max scaling
      // that we did earlier.
      const [xs, preds] = tf.tidy(() => {
        const xs = tf.linspace(0, 1, 100)
        const preds = model.predict(xs.reshape([100, 1]))

        const unNormXs = xs.mul(inputMax.sub(inputMin)).add(inputMin)

        const unNormPreds = preds.mul(labelMax.sub(labelMin)).add(labelMin)

        // Un-normalize the data
        return [unNormXs.dataSync(), unNormPreds.dataSync()]
      })

      const predictedPoints = Array.from(xs).map((val, i) => {
        return { x: val, y: preds[i] }
      })

      let xKey = Object.keys(inputData[0])[0],
        yKey = Object.keys(inputData[0])[1]

      const originalPoints = inputData.map((d) => ({
        x: d[xKey],
        y: d[yKey]
      }))

      tfvis.render.scatterplot(
        { name: 'Model Predictions vs Original Data' },
        { values: [originalPoints, predictedPoints], series: ['original', 'predicted'] },
        {
          xLabel: xKey,
          yLabel: yKey,
          height: 300
        }
      )
    }

    return 'blockly_tensorflow.testModel(carsModel, carsData, tensorData)\n'
  }
}
