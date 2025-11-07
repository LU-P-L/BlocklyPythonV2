export function addTFLayersFlatten(Blockly: any, pythonGenerator: any, workspaceSvg: any) {
    const INTRODUCE_ICON = "data:image/svg+xml;base64,PHN2ZyB0PSIxNjQwMTUzMjIxMzA3IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjIwNzMiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cGF0aCBkPSJNNjQzLjYwMyA1NzQuNTQySDI4Mi41MzRjLTYuNTc1IDAtMTEuODc1IDguOTIzLTExLjg3NSAxOS44NzUgMCAxMC45NiA1LjMgMTkuODEzIDExLjg3NSAxOS44MTNoMzYxLjA2OWM2LjU2IDAgMTEuODY0LTguODUyIDExLjg2NC0xOS44MTMgMC0xMC45NjItNS4zMDUtMTkuODc1LTExLjg2NC0xOS44NzV6IG0wIDBNNjQzLjYwMyA0ODIuOTE3SDI4Mi41MzRjLTYuNTc1IDAtMTEuODc1IDguODg3LTExLjg3NSAxOS44ODIgMCAxMC45NTcgNS4zIDE5LjgxNCAxMS44NzUgMTkuODE0aDM2MS4wNjljNi41NiAwIDExLjg2NC04Ljg1OCAxMS44NjQtMTkuODE0IDAtMTAuOTk1LTUuMzA1LTE5Ljg4Mi0xMS44NjQtMTkuODgyeiBtMCAwTTY0My42MDMgMzkxLjM1NEgyODIuNTM0Yy02LjU3NSAwLTExLjg3NSA4Ljg2Mi0xMS44NzUgMTkuODIzIDAgMTAuOTU2IDUuMyAxOS44NDkgMTEuODc1IDE5Ljg0OWgzNjEuMDY5YzYuNTYgMCAxMS44NjQtOC44OTMgMTEuODY0LTE5Ljg1IDAtMTAuOTYtNS4zMDUtMTkuODIyLTExLjg2NC0xOS44MjJ6IG0wIDAiIHAtaWQ9IjIwNzQiPjwvcGF0aD48cGF0aCBkPSJNOTAwLjE1OCAxNzhjMC02Mi4zMDgtNTAuNjE0LTExMy4wMTctMTEyLjgyOS0xMTMuMDE3SDIzNC4yMDJjLTAuMjU4IDAtMC40ODMgMC4wMzktMC43NjQgMC4wNTUtMC4yNjMtMC4wMTYtMC41MDgtMC4wNTUtMC43NzEtMC4wNTUtNjAuNTcgMC0xMDkuODU2IDUwLjcwOS0xMDkuODU2IDExMy4wMTd2NjYwLjcwOWMwIDguMzI4IDMuMjY0IDE2LjI2IDkuMDg1IDIyLjAwM2w4OS43NTIgODkuMDU2YzExLjUxIDExLjM5OCAyOS43MTggMTEuMzk4IDQxLjIyNiAwbDkxLjU2NS05MC44NSA5NC45OTggOTQuMjQzYzExLjUxMiAxMS40NDggMjkuNzM2IDExLjQ0OCA0MS4yNDcgMGw5NS4wMDQtOTQuMjQ0IDk1LjAxMiA5NC4yNDRjNS43NTQgNS43MSAxMy4xOTEgOC41OCAyMC41OTggOC41OCA3LjQyOSAwIDE0Ljg3OS0yLjg3IDIwLjYzMy04LjU4bDg2LTg1LjMwOGM1LjgwNi01Ljc3OCA5LjA4My0xMy43MDYgOS4wODMtMjEuOTk4VjI4Ni45NmM0Ny44NDUtMTMuMTM4IDgzLjE0NC01Ni45NjMgODMuMTQ0LTEwOC45NjF6IG0tMTkzLjMgNzE5LjkzM2wtOTcuMzAzLTk2LjUzOWMtMTEuNzY2LTExLjcwNi0zMC40MS0xMS43MDYtNDIuMiAwbC05Ny4yOCA5Ni41MzktOTcuMjkzLTk2LjUzOWMtMTEuNzg4LTExLjcwNi0zMC40MzEtMTEuNzA2LTQyLjIyMyAwbC05My43NjUgOTMuMDEtNjEuNTA2LTYxVjE3MC4wODdjMC0yOS4zMzEgMjMuMTg0LTUzLjE4IDUxLjY4LTUzLjE4IDAuMjU2IDAgMC40ODQtMC4wNzYgMC43MTgtMC4wNzYgMC4zMDQgMCAwLjU3NiAwLjA3NyAwLjg1NyAwLjA3N2gwLjEwNmMzMC4xMyAwLjA2NyA1NC42MTYgMjMuOTA0IDU0LjYxNiA1My4xNzkgMCAyOS4zMjMtMjQuNTQxIDUzLjE5My01NC43MjIgNTMuMTkzLTE2LjgwNCAwLTMwLjM5NCAxMy45OC0zMC4zOTQgMzEuMjU0IDAgMTcuMjk1IDEzLjU5IDMxLjMxNCAzMC4zOTQgMzEuMzE0aDUzNnY1NTQuODI5bC01Ny42ODYgNTcuMjU1eiBtNjcuOTg0LTY2MS45NjlsLTQ3My40NzctMy4wMjhjMjguODM0LTE0LjEzNCAyOC44NTQtNDIuNTQgMjguODM0LTUxLjA4MS0wLjA3My0zMS44ODQtNC45MS00NS45ODQtMTMuMDQtNjEuNjk4bDQ3NC4wMjYtMC43OThjMjkuNzQgMCA2MC43NjUgMzEuMTg3IDYwLjc2NSA2MC4wODUgMCAyOC44OS0zMS40IDU1LjA0NC02MS4xMzggNTUuMDQ0bC0xNS45NyAxLjQ3NnogbTAgMCIgcC1pZD0iMjA3NSI+PC9wYXRoPjwvc3ZnPg==";
    const INTRODUCE_MESSAGE = document.createElement("div");
    INTRODUCE_MESSAGE.style.cssText = `
height: 600px;
overflow: scroll;
`;
    INTRODUCE_MESSAGE.innerHTML = `
2D 卷积层（例如图像上的空间卷积）
<br/>
该层创建一个卷积核，该核与层输入进行卷积以产生输出张量。
<br/>
如果 useBias 为 True，则会创建偏置向量并将其添加到输出中。如果激活不为空，它也会应用于输出。
<br/>
当将该层用作模型中的第一层时，提供关键字参数 inputShape
<br/>
本项目采用了tensorflow.js运行tensorflow, 以下列出支持参数：
<br/>
<a href="https://js.tensorflow.org/api/latest/?hl=zh-cn&_gl=1*wfvmks*_ga*Mjc1MTE0OTg2LjE2NTQ2ODc0NzA.*_ga_W0YLR4190T*MTY3NTU4OTg2NC43LjEuMTY3NTU4OTg5Ni4wLjAuMA..#layers.flatten" target="view_window">点击此处查看TFJS支持的参数</a>
<br/>
<a href="https://github.com/tensorflow/tfjs/blob/tfjs-v4.2.0/tfjs-layers/src/layers/core.ts#L317-L371" target="view_window">点击此处查看conv2D tfjs 源代码</a>
这Tensorflow2及以上，采用keras，以下列出支持参数：
<br/>
<a href="https://www.tensorflow.org/api_docs/python/tf/keras/layers/Conv2D" target="view_window">点击此处查看 keras 支持的参数</a>
<br/>
<a href="https://github.com/keras-team/keras/blob/v2.11.0/keras/layers/convolutional/conv2d.py#L29-L198" target="view_window">点击此处查看 keras 源代码s</a>
`;
    Blockly.Blocks["tf_layers_flatten"] = {
        init: function () {
            this.appendDummyInput("HEADER")
                .appendField(new Blockly.FieldImage(INTRODUCE_ICON, 20, 20, {alt: "*", flipRtl: "FALSE"}, async function () {
                    CustomDialog.show("Conv2D", INTRODUCE_MESSAGE, {showOkay: true});
                }));

            this.setInputsInline(false);
            this.setOutput(true, null);
            this.initialized_ = true;
            this.setColour("#7FB6FF");
        },
        // mutationToDom: function() {
        //     let container = document.createElement("mutation");
        //     container.setAttribute("initialized", this.initialized_);
        //     return container;
        // },
        // domToMutation: function(xmlElement) {
        //     this.initialized_ = xmlElement.getAttribute("initialized") === "true";
        //     this.updateShape_();
        // },
        // updateShape_: function() {
        //     if (this.initialized_ && !this.getInput("VALUE")) {
        //         this.appendValueInput("VALUE")
        //             .appendField("=")
        //             .setAlign(Blockly.ALIGN_RIGHT);
        //     }
        //     if (!this.initialized_ && this.getInput("VALUE")) {
        //         this.removeInput("VALUE");
        //     }
        // }
    };
    pythonGenerator.forBlock["tf_layers_flatten"] = function (block) {
        pythonGenerator.definitions_["js_tf"] = "from js import tf";
        return [`tf.layers.flatten()`, pythonGenerator.ORDER_NONE];
    };
}