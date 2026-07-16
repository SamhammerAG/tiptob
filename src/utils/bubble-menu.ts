import { autoUpdate } from "@floating-ui/dom";
import type { Editor } from "@tiptap/core";
import type { PluginKey } from "@tiptap/pm/state";

// The v3 bubble menu plugin only hides the element on a show→hide transition.
// Until the first show, the element stays visible in normal flow where the
// host placed it, so it must start out hidden and out of flow.
export function getBubbleMenuElement(selector: string): HTMLElement | null {
  const element = document.querySelector<HTMLElement>(selector);
  if (element) {
    element.style.visibility = "hidden";
    element.style.position = "fixed";
  }
  return element;
}

// Tiptap v3 repositions bubble menus only on selection/doc changes and window
// scroll, so scrolling a nested container of the host app leaves the menu
// stuck. Floating UI's autoUpdate watches scroll and resize of all overflow
// ancestors of the editor; while the menu is shown, it triggers the plugin's
// official "updatePosition" meta transaction.
export function bubbleMenuAutoUpdate(getEditor: () => Editor, element: HTMLElement | null, pluginKey: PluginKey) {
  let stopAutoUpdate: (() => void) | null = null;

  const stop = () => {
    stopAutoUpdate?.();
    stopAutoUpdate = null;
  };

  return {
    onShow: () => {
      if (!element) {
        return;
      }
      const editor = getEditor();
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
