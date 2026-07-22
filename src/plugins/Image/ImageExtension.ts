import { Image } from "@tiptap/extension-image";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";
import type { Node } from "@tiptap/core";

function extractGifSrc(html: string | undefined): string | null {
  if (!html) return null;
  const doc = new DOMParser().parseFromString(html, "text/html");
  const img = doc.querySelector("img");
  const src = img?.getAttribute("src")?.trim();
  if (!src) return null;
  if (!/^https?:\/\//i.test(src)) return null;
  const path = src.split(/[?#]/)[0];
  return /\.gif$/i.test(path) ? src : null;
}

function insertImage(view: EditorView, src: string): void {
  const node = view.state.schema.nodes.imageUpload.create({ src });
  const transaction = view.state.tr.insert(view.state.selection.from, node);
  view.dispatch(transaction);
}

export default function getImageExtension(imageUpload: (file: File) => Promise<string>): Node {
  return Image.extend({
    name: "imageUpload",

    addProseMirrorPlugins() {
      return [
        new Plugin({
          key: new PluginKey("imageUpload"),
          props: {
            handleDrop: (view, event, _, moved) => {
              if (moved) {
                return;
              }

              const dataTransfer = event.dataTransfer;
              if (!dataTransfer) {
                return;
              }

              const gifSrc = extractGifSrc(dataTransfer.getData("text/html"));
              if (gifSrc) {
                event.preventDefault();
                insertImage(view, gifSrc);
                return true;
              }

              if (!dataTransfer.files || !dataTransfer.files.length) {
                return;
              }

              const images = Array.from(dataTransfer.files).filter((file) => {
                return file.type.includes("image/");
              });

              if (images.length === 0) {
                return;
              }

              event.preventDefault();

              for (const image of images) {
                imageUpload(image).then((img: string) => insertImage(view, img));
              }
              
              return true;
            },

            handlePaste: (view, event) => {
              const clipboardData = event.clipboardData;
              if (!clipboardData) return false;

              const html = clipboardData.getData("text/html");

              const gifSrc = extractGifSrc(html);
              if (gifSrc) {
                event.preventDefault();
                insertImage(view, gifSrc);
                return true;
              }

              const files = Array.from(clipboardData.files || []);
              const images = files.filter((file) => file.type.startsWith("image/"));

              if (images.length === 0) return false;

              //weird check for excel because if you paste from excel it add an image of the table into the clipboard
              if (images.length === 1 && html && /<table[\s>]/i.test(html)) {
                return false;
              }

              event.preventDefault();

              for (const image of images) {
                imageUpload(image).then((img: string) => insertImage(view, img));
              }

              return true;
            },
          },
        }),
      ];
    },
  });
}
