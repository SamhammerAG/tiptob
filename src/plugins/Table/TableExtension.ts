import BubbleMenu from "@tiptap/extension-bubble-menu";
import { Editor, Extension, NodePos, posToDOMRect } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import { bubbleMenuAutoUpdate, getBubbleMenuElement } from "../../utils/bubble-menu";

const tableBubbleMenuPluginKey = new PluginKey("tableBubbleMenu");

export function getBubbleMenuExtension(getEditor: () => Editor): Extension {
  const element = getBubbleMenuElement("tiptob-table-bubble-menu");

  return BubbleMenu.extend({ name: "tableBubbleMenu" }).configure({
    pluginKey: tableBubbleMenuPluginKey,
    options: {
      strategy: "fixed",
      placement: "top",
      flip: {
        fallbackPlacements: ["bottom"],
      },
      shift: { crossAxis: true, padding: 8 },
      hide: { strategy: "referenceHidden" },
      ...bubbleMenuAutoUpdate(getEditor, element, tableBubbleMenuPluginKey),
    },
    getReferencedVirtualElement: () => {
      const editor = getEditor();
      const { state, view } = editor;
      const myNodePos = new NodePos(state.selection.$anchor, editor);
      const tableElement = findParentTableFromPos(myNodePos);
      if (tableElement) {
        return tableElement;
      }

      return { getBoundingClientRect: () => posToDOMRect(view, 0, 0) };
    },
    shouldShow: ({ editor }) => {
      return (
        editor.isEditable &&
        editor.isActive("table") &&
        !editor.isActive("link") &&
        !editor.isActive("imageUpload")
      );
    },
    element,
  });
}

function findParentTableFromPos(nodePos: NodePos): Element | null {
  if (nodePos.node.type.name === "table") {
    return nodePos.element;
  }

  const parentNode = nodePos.parent;
  if (parentNode) {
    return findParentTableFromPos(parentNode);
  }

  return null;
}
