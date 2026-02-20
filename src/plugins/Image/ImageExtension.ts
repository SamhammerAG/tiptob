import Image from "@tiptap/extension-image";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import type { Node } from "@tiptap/core";

export default function getImageExtension(imageUpload: (file: File) => Promise<string>): Node {
  return Image.extend({
    name: "imageUpload",
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
