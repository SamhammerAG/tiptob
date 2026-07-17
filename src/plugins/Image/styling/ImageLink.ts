import type { Node } from "@tiptap/core";
import { NodeSelection } from "@tiptap/pm/state";
import type { ImageExtensionOptions, ImageExtensionStorage } from "../ImageExtension";
import { normalizeLinkHref } from "../../../utils/link";

export function parseImageLinkHref(element: HTMLElement): string | null {
  const anchor = element.querySelector?.("a[href]") ?? element.closest?.("a[href]") ?? null;
  return normalizeLinkHref(anchor?.getAttribute("href") ?? "");
}

export function renderImageLink(href: string | null, image: unknown[]) {
  const normalizedHref = href ? normalizeLinkHref(href) : null;
  return normalizedHref ? ["a", { href: normalizedHref }, image] : image;
}

export function withImageLink(
  image: Node<ImageExtensionOptions, ImageExtensionStorage>,
): Node<ImageExtensionOptions, ImageExtensionStorage> {
  const { link } = image.storage;
  const isSelectedImage = (state: { selection: unknown }) =>
    state.selection instanceof NodeSelection && state.selection.node.type.name === image.name;

  return image.extend({
    ...(link
      ? {
          addAttributes() {
            return {
              ...this.parent?.(),
              href: {
                default: null as string | null,
                parseHTML: (element: HTMLElement) => parseImageLinkHref(element),
                renderHTML: () => ({}),
              },
            };
          },
        }
      : {}),

    addCommands() {
      return {
        ...(this.parent?.() ?? {}),
        canSetImageLink:
          () =>
          ({ state }) =>
            link && isSelectedImage(state),
        setImageLink:
          (href: string) =>
          ({ state, commands }) => {
            const normalizedHref = normalizeLinkHref(href);
            if (!link || !normalizedHref || !isSelectedImage(state)) return false;
            return commands.updateAttributes(image.name, { href: normalizedHref });
          },
        unsetImageLink:
          () =>
          ({ state, commands }) => {
            if (!link || !isSelectedImage(state)) return false;
            return commands.updateAttributes(image.name, { href: null });
          },
      };
    },
  });
}
