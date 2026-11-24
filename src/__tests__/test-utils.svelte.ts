import type { Editor } from "@tiptap/core";

/** Props whose later changes reach the mounted component, like assigning a property of the web component. */
export function reactiveProps<T extends object>(initial: T): T {
  const props = $state(initial);
  return props;
}

export function listenerCount(editor: Editor, event: string): number {
  return (editor as unknown as { callbacks: Record<string, unknown[]> }).callbacks[event]?.length ?? 0;
}

/** jsdom has neither popovers nor the Web Animations API, both of which the dropdowns use. */
export function stubDropdownApis() {
  HTMLElement.prototype.showPopover ??= () => {};
  Element.prototype.animate ??= () => ({ cancel() {}, playState: "finished" }) as unknown as Animation;
}
