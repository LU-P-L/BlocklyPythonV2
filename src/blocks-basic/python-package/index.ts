import type * as TmpBlockly from "blockly";
import {addTurtleBlocksV2} from "@/blocks-basic/python-package/turtle";
import {addMatplotlibBlocksV2} from "@/blocks-basic/python-package/matplotlib";

export function addPythonPackageBlocksV2(blocks: typeof TmpBlockly.Blocks, pythonGenerator: TmpBlockly.Generator, Blockly: typeof TmpBlockly, content: any) {
    addTurtleBlocksV2(blocks, pythonGenerator, Blockly, content);
    addMatplotlibBlocksV2(blocks, pythonGenerator, Blockly, content);
}