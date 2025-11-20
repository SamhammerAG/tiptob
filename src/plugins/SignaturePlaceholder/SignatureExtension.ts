import { mergeAttributes, Node } from '@tiptap/core';

export const SignatureExtension = Node.create({
  name: 'signature',
  group: 'block',
  content: 'block*',

  parseHTML() {
    return [{ tag: 'signature' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['signature', mergeAttributes(HTMLAttributes), 0]
  },


  addNodeView() {
    return () => {
      const dom = document.createElement('signature');
      const filler = document.createElement('br');
      const content = document.createElement('div');
      content.classList.add('content', 'is-editable');
      dom.append(content, filler);
      return { dom, contentDOM: content };
    };
  },
});
