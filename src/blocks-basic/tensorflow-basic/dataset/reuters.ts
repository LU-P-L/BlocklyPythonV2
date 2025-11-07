import {LOADER_STATE, LOADER_ICON, FLUSH_ICON, OK_ICON, TfKerasDatasetsData} from "./tf_keras_datasets";
export function addTFDatasetReuters(Blockly: any, pythonGenerator: any, workspaceSvg: any) {
    const dataset_name = "reuters";
    const dataset_fetch_url = `tf_keras_dataset/${dataset_name}.npz`;
    const dataset_fs_path = `/${dataset_name}.npz`;

    window.tf_keras_dataset.reuters_data = window.tf_keras_dataset.reuters_data || new TfKerasDatasetsData(
        dataset_name, dataset_fetch_url, dataset_fs_path
    );
    const reuters_data = window.tf_keras_dataset.reuters_data;

    Blockly.Blocks["tf_dataset_reuters_data_loader"] = {
        init: function () {
            let that = this;
            this.setInputsInline(true);
            this.setOutput(true, null);
            this.setColour("#7FB6FF");
            this.load_state_icon = new Blockly.FieldImage(LOADER_ICON, 20, 20, dataset_name, function () {
                if (reuters_data.load_state == LOADER_STATE.PENDING || reuters_data.load_state == LOADER_STATE.FAIL) {
                    that.get_data();
                } else if (reuters_data.load_state == LOADER_STATE.LOADING) {
                    alert("加载中, 请不要重复点击");
                } else if (reuters_data.load_state == LOADER_STATE.SUCCESSFUL) {
                    alert("加载完成, 请不要重复点击");
                }
            });
            this.appendDummyInput("dummyInput")
                .appendField("路透社数据")
                .appendField("", "load_state_tips")
                .appendField(this.load_state_icon);
            this.updateShape_();
        },
        get_data() {
            reuters_data.pre_load();
            this.updateShape_();
            reuters_data.load(Pyodide.FS.writeFile).then(() => {
                this.updateShape_();
            });
        },
        updateShape_() {
            if (reuters_data.load_state == LOADER_STATE.PENDING) {
                this.setFieldValue("(点击开始加载)", "load_state_tips");
                this.load_state_icon.doValueUpdate_(FLUSH_ICON);
            } else if (reuters_data.load_state == LOADER_STATE.LOADING) {
                this.setFieldValue("(加载中)", "load_state_tips");
                this.load_state_icon.doValueUpdate_(LOADER_ICON);
            } else if (reuters_data.load_state == LOADER_STATE.FAIL) {
                this.setFieldValue("(加载失败)", "load_state_tips");
                this.load_state_icon.doValueUpdate_(FLUSH_ICON);
            } else if (reuters_data.load_state == LOADER_STATE.SUCCESSFUL) {
                this.setFieldValue("(加载完成)", "load_state_tips");
                this.load_state_icon.doValueUpdate_(OK_ICON);
            }
        }
    }
    pythonGenerator.forBlock["tf_dataset_reuters_data_loader"] = function (block) {
        pythonGenerator.definitions_["import numpy as np"] = "import numpy as np";
        return [`np.load("${dataset_fs_path}", allow_pickle=True)`, pythonGenerator.ORDER_NONE];
        ;
    }
}