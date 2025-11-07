import { defineStore } from 'pinia';


export const usePyodideStdIORunInstanceStore = defineStore('pyodideStdIORunInstance', {
    // 为了完整类型推理，推荐使用箭头函数
    state: () => {
        return {
            code: "" as string,
            stdInputValueList: [] as string[],
            stdOutputValue: "" as string,
            stdErrorValue: "" as string,
        };
    },
    actions: {
        pyodideStdInputFactory() {
            let valueList = JSON.parse(JSON.stringify(this.stdInputValueList));
            return () => {
                if (valueList.length > 0) {
                    return valueList.shift();
                }
                const value = prompt();
                if (null !== value) this.stdInputValueList?.push(value);
                return value;
            };
        },
        pyodideStdOutputFactory() {
            this.stdOutputValue = '';
            return (text: string) => {
                this.stdOutputValue += text + '\n';
            };
        },
        pyodideStdErrorFactory() {
            this.stdErrorValue = '';
            return (text: string) => {
                this.stdErrorValue += text + '\n';
            };
        }
    }
});
