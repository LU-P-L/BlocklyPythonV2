import type * as TmpBlockly from 'blockly';
import {Order} from 'blockly/python';

const MNIST_COLOR = '#7d4136'

export function addMnistBlocks(Blockly: typeof TmpBlockly, pythonGenerator: TmpBlockly.Generator, workspaceSvg: typeof Blockly.WorkspaceSvg) {


  /* TODO：手写体预测代码块，尚未完成
    Blockly.Blocks["mnist_predict"] = {
        init: function() {
            (this as any).image_data =
        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC" +
        "9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBkPSJNMT" +
        "ggMTBoLTR2LTRjMC0xLjEwNC0uODk2LTItMi0ycy0yIC44OTYtMiAybC4wNzEgNGgtNC4wNz" +
        "FjLTEuMTA0IDAtMiAuODk2LTIgMnMuODk2IDIgMiAybDQuMDcxLS4wNzEtLjA3MSA0LjA3MW" +
        "MwIDEuMTA0Ljg5NiAyIDIgMnMyLS44OTYgMi0ydi00LjA3MWw0IC4wNzFjMS4xMDQgMCAyLS" +
        "44OTYgMi0ycy0uODk2LTItMi0yeiIgZmlsbD0id2hpdGUiIC8+PC9zdmc+Cg==";
            let that = this;
            (this as any).predict_img = new Blockly.FieldImage((this as any).image_data, 140, 140, "predict", async function() {
            let mnistDialog = document.createElement("div");
            mnistDialog.innerHTML = `<!-- Button trigger modal -->
    <button id="wxp" type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
        Launch static backdrop modal
    </button>
    <!-- Modal -->
    <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
            <div class="modal-header">
                <h1 class="modal-title fs-5" id="staticBackdropLabel">Modal title</h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                ...
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary">Understood</button>
            </div>
            </div>
        </div>
    </div>
    <script>
        let bt = document.getElementById("wxp");
        console.log("hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh\n");
        bt.click();
    </script>
    
    `;
    
            // document.getElementById("wxp").click();
            // let mnistDialog = document.getElementById("mnistDialog");
            console.log("-------------------------------mnistDialog----------\n");
            console.log(mnistDialog);
            console.log("-------------------------------mnistDialog end----------\n");
    //         if (mnistDialog == null) {
    //             console.log("hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh\n");
    //             mnistDialog = document.createElement("div");
    //             mnistDialog.id = "mnistDialog";
    //             mnistDialog.innerHTML = `<!-- Button trigger modal -->
    // <button id="canvasButton" type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
    //     Launch static backdrop modal
    // </button>
    
    // <!-- Modal -->
    // <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
    //     <div class="modal-dialog">
    //         <div class="modal-content">
    //         <div class="modal-header">
    //             <h1 class="modal-title fs-5" id="staticBackdropLabel">Modal title</h1>
    //             <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
    //         </div>
    //         <div class="modal-body">
    //             ...
    //         </div>
    //         <div class="modal-footer">
    //             <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
    //             <button type="button" class="btn btn-primary">Understood</button>
    //         </div>
    //         </div>
    //     </div>
    // </div>`;
    //         }
    
    //         let canvasButton = document.getElementById("canvasButton");
            // let canvas = document.createElement("canvas");
            // let start_btn = document.createElement("button");
            // start_btn.onclick = function () {
    
            // }
            // start_btn.textContent = "开始手写";
            // let cancel_btn = document.createElement("button");
            // cancel_btn.textContent = "清除画布";
    
            // start_btn.onclick = function () {
            //     let el = canvas;
            //     el.style.width = "280px";
            //     el.style.height = "280px";
            //     let ctx = el.getContext("2d");
            //     ctx.strokeStyle = "red";
            //     ctx.lineWidth = 10;
            //     ctx.lineJoin = "round";
            //     ctx.lineCap = "round";
            //     let temp_e;
            //     let temp_draw=false;
            //     el.addEventListener("mousedown", function (e) {
            //         temp_e=e;
            //         temp_draw=true;
            //     });
            //     el.addEventListener("mousemove", function (e) {
            //         if(temp_draw) {
            //             let x1 = temp_e.offsetX;
            //             let y1 = temp_e.offsetY;
            //             let x2 = e.offsetX;
            //             let y2 = e.offsetY;
            //             console.log(x1, x2, y1, y2);
            //             ctx.beginPath();
            //             ctx.moveTo(x1, y1);
            //             ctx.lineTo(x2, y2);
            //             ctx.stroke();
            //         }
            //         temp_e=e;
            //     });
            //     el.addEventListener("mouseup", function () {
            //         temp_e=null;
            //         temp_draw=false;
            //     });
            //     el.addEventListener("mouseout", function () {
            //         temp_e=null;
            //         temp_draw=false;
            //     });
            //     cancel_btn.onclick = function () {
            //         ctx.clearRect(0, 0, el.width, el.height);
            //     }
            // }
            // let canvas_widget = new Widget({tag: "div"});
            // canvas_widget.node.appendChild(start_btn);
            // canvas_widget.node.appendChild(cancel_btn);
            // canvas_widget.node.appendChild(canvas);
            // let buttons = [
            //     Dialog.okButton({ label: "完成手写" })
            //     ];
            //     let dialog = new Dialog({
            //     title: "手写数字",
            //     body: canvas_widget,
            //     buttons
            //     });
            // await dialog.launch();
            // (this as any).value_ = canvas.toDataURL("image/png");
            // that.image_data = (this as any).value_;
            // console.log((this as any).value_, that.image_data)
        });
            (this as any).appendDummyInput()
                .appendField((this as any).predict_img);
            (this as any).setPreviousStatement(true, null);
            (this as any).setNextStatement(true, null);
            (this as any).setColour(230);
            (this as any).setTooltip("");
            (this as any).setHelpUrl("");
        }
    };

    Blockly.Blocks["mnist_predict"] = {
        init: function () {
            (this as any).image_data =
                "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC" +
                "9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBkPSJNMT" +
                "ggMTBoLTR2LTRjMC0xLjEwNC0uODk2LTItMi0ycy0yIC44OTYtMiAybC4wNzEgNGgtNC4wNz" +
                "FjLTEuMTA0IDAtMiAuODk2LTIgMnMuODk2IDIgMiAybDQuMDcxLS4wNzEtLjA3MSA0LjA3MW" +
                "MwIDEuMTA0Ljg5NiAyIDIgMnMyLS44OTYgMi0ydi00LjA3MWw0IC4wNzFjMS4xMDQgMCAyLS" +
                "44OTYgMi0ycy0uODk2LTItMi0yeiIgZmlsbD0id2hpdGUiIC8+PC9zdmc+Cg==";
            let that = this;
            (this as any).predict_img = new Blockly.FieldImage((this as any).image_data, 140, 140, "predict", async function () {
                await console.log("heelo shsssssit");
                let canvas = document.createElement("canvas");
                let start_btn = document.createElement("button");
                start_btn.textContent = "开始手写";
                let cancel_btn = document.createElement("button");
                cancel_btn.textContent = "清除画布";
    
                start_btn.onclick = function () {
                    let el = canvas;
                    el.style.width = "280px";
                    el.style.height = "280px";
                    let ctx = el.getContext("2d");
                    ctx.strokeStyle = "red";
                    ctx.lineWidth = 10;
                    ctx.lineJoin = "round";
                    ctx.lineCap = "round";
                    let temp_e;
                    let temp_draw = false;
                    el.addEventListener("mousedown", function (e) {
                        temp_e = e;
                        temp_draw = true;
                    });
                    el.addEventListener("mousemove", function (e) {
                        if (temp_draw) {
                            let x1 = temp_e.offsetX;
                            let y1 = temp_e.offsetY;
                            let x2 = e.offsetX;
                            let y2 = e.offsetY;
                            console.log(x1, x2, y1, y2);
                            ctx.beginPath();
                            ctx.moveTo(x1, y1);
                            ctx.lineTo(x2, y2);
                            ctx.stroke();
                        }
                        temp_e = e;
                    });
                    el.addEventListener("mouseup", function () {
                        temp_e = null;
                        temp_draw = false;
                    });
                    el.addEventListener("mouseout", function () {
                        temp_e = null;
                        temp_draw = false;
                    });
                    cancel_btn.onclick = function () {
                        ctx.clearRect(0, 0, el.width, el.height);
                    }
                }
    
                let canvas_widget = new Widget({ tag: "div" });
                canvas_widget.node.appendChild(start_btn);
                canvas_widget.node.appendChild(cancel_btn);
                canvas_widget.node.appendChild(canvas);
    
                let buttons = [
                    Dialog.okButton({ label: "完成手写" })
                ];
    
                let dialog = new Dialog({
                    title: "手写数字",
                    body: canvas_widget,
                    buttons
                });
    
                await dialog.launch();
                (this as any).value_ = canvas.toDataURL("image/png");
                that.image_data = (this as any).value_;
                console.log((this as any).value_, that.image_data)
            });
            
            (this as any).appendDummyInput()
                .appendField((this as any).predict_img);
            (this as any).setPreviousStatement(true, null);
            (this as any).setNextStatement(true, null);
            (this as any).setColour(230);
            (this as any).setTooltip("");
            (this as any).setHelpUrl("");
        }
    };
    
    pythonGenerator.forBlock["mnist_predict"] = function () {
        return `-----\n`;
    };
    */
}

