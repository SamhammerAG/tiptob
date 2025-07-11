
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export const SelectionDecoration = Extension.create({
  name: 'selectionDecoration',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('selectionDecoration'),
        props: {
          decorations: (state) => {
            const { selection } = state
            const { isFocused } = this.editor

            // Skip decoration if editor is focused or no selection
            if (isFocused || selection.empty) {
              return null
            }

            const selectedNode = selection.$from.node()
            if (selectedNode.type.name !== 'paragraph') {
              return null
            }

            return DecorationSet.create(state.doc, [
              Decoration.inline(selection.from, selection.to, {
                class: "selection",
                style: "background-color: rgba(0, 153, 255, 0.25)"
              }),
            ])
          },
        },
      }),
    ]
  },
})
