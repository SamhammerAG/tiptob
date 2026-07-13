import BubbleMenu from "@tiptap/extension-bubble-menu";
import { Editor, Extension, posToDOMRect } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";

export function getBubbleMenuExtension(getEditor: () => Editor): Extension {
  return BubbleMenu.extend({ name: "imageBubbleMenu" }).configure({
    pluginKey: new PluginKey("imageBubbleMenu"),
    updateDelay: 0,
    options: {
      strategy: "fixed",
      flip: false,
      autoPlacement: {
        allowedPlacements: ["top", "bottom"],
      },
      shift: { crossAxis: true },
    },
    getReferencedVirtualElement: () => {
      const { state, view } = getEditor();
      const { from, to } = state.selection;
      const imageDom = view.nodeDOM(from) as HTMLElement | null;

      if (imageDom && typeof imageDom.getBoundingClientRect === "function") {
        return imageDom;
      }

      return { getBoundingClientRect: () => posToDOMRect(view, from, to) };
    },
    shouldShow: ({ editor }) => {
      return editor.isEditable && editor.isActive("imageUpload");
    },
    element: document.querySelector("tiptob-image-bubble-menu"),
  });
}
