import BubbleMenu from "@tiptap/extension-bubble-menu";
import { Editor, Extension, findParentNode, posToDOMRect } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import { bubbleMenuAutoUpdate, editorBoundary } from "../../utils/bubble-menu";

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
      // above the row with the cursor, or below it at the top of the editor: a menu at the table would cover rows
      // of a table taller than the editor, and a scrolling wrapper around the table leaves it no room outside of it.
      // Centered on the row, so it doesn't jump sideways between columns.
      placement: "top",
      flip: () => ({ fallbackPlacements: ["bottom"], boundary: editorBoundary(editor) }),
      shift: () => ({ padding: 8, boundary: editorBoundary(editor) }),
      hide: () => ({ strategy: "referenceHidden", boundary: editorBoundary(editor) }),
      ...bubbleMenuAutoUpdate(() => editor, element, tableBubbleMenuPluginKey),
    },
    getReferencedVirtualElement: () => {
      const { state, view } = editor;
      const row = findParentNode((node) => node.type.spec.tableRole === "row")(state.selection);
      if (row) {
        return view.nodeDOM(row.pos) as Element;
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
