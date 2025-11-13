import * as Blockly from 'blockly'
import { pythonGenerator } from 'blockly/python'

Blockly.Blocks['tf_sample_model_cars_v2'] = {
  init: function () {
    this.setPreviousStatement(true, null)
    this.setNextStatement(true, null)
    this.setColour('#7FB6FF')
    this.appendDummyInput('dummyInput').appendField('马力和每加仑英里数拟合v2', 'load_state_tips')
    // showCarsData();
  }
}

async function getData() {
  const carsDataResponse = await fetch(
    'https://storage.googleapis.com/tfjs-tutorials/carsData.json'
  )
  const carsData = await carsDataResponse.json()
  const cleaned = carsData
    .map((car) => ({
      mpg: car.Miles_per_Gallon,
      horsepower: car.Horsepower
    }))
    .filter((car) => car.mpg != null && car.horsepower != null)

  return cleaned
}

/**
 * Convert the input data to tensors that we can use for machine
 * learning. We will also do the important best practices of _shuffling_
 * the data and _normalizing_ the data
 * MPG on the y-axis.
 */
function convertToTensor(data) {
  // Wrapping these calculations in a tidy will dispose any
  // intermediate tensors.
  // console.log("--convertToTensor 1 --");
  return tf.tidy(() => {
    // Step 1. Shuffle the data
    tf.util.shuffle(data)
    // console.log("--convertToTensor 2 --");
    // Step 2. Convert data to Tensor
    console.log(data)
    const inputs = data.map((d) => d.horsepower)
    const labels = data.map((d) => d.mpg)
    // console.log("--convertToTensor 3 --");
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

pythonGenerator.forBlock['tf_sample_model_cars_v2'] = function (block) {
  // pythonGenerator.definitions_["js_blockly_tensorflow"] = "from js import blockly_tensorflow";
  window.blockly_tensorflow = window.blockly_tensorflow || {}
  window.blockly_tensorflow.carsData = getData()
  window.blockly_tensorflow.tensorData = {}

  window.blockly_tensorflow.showCarsData = async function () {
    window.blockly_tensorflow.carsData = await getData()
    console.log('showCarsData')
    let values = window.blockly_tensorflow.carsData.map((d) => ({
      x: d.horsepower,
      y: d.mpg
    }))
    tfvis.render.scatterplot(
      { name: 'Horsepower v MPG' },
      { values },
      {
        xLabel: 'Horsepower',
        yLabel: 'MPG',
        height: 300
      }
    )
  }

  window.blockly_tensorflow.creatCarsModel = function () {
    console.log('creatCarsModel')
    // Create a sequential model
    const model = tf.sequential()
    // Add a single input layer
    model.add(tf.layers.dense({ inputShape: [1], units: 1, useBias: true }))
    // Add an output layer
    model.add(tf.layers.dense({ units: 1, useBias: true }))
    return model
  }

  window.blockly_tensorflow.show_model_summary = async function (model) {
    await window.tfvis.show.modelSummary({ name: 'Model Summary' }, model)
  }

  window.blockly_tensorflow.trainCarsModel = async function (model) {
    console.log('-----1-----')
    const tensorData = convertToTensor(window.blockly_tensorflow.carsData)
    const { inputs, labels } = tensorData
    console.log('-----2-----')
    // Prepare the model for training.
    model.compile({
      optimizer: tf.train.adam(),
      loss: tf.losses.meanSquaredError,
      metrics: ['mse']
    })
    console.log('-----3-----')
    const batchSize = 32
    const epochs = 50
    console.log('-----4-----')
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

  window.blockly_tensorflow.testCarsModel = async function (model) {}

  return `from js import tf, tfvis
from js import blockly_tensorflow
from pyodide.ffi import to_js
blockly_tensorflow.showCarsData()

model = tf.sequential()

model.add(tf.layers.dense(
    inputShape=to_js([1]),
    units=1,
    useBias=True
))

model.add(tf.layers.dense(
    units=1,
    useBias=True
))

blockly_tensorflow.show_model_summary(model)
blockly_tensorflow.trainCarsModel(model)
`
}