export function addTFExampleMnistV3(blocks: typeof TmpBlockly.Blocks, pythonGenerator: TmpBlockly.Generator, Blockly: typeof TmpBlockly, content: any) {
  window.tf_exp = window.tf_exp || {};
  // window.tf_exp.mnist_data.load();
  window.tf_exp.mnist_v3_data_show = async function (img_data: any) {
    // Create a container in the visor
    let surface_name = `Input Data Examples ${Math.random().toFixed(5)}`;
    const surface = window.tfvis.visor().surface({ name: surface_name, tab: 'Input Data' })
    // Get the examples
    const xs = window.tf.tensor2d(img_data, [img_data.length, 784]);
    const numExamples = xs.shape[0]
    // Create a canvas element to render each example
    for (let i = 0; i < numExamples; i++) {
      const imageTensor = (window as any).tf.tidy(() => {
        // Reshape the image to 28x28 px
        return xs.slice([i, 0], [1, xs.shape[1]]).reshape([28, 28, 1])
      })
      const canvas = document.createElement('canvas')
      canvas.width = 28
      canvas.height = 28
      // canvas.style = "margin: 4px;";
      await (window as any).tf.browser.toPixels(imageTensor, canvas)
      surface.drawArea.appendChild(canvas)
      imageTensor.dispose()
    }
  }
  window.tf_exp.show_model_summary = function(model: any) {
    window.tfvis.show.modelSummary({name: 'Model Architecture', tab: 'Model'}, model);
  }
  window.tf_exp.mnist_v3_train = function(model: any, trainXs: any, trainYs:any, validationXs: any, validationYs: any) {
    console.log(model, trainXs, trainYs, validationXs, validationYs)
    trainXs = window.tf.tensor(trainXs)
    trainYs = window.tf.tensor(trainYs)
    validationXs = window.tf.tensor(validationXs)
    validationYs = window.tf.tensor(validationYs)
    console.log(model, trainXs, trainYs, validationXs, validationYs)

    const metrics = ['loss', 'val_loss', 'acc', 'val_acc'];
    const container = {
      name: 'Model Training', tab: 'Model', styles: { height: '1000px' }
    };
    const fitCallbacks = window.tfvis.show.fitCallbacks(container, metrics);

    return  model.fit(trainXs, trainYs, {
      batchSize: 512,
      validationData: [validationXs, validationYs],
      epochs: 10,
      shuffle: true,
      callbacks: fitCallbacks
    })
  }
  window.tf_exp.mnist_v3_doPrediction = async function (model: any, testXs: any, testYs: any) {
    const classNames = [
      'Zero',
      'One',
      'Two',
      'Three',
      'Four',
      'Five',
      'Six',
      'Seven',
      'Eight',
      'Nine'
    ]
    console.log(model, testXs, testYs)
    testXs = window.tf.tensor(testXs)
    testYs = window.tf.tensor(testYs)
    console.log(model, testXs, testYs)

    const labels = testYs.argMax(-1)
    const pred = model.predict(testXs).argMax(-1)

    // show perClassAccuracy
    const classAccuracy = await window.tfvis.metrics.perClassAccuracy(labels, pred)
    const accuracyContainer = { name: 'Accuracy', tab: 'Evaluation' }
    window.tfvis.show.perClassAccuracy(accuracyContainer, classAccuracy, classNames)
    // show confusionMatrix
    const confusionMatrix = await window.tfvis.metrics.confusionMatrix(labels, pred)
    const confusionContainer = { name: 'Confusion Matrix', tab: 'Evaluation' }
    window.tfvis.render.confusionMatrix(confusionContainer, {
      values: confusionMatrix,
      tickLabels: classNames
    })
    labels.dispose()
  }

  blocks['tf_example_mnist_v3_loader1'] = {
    init: function () {
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(MNIST_COLOR)
      this.appendDummyInput('dummyInput').appendField('Mnist 本地数据加载器(解码数据)')
    }
  }
  pythonGenerator.forBlock['tf_example_mnist_v3_loader1'] = function () {
    return `
import numpy as np
import struct

def decode_idx3_ubyte(idx3_ubyte_file):
    """
    解析idx3文件的通用函数
    :param idx3_ubyte_file: idx3文件路径
    :return: 数据集
    """
    # 读取二进制数据
    bin_data = open(idx3_ubyte_file, 'rb').read()
 
    # 解析文件头信息，依次为魔数、图片数量、每张图片高、每张图片宽
    offset = 0
    fmt_header = '>iiii'
    magic_number, num_images, num_rows, num_cols = struct.unpack_from(fmt_header, bin_data, offset)
    print ('魔数:%d, 图片数量: %d张, 图片大小: %d*%d' % (magic_number, num_images, num_rows, num_cols))
 
    # 解析数据集
    image_size = num_rows * num_cols
    offset += struct.calcsize(fmt_header)
    fmt_image = '>' + str(image_size) + 'B'
    images = np.empty((num_images, num_rows, num_cols))
    for i in range(num_images):
        if (i + 1) % 10000 == 0:
            print ('已解析 %d' % (i + 1) + '张')
        images[i] = np.array(struct.unpack_from(fmt_image, bin_data, offset)).reshape((num_rows, num_cols))
        offset += struct.calcsize(fmt_image)
    return images
 
 
def decode_idx1_ubyte(idx1_ubyte_file):
    """
    解析idx1文件的通用函数
    :param idx1_ubyte_file: idx1文件路径
    :return: 数据集
    """
    # 读取二进制数据
    bin_data = open(idx1_ubyte_file, 'rb').read()
 
    # 解析文件头信息，依次为魔数和标签数
    offset = 0
    fmt_header = '>ii'
    magic_number, num_images = struct.unpack_from(fmt_header, bin_data, offset)
    print ('魔数:%d, 图片数量: %d张' % (magic_number, num_images))
 
    # 解析数据集
    offset += struct.calcsize(fmt_header)
    fmt_image = '>B'
    labels = np.empty(num_images)
    for i in range(num_images):
        if (i + 1) % 10000 == 0:
            print ('已解析 %d' % (i + 1) + '张')
        labels[i] = struct.unpack_from(fmt_image, bin_data, offset)[0]
        offset += struct.calcsize(fmt_image)
    return labels

print(decode_idx1_ubyte("/data/mount/mnist_raw_data/t10k-images-idx3-ubyte"))
print(decode_idx1_ubyte("/data/mount/mnist_raw_data/t10k-labels-idx1-ubyte"))
`}

  blocks['tf_example_mnist_v3_loader2'] = {
    init: function () {
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(MNIST_COLOR)
      this.appendDummyInput('dummyInput').appendField('Mnist 本地数据加载器(获取X, y)')
    }
  }
  pythonGenerator.forBlock['tf_example_mnist_v3_loader2'] = function () {
    (pythonGenerator as any).definitions_["js_tf_basic"] = "from js import tf, tfvis";
    (pythonGenerator as any).definitions_["js_tf_exp"] = "from js import tf_exp";
    (pythonGenerator as any).definitions_["ffi_to_js"] = "from pyodide.ffi import to_js";
    (pythonGenerator as any).definitions_["numpy"] = "import numpy as np";
    (pythonGenerator as any).definitions_["struct"] = "import struct";

    return `
def loadlocal_mnist(images_path, labels_path):
    with open(labels_path, "rb") as lbpath:
        magic, n = struct.unpack(">II", lbpath.read(8))
        labels = np.fromfile(lbpath, dtype=np.uint8)
    with open(images_path, "rb") as imgpath:
        magic, num, rows, cols = struct.unpack(">IIII", imgpath.read(16))
        images = np.fromfile(imgpath, dtype=np.uint8).reshape(len(labels), 784)
    return images, labels
`}

  Blockly.Blocks['tf_example_mnist_v3_show_data'] = {
    init: function () {
      this.appendDummyInput('dummyInput').appendField('展示手写体数字')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(MNIST_COLOR)
    }
  }
  pythonGenerator.forBlock['tf_example_mnist_v3_show_data'] = function () {
    return `
# 展示手写体识别的部分数据
trainXs_raw, trainYs_raw  = loadlocal_mnist("/data/mount/mnist_raw_data/train-images-idx3-ubyte", "/data/mount/mnist_raw_data/train-labels-idx1-ubyte")
testXs_raw, testYs_raw  = loadlocal_mnist("/data/mount/mnist_raw_data/t10k-images-idx3-ubyte", "/data/mount/mnist_raw_data/t10k-labels-idx1-ubyte")
# 训练集
trainXs_raw, trainYs_raw = trainXs_raw[:5500], trainYs_raw[:5500]
trainXs, trainYs = trainXs_raw.reshape([len(trainXs_raw), 28, 28, 1]), (np.eye(10, dtype=np.uint8)[trainYs_raw]).reshape([5500, 10])        
print(trainXs.shape, trainYs.shape)
# 验证集
validationXs_raw, validationYs_raw = testXs_raw[:1000], testYs_raw[:1000]
validationXs, validationYs = validationXs_raw.reshape([len(validationXs_raw), 28, 28, 1]), (np.eye(10, dtype=np.uint8)[validationYs_raw]).reshape([1000, 10])
print(validationXs.shape, validationYs.shape, validationXs.dtype, validationYs.dtype)
# 测试集
testXs_raw, testYs_raw = testXs_raw[1000:1010], testYs_raw[1000: 1010]
testXs, testYs = testXs_raw.reshape([len(testXs_raw), 28, 28, 1]), (np.eye(10, dtype=np.uint8)[testYs_raw]).reshape([10, 10])
print(testXs.shape, testYs.shape, testXs.dtype, testYs.dtype)

tf_exp.mnist_v3_data_show(to_js(testXs_raw[:20]))
`
  }

  blocks['tf_example_mnist_v3_train_model'] = {
    init: function () {
      this.appendDummyInput().appendField('训练模型')
      this.setInputsInline(false)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(MNIST_COLOR)
    }
  }
  pythonGenerator.forBlock['tf_example_mnist_v3_train_model'] = function () {
    return `
# 训练
await tf_exp.mnist_v3_train(to_js(model), to_js(trainXs), to_js(trainYs), to_js(validationXs), to_js(validationYs))
`
  }

  blocks['tf_example_mnist_v3_model_evaluation'] = {
    init: function () {
      ;(this as any)
          .appendValueInput('dataSize')
          .setCheck('Number')
          .appendField('模型评估，选取数据大小为')
      ;(this as any).setInputsInline(true)
      ;(this as any).setPreviousStatement(true, null)
      ;(this as any).setNextStatement(true, null)
      ;(this as any).setColour(MNIST_COLOR)
    }
  }
  pythonGenerator.forBlock['tf_example_mnist_v3_model_evaluation'] = function (block: any) {
    let dataSize = pythonGenerator.valueToCode(block, 'dataSize', Order.NONE)
    return `tf_exp.mnist_v3_doPrediction(to_js(model), to_js(testXs), to_js(testYs))\n`
  }

}
