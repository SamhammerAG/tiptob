import BubbleMenu from "@tiptap/extension-bubble-menu";
import { Editor, Extension, NodePos, posToDOMRect } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";

export function getBubbleMenuExtension(getEditor: () => Editor): Extension {
  return BubbleMenu.extend({ name: "tableBubbleMenu" }).configure({
    pluginKey: new PluginKey("tableBubbleMenu"),
    options: {
      strategy: "fixed",
      flip: false,
      autoPlacement: {
        allowedPlacements: ["top", "bottom"],
      },
      shift: { crossAxis: true },
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
    element: document.querySelector("tiptob-table-bubble-menu"),
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
