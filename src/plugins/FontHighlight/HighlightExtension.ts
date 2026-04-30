
import { mergeAttributes } from "@tiptap/core";
import Highlight, { type HighlightOptions } from "@tiptap/extension-highlight";

export const ExtendedHighlight = Highlight.extend<HighlightOptions>({
  priority: 103,
  parseHTML() {
    return [
      ...this.parent?.(),
      {
        consuming: false,
        tag: "span",
        getAttrs: (node) => {
          const bg = node.style.backgroundColor;
          if (!bg) return false;
          const m = bg.match(/\d+/g);
          if (m) {
            const [r, g, b] = m.map(Number);
            if (r + g + b < 130 || r + g + b > 720) return false;
          }
          return { color: bg };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["mark", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },
});
