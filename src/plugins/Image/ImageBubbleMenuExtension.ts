import BubbleMenu from "@tiptap/extension-bubble-menu";
import { Editor, Extension, posToDOMRect } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";

export function getBubbleMenuExtension(getEditor: () => Editor): Extension {
  return BubbleMenu.extend({ name: "imageBubbleMenu" }).configure({
    pluginKey: new PluginKey("imageBubbleMenu"),
    updateDelay: 0,
    tippyOptions: {
      animation: true,
      maxWidth: "none",
      placement: "top",
      popperOptions: {
        modifiers: [
          {
            name: "preventOverflow",
            options: {
              altAxis: true,
              tether: true,
            },
          },
        ],
      },
      getReferenceClientRect: () => {
        const { state, view } = getEditor();
        const { from, to } = state.selection;
        const imageDom = view.nodeDOM(from) as HTMLElement | null;

        if (imageDom && typeof imageDom.getBoundingClientRect === "function") {
          return imageDom.getBoundingClientRect();
        }

        return posToDOMRect(view, from, to);
      },
    },
    shouldShow: ({ editor }) => {
      return editor.isEditable && editor.isActive("imageUpload");
    },
    element: document.querySelector("tiptob-image-bubble-menu"),
  });
}
