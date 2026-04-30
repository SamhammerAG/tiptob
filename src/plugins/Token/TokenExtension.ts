import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { Node } from '@tiptap/pm/model'

export const TokenExtension = Extension.create({
  name: 'tokenHighlight',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('tokenHighlight'),

        state: {
          init(_, { doc }) {
            return DecorationSet.create(doc, findCurlyBraceDecorations(doc))
          },
          apply(transaction, oldDecorationSet) {
            if (transaction.docChanged) {
              return DecorationSet.create(transaction.doc, findCurlyBraceDecorations(transaction.doc))
            }
            return oldDecorationSet
          },
        },

        props: {
          decorations(state) {
            return this.getState(state)
          },
        },
      }),
    ]
  },
})


function findCurlyBraceDecorations(doc: Node): Decoration[] {
  const decorations: Decoration[] = []
  const regex = /(\{\{[^{}]*\}\}|\{%\s*[^%]*\s*%\})/g

  doc.descendants((node, pos) => {
    if (!node.isText || !node.text) return true

    let match: RegExpExecArray;
    while ((match = regex.exec(node.text)) !== null) {
      const start = pos + match.index
      const end = start + match[0].length

      const decoration = Decoration.inline(start, end, {
        class: 'token-highlight',
        style: 'background-color: #ffe58a;'
      })

      decorations.push(decoration)
    }

    return true
  })

  return decorations
}

