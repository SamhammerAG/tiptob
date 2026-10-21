import { autoUpdate } from "@floating-ui/dom";
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
