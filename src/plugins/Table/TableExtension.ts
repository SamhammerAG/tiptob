import BubbleMenu from "@tiptap/extension-bubble-menu";
import { Editor, Extension, NodePos, posToDOMRect } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import { bubbleMenuAutoUpdate } from "../../utils/bubble-menu";

const tableBubbleMenuPluginKey = new PluginKey("tableBubbleMenu");

export function getBubbleMenuExtension(menuProps?: { language?: "de" | "en"; hiddenButtons?: string[] }): Extension {
  let editor: Editor;
  const element = document.createElement("tiptob-table-bubble-menu");
  Object.assign(element, menuProps);

  return BubbleMenu.extend({
    name: "tableBubbleMenu",
    // Before the view and so the bubble menu plugin are created, which may already need the editor.
    onBeforeCreate() {
      editor = this.editor;
      Object.assign(element, { editor });
    },
    onDestroy() {
      element.remove();
    },
  }).configure({
    pluginKey: tableBubbleMenuPluginKey,
    options: {
      strategy: "fixed",
      placement: "bottom",
      flip: {
        fallbackPlacements: ["top"],
      },
      shift: { crossAxis: true, padding: 8 },
      hide: { strategy: "referenceHidden" },
      ...bubbleMenuAutoUpdate(() => editor, element, tableBubbleMenuPluginKey),
    },
    getReferencedVirtualElement: () => {
      const { state, view } = editor;
      const myNodePos = new NodePos(state.selection.$anchor, editor);
      const tableElement = findParentTableFromPos(myNodePos);
      if (tableElement) {
        return tableElement;
      }

      return { getBoundingClientRect: () => posToDOMRect(view, 0, 0) };
    },
    shouldShow: ({ editor, element, view }) => {
      // Without the focus check the menu shows during plugin construction when the doc starts with a table, and gets stuck.
      const hasFocus = view.hasFocus() || element.contains(document.activeElement);

      return (
        hasFocus &&
        editor.isEditable &&
        editor.isActive("table") &&
        !editor.isActive("link") &&
        !editor.isActive("image") &&
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
