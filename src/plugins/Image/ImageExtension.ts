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
            handlePaste: (view, event) => {
              const hasFiles =
                event.clipboardData &&
                event.clipboardData.files &&
                event.clipboardData.files.length;

              if (!hasFiles) {
                return;
              }

              const images = Array.from(event.clipboardData.files).filter(
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
            },
          },
        }),
      ];
    },
  });
}
