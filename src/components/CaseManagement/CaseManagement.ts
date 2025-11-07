import JSZip from 'jszip';
import { saveAs } from 'file-saver';
/*
    jxb_config.json
    ??
    blockly-custom-blocks.js
    添加自定义block
    blockly
    blockly-workspace.json
    pyodide-package.json
    pyodide-std-input.txt
*/
interface JxbCase{
    blockly_workspace_json?: JSON
    pyodide_package_json?: { name: string; channel: string; }[]
    pyodide_std_input?: string
}
export class CaseManagement{
    public zip;
    constructor() {
        this.zip = new JSZip();
    }
    setCase(jxbCase: JxbCase) {
        let jxb_config: {"version": string, "resource": any[]} = {
            "version": "v2",
            "resource": []
        }
        if(jxbCase.blockly_workspace_json) {
            jxb_config.resource.push({
                "filename": "blockly-workspace.json",
                "zip_type": "string",
                "loader": "blockly-workspace-json"
            })
            this.zip.file('blockly-workspace.json', JSON.stringify(jxbCase.blockly_workspace_json))
        }
        if(jxbCase.pyodide_package_json) {
            jxb_config.resource.push({
                "filename": "pyodide-package.json",
                "zip_type": "string",
                "loader": "pyodide-package-json"
            })
            this.zip.file('pyodide-package.json', JSON.stringify(jxbCase.pyodide_package_json))
        }
        if(jxbCase.pyodide_std_input) {
            jxb_config.resource.push({
                "filename": "pyodide-std-input.txt",
                "zip_type": "string",
                "loader": "pyodide-std-input"
            })
            this.zip.file('pyodide-std-input.txt', jxbCase.pyodide_std_input)
        }
        this.zip.file('jxb-config.json', JSON.stringify(jxb_config))
    }
    async saveCase(filename: string) {
        const content = await this.zip.generateAsync({ type: 'blob' })
        saveAs(content, filename)
    }
    async save(jxbCase: JxbCase, filename:string) {
        this.setCase(jxbCase);
        await this.saveCase(filename);
    }
    async loadCase(content: Blob| Buffer, jxbCaseLoader: any) {
        const zip = await JSZip.loadAsync(content);
        const jxb_config_blob = zip.file('jxb-config.json');
        let jxb_config;
        if(jxb_config_blob) {
            jxb_config = JSON.parse(await jxb_config_blob.async("string"))
        } else {
            jxb_config = {
                "version": "v1",
                "resource": [{
                    "filename": "workspace.json",
                    "zip_type": "string",
                    "loader": "blockly-workspace-json"
                }, {
                    "filename": "input",
                    "zip_type": "string",
                    "loader": "pyodide-std-input"
                }]
            }
        }
        for(let item of jxb_config.resource) {
            const {filename, zip_type, loader} = item
            let file = zip.file(filename)
            if(file) {
                jxbCaseLoader[loader](await file.async(zip_type), item)
            }
        }
    }
}