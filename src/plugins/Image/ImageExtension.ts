import Image from "@tiptap/extension-image";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import type { Node } from "@tiptap/core";
import { ImageNodeView } from "./ImageNodeView";

type Align = "left" | "center" | "right";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    imageUpload: {
      setImageWidth: (width: string | null) => ReturnType;
      setImageAlign: (align: Align | null) => ReturnType;
    };
  }
}

const ALIGN_CLASS_REGEX = /image-style-align-(left|center|right)/;

function parseAlign(element: HTMLElement): Align | null {
  const match = element.className.match(ALIGN_CLASS_REGEX);
  if (match) return match[1] as Align;
  return null;
}

function parseWidth(element: HTMLElement): string | null {
  const width = element.style?.width;
  if (typeof width === "string" && width.trim()) return width.trim();
  return null;
}

export default function getImageExtension(imageUpload: (file: File) => Promise<string>): Node {
  return Image.extend({
    name: "imageUpload",

    addAttributes() {
      return {
        ...this.parent?.(),
        width: {
          default: null as string | null,
          parseHTML: () => null,
          renderHTML: () => ({}),
        },
        align: {
          default: null as Align | null,
          parseHTML: () => null,
          renderHTML: () => ({}),
        },
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
              width: parseWidth(node),
              align: parseAlign(node),
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
              width: null,
              align: null,
            };
          },
        },
      ];
    },

    renderHTML({ node }) {
      const { src, alt, title, width, align } = node.attrs as {
        src: string | null;
        alt: string | null;
        title: string | null;
        width: string | null;
        align: Align | null;
      };

      const classes = ["image"];
      if (width) classes.push("image_resized");
      if (align) classes.push(`image-style-align-${align}`);

      const figureAttrs: Record<string, string> = { class: classes.join(" ") };
      if (width) figureAttrs.style = `width:${width};`;

      const imgAttrs: Record<string, string> = {};
      if (src) imgAttrs.src = src;
      if (alt) imgAttrs.alt = alt;
      if (title) imgAttrs.title = title;

      return ["figure", figureAttrs, ["img", imgAttrs]];
    },

    addCommands() {
      return {
        ...(this.parent?.() ?? {}),
        setImageWidth:
          (width: string | null) =>
          ({ commands }) =>
            commands.updateAttributes("imageUpload", { width }),
        setImageAlign:
          (align: Align | null) =>
          ({ commands }) =>
            commands.updateAttributes("imageUpload", { align }),
      };
    },

    addNodeView() {
      return ({ node, editor, getPos }) => {
        return new ImageNodeView({
          node,
          editor,
          getPos: typeof getPos === "function" ? getPos : () => undefined,
        });
      };
    },

    addProseMirrorPlugins: () => {
      return [
        new Plugin({
          key: new PluginKey("imageUpload"),
          props: {
            handleDrop: (view, event, _, moved) => {
              const hasFiles =
                event.dataTransfer &&
                event.dataTransfer.files &&
                event.dataTransfer.files.length;

              if (!hasFiles || moved) {
                return;
              }

              const images = Array.from(event.dataTransfer.files).filter(
                (file) => {
                  return file.type.includes("image/");
                }
              );

              if (images.length === 0) {
                return;
              }

              event.preventDefault();

              const { schema } = view.state;

              for (const image of images) {
                imageUpload(image).then((img: string) => {
                  const node = schema.nodes.imageUpload.create({
                    src: img,
                  });
                  const transaction =
                    view.state.tr.insert(view.state.selection.from, node);
                  view.dispatch(transaction);
                });
              }
              return true;
            },

            handlePaste: (view, event) => {
              const clipboardData = event.clipboardData;
              if (!clipboardData) return false;

              const files = Array.from(clipboardData.files || []);
              const images = files.filter(file => file.type.startsWith("image/"));

              if (images.length === 0) return false;

              //weird check for excel because if you paste from excel it add an image of the table into the clipboard
              if (images.length === 1) {
                const html = clipboardData.getData("text/html");
                if (html && /<table[\s>]/i.test(html)) {
                  return false;
                }
              }

              event.preventDefault();

              const { schema } = view.state;
              for (const image of images) {
                imageUpload(image).then((img: string) => {
                  const node = schema.nodes.imageUpload.create({ src: img });
                  const tr = view.state.tr.insert(view.state.selection.from, node);
                  view.dispatch(tr);
                });
              }

              return true;
            },
          },
        }),
      ];
    },
  });
}
