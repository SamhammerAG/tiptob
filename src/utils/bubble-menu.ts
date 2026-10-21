import { autoUpdate, getOverflowAncestors } from "@floating-ui/dom";
import type { Editor } from "@tiptap/core";
import type { PluginKey } from "@tiptap/pm/state";

// Tiptap v3 repositions bubble menus only on selection/doc changes and window
// scroll, so scrolling a nested container of the host app leaves the menu
// stuck. Floating UI's autoUpdate watches scroll and resize of all overflow
// ancestors of the editor; while the menu is shown, it triggers the plugin's
// official "updatePosition" meta transaction.
export function bubbleMenuAutoUpdate(getEditor: () => Editor, element: HTMLElement, pluginKey: PluginKey) {
  let stopAutoUpdate: (() => void) | null = null;

  const stop = () => {
    stopAutoUpdate?.();
    stopAutoUpdate = null;
  };

  return {
    onShow: () => {
      const editor = getEditor();
      if (!editor?.view) {
        return;
      }
      stopAutoUpdate = autoUpdate(editor.view.dom, element, () => {
        if (editor.isDestroyed) {
          return;
        }
        editor.view.dispatch(editor.state.tr.setMeta(pluginKey, "updatePosition"));
      });
    },
    onHide: stop,
    onDestroy: stop,
  };
}

// The menu is positioned "fixed", so Floating UI only uses the viewport as
// boundary. A table cut off by a scrolling container of the host app would
// then get its menu outside of that container. Using the overflow ancestors
// of the editor as boundary keeps the menu inside the visible editor area.
export function editorBoundary(editor: Editor): Element[] {
  return getOverflowAncestors(editor.view.dom).filter((ancestor) => ancestor instanceof Element);
}
