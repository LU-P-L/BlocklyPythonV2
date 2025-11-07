import * as Blockly from 'blockly/core';
import { PythonGenerator } from "blockly/python";
import { s0aDaLC2h8eNcTk } from "@/components/S0aDaLC2h8eNcTk"

export class PyodideGenerator extends PythonGenerator {
  pyodidePreRunCode: { [key: string]: string } = {}
  init(workspace: Blockly.Workspace): void {
    this.INDENT = '    '
    super.init(workspace)
  }
  finish(code: string): string {
    // PythonGenerator finish 是导致变量有初始化的关键函数
    // 源码: https://github.com/google/blockly/blob/rc/v10.3.1/generators/python/python_generator.ts#L203-L222
    this.definitions_["variables"] = ""
    return super.finish(code)
  }
  workspaceToPyodideCode(workspace: Blockly.Workspace): any {
    if (!s0aDaLC2h8eNcTk()) return '';
    return {
      pre_code: Object.values(this.pyodidePreRunCode).join('\n'),
      code: this.workspaceToCode(workspace),
    }
  }
  addPyodidePreRunCode(label: string, code: string): void {
    this.pyodidePreRunCode[label] = code
  }
}
export const pyodideGenerator = new PyodideGenerator('PyodideGenerator');
