
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
          const normalized = bg.replace(/\s/g, "").toLowerCase();
          if (["white", "#fff", "#ffffff", "rgb(255,255,255)", "black", "#000", "#000000", "rgb(0,0,0)"].includes(normalized)) return false;
          return { color: bg };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["mark", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },
});
