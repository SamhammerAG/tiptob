import type { Node } from "@tiptap/core";

export type Align = "left" | "center" | "right";

const ALIGN_CLASS_REGEX = /image-style-align-(left|center|right)/;

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    imageAlign: {
      setImageAlign: (align: Align | null) => ReturnType;
    };
  }
}

export function parseAlign(element: HTMLElement): Align | null {
  const match = element.className.match(ALIGN_CLASS_REGEX);
  if (match) return match[1] as Align;
  return null;
}

export function alignClass(align: Align | null | undefined): string {
  return align ? `image-style-align-${align}` : "";
}

export function withImageAlign(image: Node, align: boolean): Node {
  if (!align) return image;

  return image.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        align: {
          default: null as Align | null,
          parseHTML: (element: HTMLElement) => parseAlign(element),
          renderHTML: () => ({}),
        },
      };
    },

    renderHTML(props) {
      const dom = this.parent?.(props);
      const align = props.node.attrs.align as Align | null | undefined;

      if (align && Array.isArray(dom)) {
        const attrs = dom[1];
        if (attrs && typeof attrs === "object" && !Array.isArray(attrs)) {
          const figureAttrs = attrs as Record<string, string>;
          figureAttrs.class = [figureAttrs.class, alignClass(align)].filter(Boolean).join(" ");
        }
      }

      return dom;
    },

    addCommands() {
      return {
        ...(this.parent?.() ?? {}),
        setImageAlign:
          //schauen ob mit v3 besser geht
          (align: Align | null) =>
            ({ commands }) =>
              commands.updateAttributes("imageUpload", { align }),
      };
    },
  });
}
