import * as Blockly from 'blockly'
import { javascriptGenerator, Order } from 'blockly/javascript'

Blockly.defineBlocksWithJsonArray([{
    "type": "lstm_set_params",
    "tooltip": "",
    "helpUrl": "",
    "message0": "设置参数    取样数量 %1 取样步幅 %2 Epochs %3 examplesBatch %4 batch %5",
    "args0": [
        {
            "type": "input_value",
            "name": "sample_len",
            "align": "RIGHT",
            "check": "Number"
        },
        {
            "type": "input_value",
            "name": "sample_step",
            "align": "RIGHT",
            "check": "Number"
        },
        {
            "type": "input_value",
            "name": "epoch",
            "align": "RIGHT",
            "check": "Number"
        },
        {
            "type": "input_value",
            "name": "examples_batch",
            "align": "RIGHT",
            "check": "Number"
        },
        {
            "type": "input_value",
            "name": "batch",
            "align": "RIGHT",
            "check": "Number"
        }
    ],
    "nextStatement": null,
    "colour": 45
}
])

javascriptGenerator.forBlock['lstm_set_params'] = function (block, generator) {
    let ret = ''
    // 取样数量
    let connBlock = block.getInput('sample_len')?.connection?.targetBlock()
    ret += `const sampleLen = ${connBlock}\n`
    // 取样步幅
    connBlock = block.getInput('sample_step')?.connection?.targetBlock()
    ret += `const sampleStep = ${connBlock}\n`
    // numEpochs
    connBlock = block.getInput('epoch')?.connection?.targetBlock()
    ret += `const numEpochs = ${connBlock}\n`
    // examplesPerEpoch
    connBlock = block.getInput('examples_batch')?.connection?.targetBlock()
    ret += `const examplesPerEpoch = ${connBlock}\n`
    // batch
    connBlock = block.getInput('batch')?.connection?.targetBlock()
    ret += `const batchSize = ${connBlock}\n`

    return ret
}

Blockly.defineBlocksWithJsonArray([{
    "type": "lstm_set_train_dataset",
    "tooltip": "",
    "helpUrl": "",
    "message0": "（LSTM）选择训练数据集 %1",
    "args0": [
        {
            "type": "input_value",
            "name": "dataset"
        }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 45
}
])

javascriptGenerator.forBlock['lstm_set_train_dataset'] = function (block, generator) {
    let ret = 'const trainData = new CSVData()\n'
    const connBlock = block.getInput('dataset')?.connection?.targetBlock()
    if (connBlock?.type.includes('custom_dataset')) {
        const idx = generator.blockToCode(connBlock)
        ret += `await trainData.loadData(customDatasetList[${idx}], sampleLen, sampleStep)\n`
    }
    else {
        ret += generator.blockToCode(<any>connBlock)
        ret += 'await trainData.loadData(trainDatasetPath, 64, 10)\n'
    }
    return ret
}

Blockly.defineBlocksWithJsonArray([{
    "type": "lstm_set_test_dataset",
    "tooltip": "",
    "helpUrl": "",
    "message0": "（LSTM）选择测试数据集 %1",
    "args0": [
        {
            "type": "input_value",
            "name": "dataset"
        }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 45
}
])

javascriptGenerator.forBlock['lstm_set_test_dataset'] = function (block, generator) {
    let ret = 'const testData = new CSVData()\n'
    const connBlock = block.getInput('dataset')?.connection?.targetBlock()
    if (connBlock?.type.includes('custom_dataset')) {
        const idx = generator.blockToCode(connBlock)
        ret += `await testData.loadData(customDatasetList[${idx}], sampleLen, sampleStep)\n`
    }
    else {
        ret += generator.blockToCode(<any>connBlock)
        ret += 'await testData.loadData(testDatasetPath, 64, 10)\n'
    }
    return ret
}

Blockly.defineBlocksWithJsonArray([{
    "type": "lstm_create_model",
    "tooltip": "",
    "helpUrl": "",
    "message0": "（LSTM）定义模型 %1 损失函数 %2",
    "args0": [
        {
            "type": "input_statement",
            "name": "layers"
        },
        {
            "type": "input_statement",
            "name": "loss",
            "align": "RIGHT",
            "check": "String"
        }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 45
}])


javascriptGenerator.forBlock['lstm_create_model'] = function (block, generator) {
    let ret = `function createModel(sampleLen) {
    const model = tf.sequential()\n`
    let conn: any
    conn = block.getInput('layers').connection
    if (conn && conn.targetBlock()) {
        const connBlock = conn.targetBlock()
        ret += generator.blockToCode(connBlock)
    }
    // 损失函数
    let loss
    conn = block.getInput('loss').connection
    if (conn && conn.targetBlock()) {
        loss = generator.blockToCode(conn.targetBlock())
    }

    ret += `\tmodel.compile({
        optimizer: tf.train.adam(),
        loss: ${loss},
        metrics: ['mse', 'accuracy'],
      })\n`

    ret += `\treturn model\n}\n`
    ret += `model = createModel(sampleLen)\n`
    ret += `tfvis.show.modelSummary({name: 'Model Summary'}, model)\n`

    return ret
}

Blockly.defineBlocksWithJsonArray([{
    "type": "lstm_train_model",
    "tooltip": "",
    "helpUrl": "",
    "message0": "（LSTM）训练模型 %1",
    "args0": [
        {
            "type": "input_end_row",
            "name": "NAME"
        }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 45
}])

javascriptGenerator.forBlock['lstm_train_model'] = function (block, generator) {
    let ret: string = ''
    ret += `async function trainModel(model, trainData, numEpochs, examplesPerEpoch) {
    const metrics = ['loss', 'val_loss'];
    const container = {
      name: 'Model Training', tab: 'Model', styles: { height: '100%' }
    };
    const fitCallbacks = tfvis.show.fitCallbacks(container, metrics, {callbacks: ['onEpochEnd']});
    const opt = {
      batchSize,
      epochs: 1,
      validationSplit: 0.2,
      callbacks: fitCallbacks
    }
    for (let i = 0; i < numEpochs; ++i) {
        const [xs, ys] = trainData.nextDataEpoch(examplesPerEpoch);
        await model.fit(xs, ys, opt);
        xs.dispose();
        ys.dispose();
    }
  }\n`
    ret += `await trainModel(model, trainData, numEpochs, examplesPerEpoch, batchSize)\n`
    return ret
}

Blockly.defineBlocksWithJsonArray([{
    "type": "lstm_use_model",
    "tooltip": "",
    "helpUrl": "",
    "message0": "（LSTM）测试模型并展示结果 %1 输入生成数据的数量 %2",
    "args0": [
        {
            "type": "input_dummy",
            "name": "test_dataset"
        },
        {
            "type": "input_value",
            "name": "length",
            "align": "RIGHT",
            "check": "Number"
        }
    ],
    "previousStatement": null,
    "colour": 45
}])

javascriptGenerator.forBlock['lstm_use_model'] = function (block, generator) {
    let ret = ''
    const connBlock = block.getInput('length')?.connection?.targetBlock()
    ret += `const length = ${connBlock}\n`
    ret += `const generatedData = trainData.generateData(model, testData.getSampleLenDataSeries(), length)
const predictedResult = generatedData.map((item) => {
    return {data: item}
})
tool.saveAsCSV(predictedResult)\n`
    return ret
}