import { type Node, mergeAttributes } from "@tiptap/core";
import type { ImageExtensionOptions, ImageExtensionStorage } from "../ImageExtension";
import { ImageNodeView } from "./ImageNodeView";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    resetImageStyling: {
      resetImageStyling: () => ReturnType;
    };
  }
}

export function withImageStyling(
  image: Node<ImageExtensionOptions, ImageExtensionStorage>,
): Node<ImageExtensionOptions, ImageExtensionStorage> {
  const { resize, align } = image.storage;
  if (!resize && !align) return image;

  return image.extend({
    addAttributes() {
      const parent: Record<string, unknown> = this.parent?.() ?? {};
      const suppress = (key: string) => ({
        ...(parent[key] as object),
        renderHTML: () => ({}),
      });
      return {
        ...parent,
        src: suppress("src"),
        alt: suppress("alt"),
        title: suppress("title"),
      };
    },

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

    renderHTML({ node, HTMLAttributes }) {
      const { src, alt, title } = node.attrs as {
        src: string | null;
        alt: string | null;
        title: string | null;
      };

      const imgAttrs: Record<string, string> = {};
      if (src) imgAttrs.src = src;
      if (alt) imgAttrs.alt = alt;
      if (title) imgAttrs.title = title;

      return ["figure", mergeAttributes({ class: "image" }, HTMLAttributes), ["img", imgAttrs]];
    },

    ...(resize
      ? {
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
        }
      : {}),

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
