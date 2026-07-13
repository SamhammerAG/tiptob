import type { Node } from "@tiptap/core";
import { ImageNodeView } from "./ImageNodeView";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    resetImageStyling: {
      resetImageStyling: () => ReturnType;
    };
  }
}

export function withImageStyling(image: Node, resize: boolean, align: boolean): Node {
  if (!resize && !align) return image;

  return image.extend({
    parseHTML() {
      return [
        {
          tag: "figure.image",
          getAttrs: (node) => {
            if (!(node instanceof HTMLElement)) return false;
            const img = node.querySelector("img");
            if (!img) return false;
            return {
              src: img.getAttribute("src"),
              alt: img.getAttribute("alt"),
              title: img.getAttribute("title"),
            };
          },
        },
        {
          tag: "img[src]",
          getAttrs: (node) => {
            if (!(node instanceof HTMLElement)) return false;
            return {
              src: node.getAttribute("src"),
              alt: node.getAttribute("alt"),
              title: node.getAttribute("title"),
            };
          },
        },
      ];
    },

    renderHTML({ node }) {
      const { src, alt, title } = node.attrs as {
        src: string | null;
        alt: string | null;
        title: string | null;
      };

      const imgAttrs: Record<string, string> = {};
      if (src) imgAttrs.src = src;
      if (alt) imgAttrs.alt = alt;
      if (title) imgAttrs.title = title;

      return ["figure", { class: "image" }, ["img", imgAttrs]];
    },

    addNodeView() {
      return ({ node, editor, getPos }) => {
        return new ImageNodeView({
          node,
          editor,
          getPos: typeof getPos === "function" ? getPos : () => undefined,
          resizable: resize,
        });
      };
    },

    addCommands() {
      return {
        ...(this.parent?.() ?? {}),
        resetImageStyling:
          () =>
          ({ commands }) =>
            commands.updateAttributes("imageUpload", {
              ...(resize ? { width: null } : {}),
              ...(align ? { align: null } : {}),
            }),
      };
    },
  });
}
