import type { Node } from "@tiptap/core";
import type { ImageExtensionOptions, ImageExtensionStorage } from "../ImageExtension";

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

export function withImageResize(
  image: Node<ImageExtensionOptions, ImageExtensionStorage>,
): Node<ImageExtensionOptions, ImageExtensionStorage> {
  const { resize } = image.storage;
  if (!resize) return image;

  return image.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        width: {
          default: null as string | null,
          parseHTML: (element: HTMLElement) => parseWidth(element),
          renderHTML: (attrs: { width?: string | null }) =>
            attrs.width ? { class: resizeClass(attrs.width), style: resizeStyle(attrs.width) } : {},
        },
      };
    },
  });
}
