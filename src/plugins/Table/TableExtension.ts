import BubbleMenu from "@tiptap/extension-bubble-menu";
import { Editor, Extension, NodePos, posToDOMRect } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";



export function getBubbleMenuExtension(getEditor: () => Editor): Extension {
  return BubbleMenu.configure({
    pluginKey: new PluginKey("tableBubbleMenu"),
    tippyOptions: {
      animation: true,
      maxWidth: "none",
      placement: "bottom",
      popperOptions: {
        modifiers: [
          {
            name: 'preventOverflow',
            options: {
              altAxis: true,
              tether: true,
            }
          }
        ]
      },
      getReferenceClientRect: () => {
        const { state, view } = getEditor();
        const myNodePos = new NodePos(state.selection.$anchor, getEditor());
        const tableElement = findParentTableFromPos(myNodePos);
        if (tableElement) {
          return tableElement.getBoundingClientRect();
        }

        return posToDOMRect(view, 0, 0);
      },
    },
    shouldShow: ({ editor }) => {
      return editor.isEditable && editor.isActive("table") && !editor.isActive("link") && !editor.isActive("imageUpload");
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
