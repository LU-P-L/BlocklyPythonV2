import { describe, it, expect, vi, beforeEach } from 'vitest';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {CaseManagement} from "../CaseManagement";
import fs from 'fs/promises';

vi.mock('file-saver', () => {
    return {
        saveAs: vi.fn(),
    };
});

describe('CaseManagement', () => {
    let caseManagement: CaseManagement;
    beforeEach(() => {
        caseManagement = new CaseManagement();
    });

    it('should create an instance of JSZip', () => {
        const caseManagement = new CaseManagement();
        expect(caseManagement.zip).toBeInstanceOf(JSZip);
    });

    it('should call saveAs with a blob and filename when gen is called', async () => {
        const caseManagement = new CaseManagement();
        caseManagement.setCase({
            "pyodide_std_input": "123456"
        })
        const filename = 'test.zip';
        await caseManagement.saveCase(filename);
        console.log(caseManagement.zip)
        expect(saveAs).toHaveBeenCalled();
        expect(saveAs).toHaveBeenCalledWith(expect.any(Blob), filename);
    });

    it('should load a case and get the content of a specified file', async () => {
        let zipContent = await fs.readFile("src/components/CaseManagement/__tests__/test.zip")
        await caseManagement.loadCase(zipContent, {
            "blockly-workspace-json": (f: string)=> {
                console.log(f)
            },
            "pyodide-std-input": (f: string) =>{
                console.log(f)
            }
        })
    });
});
