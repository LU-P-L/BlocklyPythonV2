const RNN_COLOR = '#1c6534'

class CharacterTable {
  /**
   * Constructor of CharacterTable.
   * @param chars A string that contains the characters that can appear
   *   in the input.
   */
  constructor(chars: any) {
    ;(this as any).chars = chars
    ;(this as any).charIndices = {}
    ;(this as any).indicesChar = {}
    ;(this as any).size = (this as any).chars.length
    for (let i = 0; i < (this as any).size; ++i) {
      const char = (this as any).chars[i]
      if ((this as any).charIndices[char] != null) {
        throw new Error(`Duplicate character "${char}"`)
      }
      ;(this as any).charIndices[(this as any).chars[i]] = i
      ;(this as any).indicesChar[i] = (this as any).chars[i]
    }
  }

  /**
   * Convert a string into a one-hot encoded tensor.
   *
   * @param str The input string.
   * @param numRows Number of rows of the output tensor.
   * @returns The one-hot encoded 2D tensor.
   * @throws If `str` contains any characters outside the `CharacterTable`"s
   *   vocabulary.
   */
  encode(str: any, numRows: any) {
    const buf = (window as any).tf.buffer([numRows, (this as any).size])
    for (let i = 0; i < str.length; ++i) {
      const char = str[i]
      if ((this as any).charIndices[char] == null) {
        throw new Error(`Unknown character: "${char}"`)
      }
      buf.set(1, i, (this as any).charIndices[char])
    }
    return buf.toTensor().as2D(numRows, (this as any).size)
  }

  encodeBatch(strings: any, numRows: any) {
    const numExamples = strings.length
    const buf = (window as any).tf.buffer([numExamples, numRows, (this as any).size])
    for (let n = 0; n < numExamples; ++n) {
      const str = strings[n]
      for (let i = 0; i < str.length; ++i) {
        const char = str[i]
        if ((this as any).charIndices[char] == null) {
          throw new Error(`Unknown character: "${char}"`)
        }
        buf.set(1, n, i, (this as any).charIndices[char])
      }
    }
    return buf.toTensor().as3D(numExamples, numRows, (this as any).size)
  }

  /**
   * Convert a 2D tensor into a string with the CharacterTable"s vocabulary.
   *
   * @param x Input 2D tensor.
   * @param calcArgmax Whether to perform `argMax` operation on `x` before
   *   indexing into the `CharacterTable`"s vocabulary.
   * @returns The decoded string.
   */
  decode(x: any, calcArgmax = true) {
    return (window as any).tf.tidy(() => {
      if (calcArgmax) {
        x = x.argMax(1)
      }
      const xData = x.dataSync()
      let output = ''
      for (let index of Array.from(xData)) {
        let tmp: any = index
        output += (this as any).indicesChar[tmp]
      }
      return output
    })
  }
}

