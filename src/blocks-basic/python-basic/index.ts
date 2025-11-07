import { addAssertBlocks } from './assert'
import { addAssignBlocks } from './assign'
import { addBasicIntroductionBlocks } from './basic_introduction'
import { addBinOpBlocksV2} from './bin_op'
import { addBoolOpBlocksV2 } from './bool_op'
import { addBreakBlocks } from './break'
import {addClassBlocksV2} from "@/blocks-basic/python-basic/class";
import { addCompareBlocksV2 } from './compare'
import { addContinueBlocks } from './continue'
import { addDictBlocks } from './dict'
import { addExpressionBlocks } from './expression'
import { addForStmtBlocks } from './for_stmt'
import { addFunctionBasicBlocks } from './function_basic'
import { addFunctionDefBlocks } from './function_def'
import { addIfBlocksV2 } from './if'
import { addImportBlocks, addImportBlocksV2 } from './import'
import { addListBlocks } from './list'
import { addNameBlocks } from './name'
import { addNameConstantBlocks } from './name_constant'
import { addNonlocalBlocks } from './nonlocal'
import { addNumberBlocks } from './number'
import { addPassBlocks } from './pass'
import { addRawBlocks } from './raw'
import { addReturnBlocks } from './return'
import { addSetBlocks } from './set'
import { addStarredBlocks } from './starred'
import { addStrBlocks } from './str'
import { addSubScriptBlocks } from './sub_script'
import { addTextBlocks } from './text'
import { addTryExceptBlocks } from './try_except'
import { addTupleBlocks } from './tuple'
import { addUnaryOpBlocks } from './unary_op'
import { addWhileBlocks } from './while'
import { addWithBlocks } from './with'
import type * as TmpBlockly from "blockly";
// import { addClassTypeBlocks2 } from './class_type2'
import {addTypeConversionBlocksV2} from "@/blocks-basic/python-basic/type_conversion";


export function addPythonBasicBlocks(Blockly: any, pythonGenerator: any, workspaceSvg: any) {
  addBasicIntroductionBlocks(Blockly, pythonGenerator, workspaceSvg)
  addAssertBlocks(Blockly, pythonGenerator)
  addAssignBlocks(Blockly, pythonGenerator)
  addBreakBlocks(Blockly, pythonGenerator)
  // addClassDefBlocks(Blockly, pythonGenerator, workspaceSvg)
  addContinueBlocks(Blockly, pythonGenerator)
  addDictBlocks(Blockly, pythonGenerator)
  addExpressionBlocks(Blockly, pythonGenerator, workspaceSvg)
  addForStmtBlocks(Blockly, pythonGenerator, workspaceSvg)
  addFunctionBasicBlocks(Blockly, pythonGenerator)
  addFunctionDefBlocks(Blockly, pythonGenerator, workspaceSvg)
  addImportBlocks(Blockly, pythonGenerator, workspaceSvg)
  addListBlocks(Blockly, pythonGenerator)
  addNameConstantBlocks(Blockly, pythonGenerator)
  addNameBlocks(Blockly, pythonGenerator)
  addNonlocalBlocks(Blockly, pythonGenerator)
  addNumberBlocks(Blockly, pythonGenerator)
  addPassBlocks(Blockly, pythonGenerator)
  addRawBlocks(Blockly, pythonGenerator)
  addReturnBlocks(Blockly, pythonGenerator)
  addSetBlocks(Blockly, pythonGenerator)
  addStarredBlocks(Blockly, pythonGenerator)
  addStrBlocks(Blockly, pythonGenerator)
  addSubScriptBlocks(Blockly, pythonGenerator)
  addTextBlocks(Blockly, pythonGenerator)
  addTryExceptBlocks(Blockly, pythonGenerator)
  addTupleBlocks(Blockly, pythonGenerator)
  addUnaryOpBlocks(Blockly, pythonGenerator)
  addWhileBlocks(Blockly, pythonGenerator)
  addWithBlocks(Blockly, pythonGenerator)
  // addClassTypeBlocks2(Blockly, pythonGenerator, workspaceSvg)
}

export function addPythonBasicBlocksV2(blocks: typeof TmpBlockly.Blocks, pythonGenerator: TmpBlockly.Generator, Blockly: typeof TmpBlockly, content: any) {
  addBinOpBlocksV2(blocks, pythonGenerator, Blockly);
  addBoolOpBlocksV2(blocks, pythonGenerator, Blockly);
  addCompareBlocksV2(blocks, pythonGenerator, Blockly);
  addImportBlocksV2(blocks, pythonGenerator, Blockly, content);
  addIfBlocksV2(blocks, pythonGenerator, Blockly, content);
  addTypeConversionBlocksV2(blocks, pythonGenerator, Blockly, content);
  addClassBlocksV2(blocks, pythonGenerator, Blockly, content)
}