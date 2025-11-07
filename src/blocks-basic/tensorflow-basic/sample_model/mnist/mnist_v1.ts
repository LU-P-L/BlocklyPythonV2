import type * as TmpBlockly from 'blockly';
import { MnistData } from "./mnist_data";

declare global {
    interface Window {
        tf_exp: any;
        tf: any;
        tfvis: any;
    }
}

export function addTFExampleMnistV1(blocks: typeof TmpBlockly.Blocks, pythonGenerator: TmpBlockly.Generator, Blockly: typeof TmpBlockly, content: any) {
    window.tf_exp = window.tf_exp || {};
    window.tf_exp.mnist_data = window.tf_exp.mnist_data || new MnistData();
    window.tf_exp.mnist_v1_create_model = function() {
        const tf: any = window.tf;
        const model = tf.sequential();

        const IMAGE_WIDTH = 28;
        const IMAGE_HEIGHT = 28;
        const IMAGE_CHANNELS = 1;

        // In the first layer of our convolutional neural network we have
        // to specify the input shape. Then we specify some parameters for
        // the convolution operation that takes place in this layer.
        model.add(tf.layers.conv2d({
            inputShape: [IMAGE_WIDTH, IMAGE_HEIGHT, IMAGE_CHANNELS],
            kernelSize: 5,
            filters: 8,
            strides: 1,
            activation: 'relu',
            kernelInitializer: 'varianceScaling'
        }));

        // The MaxPooling layer acts as a sort of downsampling using max values
        // in a region instead of averaging.
        model.add(tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2]}));

        // Repeat another conv2d + maxPooling stack.
        // Note that we have more filters in the convolution.
        model.add(tf.layers.conv2d({
            kernelSize: 5,
            filters: 16,
            strides: 1,
            activation: 'relu',
            kernelInitializer: 'varianceScaling'
        }));
        model.add(tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2]}));

        // Now we flatten the output from the 2D filters into a 1D vector to prepare
        // it for input into our last layer. This is common practice when feeding
        // higher dimensional data to a final classification output layer.
        model.add(tf.layers.flatten());

        // Our last layer is a dense layer which has 10 output units, one for each
        // output class (i.e. 0, 1, 2, 3, 4, 5, 6, 7, 8, 9).
        const NUM_OUTPUT_CLASSES = 10;
        model.add(tf.layers.dense({
            units: NUM_OUTPUT_CLASSES,
            kernelInitializer: 'varianceScaling',
            activation: 'softmax'
        }));

        // Choose an optimizer, loss function and accuracy metric,
        // then compile and return the model
        const optimizer = tf.train.adam();
        model.compile({
            optimizer: optimizer,
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy'],
        });
        return model;
    }
    window.tf_exp.show_model_summary = function(model: any) {
        window.tfvis.show.modelSummary({name: 'Model Architecture', tab: 'Model'}, model);
    }
    window.tf_exp.mnist_v1_train = function(model: any, data: any) {
        const tf: any = window.tf;
        const tfvis: any = window.tfvis;

        console.log(model, data);
        const metrics = ['loss', 'val_loss', 'acc', 'val_acc'];
        const container = {
            name: 'Model Training', tab: 'Model', styles: { height: '1000px' }
        };
        const fitCallbacks = tfvis.show.fitCallbacks(container, metrics);

        console.log(fitCallbacks);
        const BATCH_SIZE = 512;
        const TRAIN_DATA_SIZE = 5500;
        const TEST_DATA_SIZE = 1000;

        const [trainXs, trainYs] = tf.tidy(() => {
            const d = data.nextTrainBatch(TRAIN_DATA_SIZE);
            return [
                d.xs.reshape([TRAIN_DATA_SIZE, 28, 28, 1]),
                d.labels
            ];
        });

        const [testXs, testYs] = tf.tidy(() => {
            const d = data.nextTestBatch(TEST_DATA_SIZE);
            return [
                d.xs.reshape([TEST_DATA_SIZE, 28, 28, 1]),
                d.labels
            ];
        });
        let res = model.fit(trainXs, trainYs, {
            batchSize: BATCH_SIZE,
            validationData: [testXs, testYs],
            epochs: 10,
            shuffle: true,
            callbacks: fitCallbacks
        });
        return res;
    }

    blocks["tf_example_mnist_v1"] = {
        init: function() {
            this.appendDummyInput()
                .appendField("手写体识别 V1, 仅可以通过 pyodide 执行");
            this.setInputsInline(true);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour("#7FB6FF");
        }
    };
    pythonGenerator.forBlock["tf_example_mnist_v1"] = function(block: any) {
        return `from js import tf_exp
data = tf_exp.mnist_data
if not data.finish:
    await data.load()
model = tf_exp.mnist_v1_create_model()
tf_exp.show_model_summary(model)
await tf_exp.mnist_v1_train(model, data)
print("完成")
`;
    };
}
