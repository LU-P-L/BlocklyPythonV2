import type { BlocklyOptions } from 'blockly'

import type { PropType } from 'vue'

export const editorProps = {
  opt_options: {
    type: Object as PropType<BlocklyOptions>,
    default: () => ({
      toolbox: {
        kind: 'categoryToolbox',
        contents: [
          {
            kind: 'category',
            name: 'Logic',
            contents: [
              {
                kind: 'block',
                type: 'logic_compare'
              }
            ]
          }
        ]
      },
      collapse: true,
      comments: true,
      disable: true,
      maxBlocks: Infinity,
      media: __BLOCKLY_MEDIA_PATH__,
      trashcan: true,
      horizontalLayout: false,
      toolboxPosition: 'start',
      css: true,
      rtl: false,
      scrollbars: true,
      sounds: true,
      oneBasedIndex: true,
      grid: {
        spacing: 20,
        length: 40,
        colour: '#7FB6FF50',
        snap: false
      },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2
      }
    })
  }
}
