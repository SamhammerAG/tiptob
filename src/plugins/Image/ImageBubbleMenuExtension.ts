import BubbleMenu from "@tiptap/extension-bubble-menu";
import { Editor, Extension, posToDOMRect } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import { bubbleMenuAutoUpdate, getBubbleMenuElement } from "../../utils/bubble-menu";

export const imageBubbleMenuPluginKey = new PluginKey("imageBubbleMenu");

export function getBubbleMenuExtension(getEditor: () => Editor): Extension {
  const element = getBubbleMenuElement("tiptob-image-bubble-menu");

  return BubbleMenu.extend({ name: "imageBubbleMenu" }).configure({
    pluginKey: imageBubbleMenuPluginKey,
    updateDelay: 0,
    options: {
      strategy: "fixed",
      placement: "top",
      flip: {
        fallbackPlacements: ["bottom"],
      },
      shift: { crossAxis: true, padding: 8 },
      hide: { strategy: "referenceHidden" },
      ...bubbleMenuAutoUpdate(getEditor, element, imageBubbleMenuPluginKey),
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
    element,
  });
}