export function addAdditionRnnBlocks(Blockly: any, pythonGenerator: any, workspaceSvg: any) {
  Blockly.Blocks['rnn_import_tf'] = {
    init: function () {
      ;(this as any).setPreviousStatement(false, null)
      ;(this as any).setNextStatement(true, null)
      ;(this as any).setColour(RNN_COLOR)
      ;(this as any).appendDummyInput('dummyInput').appendField('导入tf相关模块')
    }
  }

  pythonGenerator.forBlock['rnn_import_tf'] = function () {
    ;(window as any).blockly_tensorflow = (window as any).blockly_tensorflow || {}
    return `from js import tf, tfvis
from js import blockly_tensorflow, blockly_dataset
from pyodide.ffi import to_js\n\n`
  }

  Blockly.Blocks['rnn_get_data'] = {
    init: function () {
      ;(this as any).setPreviousStatement(true, null)
      ;(this as any).setNextStatement(true, null)
      ;(this as any).setColour(RNN_COLOR)
      ;(this as any).appendDummyInput('').appendField('生成加法式子数据')
    }
  }

  pythonGenerator.forBlock['rnn_get_data'] = function () {
    ;(window as any).blockly_tensorflow.generateData = function (
      digits = 2,
      numExamples = 5000,
      invert = false
    ) {
      const digitArray = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
      const arraySize = digitArray.length

      const output = []
      const maxLen = digits + 1 + digits

      const f = () => {
        let str = ''
        while (str.length < digits) {
          const index = Math.floor(Math.random() * arraySize)
          str += digitArray[index]
        }
        return Number.parseInt(str)
      }

      const seen = new Set()
      while (output.length < numExamples) {
        const a = f()
        const b = f()
        const sorted = b > a ? [a, b] : [b, a]
        const key = sorted[0] + '`' + sorted[1]
        if (seen.has(key)) {
          continue
        }
        seen.add(key)

        // Pad the data with spaces such that it is always maxLen.
        const q = `${a}+${b}`
        const query = q + ' '.repeat(maxLen - q.length)
        let ans = (a + b).toString()
        // Answer can be of maximum size `digits + 1`.
        ans += ' '.repeat(digits + 1 - ans.length)

        if (invert) {
          throw new Error('invert is not implemented yet')
        }
        output.push([query, ans])
      }
      return output
    }
    return `additionData = blockly_tensorflow.generateData()\n\n`
  }

  Blockly.Blocks['rnn_handle_data'] = {
    init: function () {
      ;(this as any).setPreviousStatement(true, null)
      ;(this as any).setNextStatement(true, null)
      ;(this as any).setColour(RNN_COLOR)
      ;(this as any).appendDummyInput('').appendField('处理加法式子数据')
    }
  }

  pythonGenerator.forBlock['rnn_handle_data'] = function () {
    ;(window as any).blockly_tensorflow.getCharTable = function () {
      const chars = '0123456789+ '
      return new CharacterTable(chars)
    }
    ;(window as any).blockly_tensorflow.convertDataToTensors = function (
      data: any,
      charTable: any,
      digits: any,
      invert: any
    ) {
      const maxLen = digits + 1 + digits
      const questions = data.map((datum: any[]) => datum[0])
      const answers = data.map((datum: any[]) => datum[1])
      return [charTable.encodeBatch(questions, maxLen), charTable.encodeBatch(answers, digits + 1)]
    }
    return `trainData = additionData[0:4500]
testData = additionData[4500:]
charTable = blockly_tensorflow.getCharTable()
trainTensor = blockly_tensorflow.convertDataToTensors(trainData, charTable, 2)
testTensor = blockly_tensorflow.convertDataToTensors(testData, charTable, 2)
    \n\n`
  }

  Blockly.Blocks['rnn_create_model'] = {
    init: function () {
      ;(this as any).appendDummyInput().appendField('创建模型')
      ;(this as any)
        .appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('选择核心层')
        .appendField(
          new Blockly.FieldDropdown([
            ['RNN', 'simpleRNN'],
            ['GRU', 'gru'],
            ['LSTM', 'lstm']
          ]),
          'coreLayer'
        )
      ;(this as any)
        .appendValueInput('units')
        .setCheck(null)
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('设置单元数为：')
      ;(this as any).setPreviousStatement(true, null)
      ;(this as any).setNextStatement(true, null)
      ;(this as any).setColour(RNN_COLOR)
      ;(this as any).setTooltip('')
      ;(this as any).setHelpUrl('')
    }
  }

  pythonGenerator.forBlock['rnn_create_model'] = function (block: any) {
    let dropdownCorelayer = block.getFieldValue('coreLayer')
    let valueUnits = pythonGenerator.valueToCode(block, 'units', pythonGenerator.ORDER_ATOMIC)
    return `model = tf.sequential()
model.add(tf.layers.${dropdownCorelayer}(
    units=${valueUnits},
    recurrentInitializer="glorotNormal",
    inputShape=to_js([5, 12])
));
model.add(tf.layers.repeatVector(n=3));
model.add(tf.layers.${dropdownCorelayer}(
    units=${valueUnits},
    recurrentInitializer="glorotNormal",
    returnSequences=True
));
model.add(tf.layers.timeDistributed(
    layer=tf.layers.dense(units=12)
));
model.add(tf.layers.activation(activation="softmax"));
model.compile(
    loss="categoricalCrossentropy",
    optimizer="adam",
    metrics=to_js(["accuracy"])
);
\n\n`
  }

  Blockly.Blocks['rnn_train_model'] = {
    init: function () {
      ;(this as any)
        .appendValueInput('epochs')
        .setCheck(null)
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('训练RNN模型')
        .appendField('设置迭代次数为：')
      ;(this as any)
        .appendValueInput('batchSize')
        .setCheck(null)
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('设置批大小为：')
      ;(this as any)
        .appendValueInput('testSampleNum')
        .setCheck(null)
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('设置测试数据大小：')
      ;(this as any).setPreviousStatement(true, null)
      ;(this as any).setNextStatement(true, null)
      ;(this as any).setColour(RNN_COLOR)
      ;(this as any).setTooltip('')
      ;(this as any).setHelpUrl('')
    }
  }

  pythonGenerator.forBlock['rnn_train_model'] = function (block: any) {
    let valueEpochs = pythonGenerator.valueToCode(block, 'epochs', pythonGenerator.ORDER_ATOMIC)
    let valueBatchsize = pythonGenerator.valueToCode(
      block,
      'batchSize',
      pythonGenerator.ORDER_ATOMIC
    )
    let valueTestsamplenum = pythonGenerator.valueToCode(
      block,
      'testSampleNum',
      pythonGenerator.ORDER_ATOMIC
    )
    let testXsForDisplay: any = null
    let textXsForDisplay: any = null
    ;(window as any).blockly_tensorflow.trainModel = async function (
      model: any,
      trainTensor: any,
      testTensor: any,
      testData: any,
      charTable: any,
      iterations: any,
      batchSize: any,
      numTestExamples: any
    ) {
      const lossValues: any = [[], []]
      const accuracyValues: any = [[], []]
      const trainXs = trainTensor[0]
      const trainYs = trainTensor[1]
      const testXs = testTensor[0]
      const testYs = testTensor[1]
      for (let i = 0; i < iterations; ++i) {
        const beginMs = performance.now()
        const history = await model.fit(trainXs, trainYs, {
          epochs: 1,
          batchSize,
          validationData: [testXs, testYs],
          yieldEvery: 'epoch'
        })

        const elapsedMs = performance.now() - beginMs
        const modelFitTime = elapsedMs / 1000

        const trainLoss = history.history['loss'][0]
        const trainAccuracy = history.history['acc'][0]
        const valLoss = history.history['val_loss'][0]
        const valAccuracy = history.history['val_acc'][0]

        lossValues[0].push({ x: i, y: trainLoss })
        lossValues[1].push({ x: i, y: valLoss })

        accuracyValues[0].push({ x: i, y: trainAccuracy })
        accuracyValues[1].push({ x: i, y: valAccuracy })

        /*****
                document.getElementById("trainStatus").textContent =
                    `Iteration ${i + 1} of ${iterations}: ` +
                    `Time per iteration: ${modelFitTime.toFixed(3)} (seconds)`;
                const lossContainer = document.getElementById("lossChart");
                */
        const surface = { name: 'Zoomed Line Chart', tab: 'Charts' }
        ;(window as any).tfvis.render.linechart(
          surface,
          { values: lossValues, series: ['train', 'validation'] },
          {
            width: 420,
            height: 300,
            xLabel: 'epoch',
            yLabel: 'loss'
          }
        )

        // const accuracyContainer = document.getElementById("accuracyChart");
        const surface2 = { name: 'shit Line Chart', tab: 'Charts' }
        ;(window as any).tfvis.render.linechart(
          surface2,
          { values: accuracyValues, series: ['train', 'validation'] },
          {
            width: 420,
            height: 300,
            xLabel: 'epoch',
            yLabel: 'accuracy'
          }
        )
        if (testXsForDisplay == null || testXsForDisplay.shape[0] !== numTestExamples) {
          if (textXsForDisplay) {
            textXsForDisplay.dispose()
          }
          testXsForDisplay = testXs.slice(
            [0, 0, 0],
            [numTestExamples, testXs.shape[1], testXs.shape[2]]
          )
        }

        const examples: any = []
        const isCorrect: any = []
        ;(window as any).tf.tidy(() => {
          const predictOut = model.predict(testXsForDisplay)
          for (let k = 0; k < numTestExamples; ++k) {
            const scores = predictOut
              .slice([k, 0, 0], [1, predictOut.shape[1], predictOut.shape[2]])
              .as2D(predictOut.shape[1], predictOut.shape[2])
            const decoded = charTable.decode(scores)
            examples.push(testData[k][0] + ' = ' + decoded)
            isCorrect.push(testData[k][1].trim() === decoded.trim())
          }
        })

        // const examplesDiv = document.getElementById("testExamples");

        const headers = ['计算式子', '结果']
        const values = []
        for (let i = 0; i < examples.length; ++i) {
          values.push([examples[i], isCorrect[i] ? '√' : 'x'])
        }
        // const values = [
        //     examples,
        //     isCorrect
        // ];

        const tableSurface = { name: '测试用例', tab: 'Charts' }
        ;(window as any).tfvis.render.table(tableSurface, { headers, values }, { fontSize: 15 })
      }
    }
    return `blockly_tensorflow.trainModel(model, trainTensor, testTensor, testData, charTable, ${valueEpochs}, ${valueBatchsize}, ${valueTestsamplenum})\n\n`
  }
}
