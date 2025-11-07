import {Order} from 'blockly/python';
import * as TmpBlockly from "blockly";

const IMAGE_SIZE = 784
const NUM_CLASSES = 10
const NUM_DATASET_ELEMENTS = 65000

const NUM_TRAIN_ELEMENTS = 55000
const NUM_TEST_ELEMENTS = NUM_DATASET_ELEMENTS - NUM_TRAIN_ELEMENTS
const MNIST_IMAGES_SPRITE_PATH = "data/mnist_data/mnist_images.png"
const MNIST_LABELS_PATH = "data/mnist_data/mnist_images.png"
const MNIST_COLOR = '#7d4136'


export class MnistData {
    public shuffledTrainIndex: number;
    public shuffledTestIndex: number;
    public finish: boolean;
    public trainIndices: any;
    public testIndices: any;

    public datasetImages: any;
    public trainImages: any;
    public testImages: any;
    public datasetLabels: any;
    public trainLabels: any;
    public testLabels: any;
    constructor() {
        this.shuffledTrainIndex = 0;
        this.shuffledTestIndex = 0;
        this.finish = false;
    }

    async load() {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx || !(ctx instanceof CanvasRenderingContext2D)) {
            throw new Error('Failed to get 2D context');
        }
        const imgRequest = new Promise<void>((resolve, reject) => {
            img.crossOrigin = '';
            img.onload = () => {
                img.width = img.naturalWidth;
                img.height = img.naturalHeight;

                const datasetBytesBuffer = new ArrayBuffer(NUM_DATASET_ELEMENTS * IMAGE_SIZE * 4);
                const chunkSize = 5000;
                canvas.width = img.width;
                canvas.height = chunkSize;

                for (let i = 0; i < NUM_DATASET_ELEMENTS / chunkSize; i++) {
                    const datasetBytesView = new Float32Array(
                        datasetBytesBuffer,
                        i * chunkSize * IMAGE_SIZE *  4,
                        chunkSize * IMAGE_SIZE
                    );
                    ctx.drawImage(
                        img, 0, i * chunkSize, img.width, chunkSize, 0, 0, img.width, chunkSize
                    );

                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

                    for (let j = 0; j < imageData.data.length / 4; j++) {
                        // All channels hold an equal value since the image is grayscale, so
                        // just read the red channel.
                        datasetBytesView[j] = imageData.data[j * 4] / 255;
                    }
                }
                this.datasetImages = new Float32Array(datasetBytesBuffer);

                resolve();
            };
            img.src = MNIST_IMAGES_SPRITE_PATH;
        });

        const labelsRequest = fetch(MNIST_LABELS_PATH);
        const [imgResponse, labelsResponse] = await Promise.all([imgRequest, labelsRequest]);

        this.datasetLabels = new Uint8Array(await labelsResponse.arrayBuffer());

        // Create shuffled indices into the train/test set for when we select a
        // random dataset element for training / validation.
        this.trainIndices = window.tf.util.createShuffledIndices(NUM_TRAIN_ELEMENTS);
        this.testIndices = window.tf.util.createShuffledIndices(NUM_TEST_ELEMENTS);

        // Slice the the images and labels into train and test sets.
        this.trainImages = this.datasetImages.slice(0, IMAGE_SIZE * NUM_TRAIN_ELEMENTS);
        this.testImages = this.datasetImages.slice(IMAGE_SIZE * NUM_TRAIN_ELEMENTS);
        this.trainLabels = this.datasetLabels.slice(0, NUM_CLASSES * NUM_TRAIN_ELEMENTS);
        this.testLabels = this.datasetLabels.slice(NUM_CLASSES * NUM_TRAIN_ELEMENTS);
        this.finish = true;
        console.log("MnistData.load finish!!!!!!!!!");
    }

    nextTrainBatch(batchSize: number) {
        return this.nextBatch(
            batchSize, [this.trainImages, this.trainLabels], () => {
                this.shuffledTrainIndex =
                    (this.shuffledTrainIndex + 1) % this.trainIndices.length;
                return this.trainIndices[this.shuffledTrainIndex];
            });
    }

    nextTestBatch(batchSize: number) {
        return this.nextBatch(batchSize, [this.testImages, this.testLabels], () => {
            this.shuffledTestIndex =
                (this.shuffledTestIndex + 1) % this.testIndices.length;
            return this.testIndices[this.shuffledTestIndex];
        });
    }

    nextBatch(batchSize: number, data: [any, any], index: any) {
        const batchImagesArray = new Float32Array(batchSize * IMAGE_SIZE);
        const batchLabelsArray = new Uint8Array(batchSize * NUM_CLASSES);

        for (let i = 0; i < batchSize; i++) {
            const idx = index();

            const image = data[0].slice(idx * IMAGE_SIZE, idx * IMAGE_SIZE + IMAGE_SIZE);
            batchImagesArray.set(image, i * IMAGE_SIZE);

            const label = data[1].slice(idx * NUM_CLASSES, idx * NUM_CLASSES + NUM_CLASSES);
            batchLabelsArray.set(label, i * NUM_CLASSES);
        }

        const xs = window.tf.tensor2d(batchImagesArray, [batchSize, IMAGE_SIZE]);
        const labels = window.tf.tensor2d(batchLabelsArray, [batchSize, NUM_CLASSES]);

        return {xs, labels};
    }
}

