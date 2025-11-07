import type * as TmpBlockly from "blockly";

export function addMatplotlibBlocksV2(blocks: typeof TmpBlockly.Blocks, pythonGenerator: TmpBlockly.Generator, Blockly: typeof TmpBlockly, content: any) {
    Blockly.defineBlocksWithJsonArray([
        {
            type: 'python_example_matplotlib_1',
            message0: 'matplotlib 测试 1',
            inputsInline: true,
            previousStatement: null,
            nextStatement: null,
            colour: '#7FB6FF'
        }
    ])

    pythonGenerator.forBlock['python_example_matplotlib_1'] = function (block: any) {
        return `
# matplotlib-pyodide https://github.com/pyodide/matplotlib-pyodide
# HTML5 canvas based renderer for Matplotlib in Pyodide https://blog.pyodide.org/posts/canvas-renderer-matplotlib-in-pyodide/
# matplotlib https://matplotlib.org/ 
from js import document
import numpy as np
import scipy.stats as stats
import matplotlib.pyplot as plt
import io, base64

def generate_plot_img():
    # get values from inputs
    mu = int(4)
    sigma = int(5)
    # generate an interval
    x = np.linspace(mu - 3*sigma, mu + 3*sigma, 100)
    # calculate PDF for each value in the x given mu and sigma and plot a line
    plt.plot(x, stats.norm.pdf(x, mu, sigma))
    # create buffer for an image
    buf = io.BytesIO()
    # copy the plot into the buffer
    plt.savefig(buf, format='png')
    buf.seek(0)
    # encode the image as Base64 string
    img_str = 'data:image/png;base64,' + base64.b64encode(buf.read()).decode('UTF-8')
    # show the image
    img_tag = document.getElementById('pyodide-browser-gui-container')
    ttt = document.createElement("img")
    ttt.src= img_str
    img_tag.append(ttt)
    buf.close()

generate_plot_img()`
    }
}


