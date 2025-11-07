import JSZip from "jszip";

export const saveText2File = (text: string, filename: string) => {
    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
    element.setAttribute('download', filename)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
}
export const loadFile = (func: (content: string | ArrayBuffer) => void, mode='ArrayBuffer') => {
    const element = document.createElement('input');
    element.type = 'file';
    element.name = 'file';
    element.multiple = false;
    element.style.display = 'none';
    document.body.appendChild(element);
    element.addEventListener('change', () => {
        if (element.value === '' || element.files == null) {
            alert('选择文件为空');
            return
        }
        if (element.files.length > 1) {
            alert('选择文件超过一个')
            return
        }
        const file = element.files[0];
        const reader = new FileReader();
        reader.onload = async (e) => {
            if (e.target && e.target.result) {
                func(e.target.result);
            }
        };
        if (mode === 'ArrayBuffer') {
            reader.readAsArrayBuffer(file);
        } else if (mode === 'Text') {
            reader.readAsText(file, 'UTF-8')
        }
    });
    element.click();
    document.body.removeChild(element);
};
export const loadFile2Text = (func: (text: string)=>void) => {
    loadFile((content: string | ArrayBuffer) => {
        func(<string>content)
    }, 'Text');
}
export const loadFile2Project = (func: (relativePath:string, context: string)=>void) => {
    loadFile(async (content: string | ArrayBuffer) => {
        try {
            const zip = await JSZip.loadAsync(content);
            zip.forEach((relativePath, zipEntry) => {
                zipEntry.async('string').then(
                    (zip_context: string) => {
                        func(relativePath, zip_context)
                    }
                )
            });
        } catch (error) {
            console.error(error);
        }
    });
};