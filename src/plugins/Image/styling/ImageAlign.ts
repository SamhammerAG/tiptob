import type { Node } from "@tiptap/core";
import type { ImageExtensionOptions, ImageExtensionStorage } from "../ImageExtension";

export type Align = "left" | "center" | "right";

const ALIGN_CLASS_REGEX = /image-style-align-(left|center|right)/;

export function parseAlign(element: HTMLElement): Align | null {
  const match = element.className.match(ALIGN_CLASS_REGEX);
  if (match) return match[1] as Align;
  return null;
}

export function alignClass(align: Align | null | undefined): string {
  return align ? `image-style-align-${align}` : "";
}

export function withImageAlign(
  image: Node<ImageExtensionOptions, ImageExtensionStorage>,
): Node<ImageExtensionOptions, ImageExtensionStorage> {
  const { align } = image.storage;
  if (!align) return image;

  return image.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        align: {
          default: null as Align | null,
          parseHTML: (element: HTMLElement) => parseAlign(element),
          renderHTML: (attrs: { align?: Align | null }) =>
            attrs.align ? { class: alignClass(attrs.align) } : {},
        },
      };
    },
  });
}
