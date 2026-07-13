import type { Node } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    imageResize: {
      setImageWidth: (width: string | null) => ReturnType;
    };
  }
}

export function parseWidth(element: HTMLElement): string | null {
  const width = element.style?.width;
  if (typeof width === "string" && width.trim()) return width.trim();
  return null;
}

export function resizeClass(width: string | null | undefined): string {
  return width ? "image_resized" : "";
}

export function resizeStyle(width: string | null | undefined): string {
  return width ? `width:${width};` : "";
}

export function withImageResize(image: Node, resize: boolean): Node {
  if (!resize) return image;

  return image.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        width: {
          default: null as string | null,
          parseHTML: (element: HTMLElement) => parseWidth(element),
          renderHTML: () => ({}),
        },
      };
    },

    renderHTML(props) {
      const dom = this.parent?.(props);
      const width = props.node.attrs.width as string | null | undefined;

      if (width && Array.isArray(dom)) {
        const attrs = dom[1];
        if (attrs && typeof attrs === "object" && !Array.isArray(attrs)) {
          const figureAttrs = attrs as Record<string, string>;
          figureAttrs.class = [figureAttrs.class, resizeClass(width)].filter(Boolean).join(" ");
          const style = resizeStyle(width);
          if (style) figureAttrs.style = style;
        }
      }

      return dom;
    },

    addCommands() {
      return {
        ...(this.parent?.() ?? {}),
        setImageWidth:
          (width: string | null) =>
          ({ commands }) =>
            commands.updateAttributes("imageUpload", { width }),
      };
    },
  });
}