async function showMnistExamples(data: any) {
    console.log("showExamples Start!!!!!!!", data);
    let surface_name = `Input Data Examples ${Math.random().toFixed(5)}`;
    alert(`绘制中 请在TfVis输出中查看 ${surface_name}`);
    // Create a container in the visor
    const surface = window.tfvis.visor().surface({name: surface_name, tab: 'Input Data'});
    // Get the examples
    const examples = data.nextTestBatch(20);
    const numExamples = examples.xs.shape[0];

    // Create a canvas element to render each example
    for (let i = 0; i < numExamples; i++) {
        const imageTensor = window.tf.tidy(() => {
            // Reshape the image to 28x28 px
            return examples.xs.slice([i, 0], [1, examples.xs.shape[1]]).reshape([28, 28, 1]);
        });

        const canvas = document.createElement('canvas');
        canvas.width = 28;
        canvas.height = 28;
        await window.tf.browser.toPixels(imageTensor, canvas);
        surface.drawArea.appendChild(canvas);

        imageTensor.dispose();
    }
}
window.tf_exp = window.tf_exp || {};
window.tf_exp.mnist_data_show = showMnistExamples;

export function addTFDatasetMinistV2(blocks: typeof TmpBlockly.Blocks, pythonGenerator: TmpBlockly.Generator, Blockly: typeof TmpBlockly, content: any) {
    const FLUSH_ICON = "data:image/png;base64,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";
    const LOADER_ICON = "data:image/png;base64,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";
    const OK_ICON = "data:image/png;base64,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";
    const SHOW_ICON = "data:image/png;base64,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";
    const LOADER_STATE = {
        PENDING: 0,
        LOADING: 1,
        FAIL: 2,
        SUCCESSFUL: 3
    };
    window.tf_exp = window.tf_exp || {};
    window.tf_exp.mnist_data = window.tf_exp.mnist_data || new MnistData();
    const mnist_data = window.tf_exp.mnist_data;

    blocks["tf_dataset_mnist_data_loader"] = {
        init: function () {
            let that = this;

            this.setInputsInline(true);
            this.setOutput(true, null);
            this.initialized_ = true;
            this.setColour(MNIST_COLOR);
            this.load_state_icon = new Blockly.FieldImage(LOADER_ICON, 20, 20, "*", function () {
                if (that.load_state == LOADER_STATE.PENDING || that.load_state == LOADER_STATE.FAIL) {
                    that.get_data();
                } else if (that.load_state == LOADER_STATE.LOADING) {
                    alert("加载中, 请不要重复点击");
                } else if (that.load_state == LOADER_STATE.SUCCESSFUL) {
                    alert("加载完成, 请不要重复点击");
                }
            });
            this.show_data_icon = new Blockly.FieldImage(LOADER_ICON, 20, 20, "*", function () {
                if (that.load_state == LOADER_STATE.SUCCESSFUL) {
                    showMnistExamples(mnist_data).then(() => {
                    }, () => {
                        alert("error 请联系ChrisJaunes 或 LiYue");
                    });
                }
            });
            this.appendDummyInput("dummyInput")
                .appendField("手写体识别数据", "load_state_tips")
                .appendField(this.load_state_icon)
                .appendField("展示数据")
                .appendField(this.show_data_icon);
            this.load_state = mnist_data.finish ? LOADER_STATE.SUCCESSFUL : LOADER_STATE.PENDING;
            this.updateShape_();
        },
        get_data() {
            this.load_state = LOADER_STATE.LOADING;
            this.updateShape_();
            mnist_data.load().then(() => {
                this.load_state = LOADER_STATE.SUCCESSFUL;
                this.updateShape_();
            }, (err: any) => {
                this.load_state = LOADER_STATE.FAIL;
                console.log(err)
                this.updateShape_();
            });
        },
        updateShape_() {
            if (this.load_state == LOADER_STATE.PENDING) {
                this.setFieldValue("手写体识别数据(点击开始加载)", "load_state_tips");
                this.load_state_icon.doValueUpdate_(FLUSH_ICON);
                this.show_data_icon.doValueUpdate_(LOADER_ICON);
            } else if (this.load_state == LOADER_STATE.LOADING) {
                this.setFieldValue("手写体识别数据(加载中)", "load_state_tips");
                this.load_state_icon.doValueUpdate_(LOADER_ICON);
                this.show_data_icon.doValueUpdate_(LOADER_ICON);
            } else if (this.load_state == LOADER_STATE.FAIL) {
                this.setFieldValue("手写体识别数据(加载失败)", "load_state_tips");
                this.load_state_icon.doValueUpdate_(FLUSH_ICON);
                this.show_data_icon.doValueUpdate_(LOADER_ICON);
            } else if (this.load_state == LOADER_STATE.SUCCESSFUL) {
                this.setFieldValue("手写体识别数据(加载完成)", "load_state_tips");
                this.load_state_icon.doValueUpdate_(OK_ICON);
                this.show_data_icon.doValueUpdate_(SHOW_ICON);
            }
        }
    };
    pythonGenerator.forBlock["tf_dataset_mnist_data_loader"] = function (block) {
        (pythonGenerator as any).definitions_["js_tf_exp"] = "from js import tf_exp";
        return [`tf_exp.mnist_data`, Order.NONE];
        ;
    }

    blocks['tf_dataset_mnist_data_load'] = {
        init: function () {
            this.setPreviousStatement(true, null)
            this.setNextStatement(true, null)
            this.appendDummyInput('load')
                .appendField('加载数据')
                .appendField(new Blockly.FieldVariable("item"), "VAR")
            this.setColour(MNIST_COLOR);
        }
    }
    pythonGenerator.forBlock['tf_dataset_mnist_data_load'] = function (block: typeof TmpBlockly.Blocks) {
        const variable_name = pythonGenerator.getVariableName(block.getFieldValue('VAR'))

        return `
# 获取 手写体识别 的数据
if not ${variable_name}.finish:
    await ${variable_name}.load()
`
    }

}