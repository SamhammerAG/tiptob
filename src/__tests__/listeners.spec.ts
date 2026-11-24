import { afterEach, describe, expect, it } from "vitest";
import { flushSync, mount, unmount, type Component } from "svelte";
import { Editor } from "@tiptap/core";
import { StarterKit } from "@tiptap/starter-kit";
import BoldAction from "../plugins/Bold/BoldAction.svelte";
import HyperlinkAction from "../plugins/Hyperlink/HyperlinkAction.svelte";
import RedoAction from "../plugins/Redo/RedoAction.svelte";
import UndoAction from "../plugins/Undo/UndoAction.svelte";
import { listenerCount, reactiveProps, stubDropdownApis } from "./test-utils.svelte";

stubDropdownApis();

afterEach(() => {
  document.body.innerHTML = "";
});

// the generic Component type doesn't accept the concrete prop types of each action
const actions = { BoldAction, HyperlinkAction, UndoAction, RedoAction } as unknown as Record<string, Component<{ editor: Editor }>>;

describe("transaction listeners", () => {
  it.each(Object.keys(actions))("%s removes its listeners on unmount", (name) => {
    const editor = new Editor({ extensions: [StarterKit] });
    const before = { transaction: listenerCount(editor, "transaction"), update: listenerCount(editor, "update") };

    for (let i = 0; i < 10; i++) {
      const component = mount(actions[name], { target: document.body, props: { editor } });
      flushSync();
      unmount(component);
    }

    expect(listenerCount(editor, "transaction")).toBe(before.transaction);
    expect(listenerCount(editor, "update")).toBe(before.update);
  });

  it.each(Object.keys(actions))("%s moves its listeners when the editor is swapped", (name) => {
    const first = new Editor({ extensions: [StarterKit] });
    const second = new Editor({ extensions: [StarterKit] });
    const before = listenerCount(first, "transaction");

    const props = reactiveProps({ editor: first });
    const component = mount(actions[name], { target: document.body, props });
    flushSync();
    const registered = listenerCount(first, "transaction") - before;

    props.editor = second;
    flushSync();
    expect(listenerCount(first, "transaction")).toBe(before);
    expect(listenerCount(second, "transaction") - before).toBe(registered);

    unmount(component);
    expect(listenerCount(second, "transaction")).toBe(before);
  });
});

describe("two editors", () => {
  const content = '<p><strong>bold</strong> plain <a href="https://saved.example/">link</a></p>';
  const createEditor = () => new Editor({ extensions: [StarterKit], content });
  const positionOf = (editor: Editor, text: string) => editor.state.doc.textContent.indexOf(text) + 2;

  function mountToolbar(props: { editor: Editor }) {
    const target = document.body.appendChild(document.createElement("div"));
    for (const action of [BoldAction, UndoAction, HyperlinkAction] as unknown as Component<{ editor: Editor }>[]) {
      mount(action, { target, props });
    }
    flushSync();
    const [bold, undo, link] = target.querySelectorAll(":scope > button, :scope > div > button");
    return { bold, undo, link, input: () => target.querySelector<HTMLInputElement>("#tiptob-link-input") };
  }

  it("each toolbar only follows its own editor", () => {
    const first = createEditor();
    const second = createEditor();
    const firstToolbar = mountToolbar({ editor: first });
    const secondToolbar = mountToolbar({ editor: second });

    first.commands.setTextSelection(positionOf(first, "bold"));
    second.commands.setTextSelection(positionOf(second, "plain"));
    flushSync();
    expect(firstToolbar.bold.classList.contains("highlighted")).toBe(true);
    expect(secondToolbar.bold.classList.contains("highlighted")).toBe(false);

    first.commands.insertContent("x");
    flushSync();
    expect((firstToolbar.undo as HTMLButtonElement).disabled).toBe(false);
    expect((secondToolbar.undo as HTMLButtonElement).disabled).toBe(true);

    second.commands.setTextSelection(positionOf(second, "link"));
    flushSync();
    expect(firstToolbar.input()).toBeNull();
    expect(secondToolbar.input().value).toBe("https://saved.example/");
  });

  it("a shared toolbar follows the editor it is switched to and ignores the previous one", () => {
    const first = createEditor();
    const second = createEditor();
    const props = reactiveProps({ editor: first });
    const toolbar = mountToolbar(props);

    first.commands.setTextSelection(positionOf(first, "bold"));
    first.commands.insertContent("x");
    flushSync();
    expect(toolbar.bold.classList.contains("highlighted")).toBe(true);
    expect((toolbar.undo as HTMLButtonElement).disabled).toBe(false);

    second.commands.setTextSelection(positionOf(second, "plain"));
    props.editor = second;
    flushSync();
    expect(toolbar.bold.classList.contains("highlighted")).toBe(false);
    expect((toolbar.undo as HTMLButtonElement).disabled).toBe(true);

    second.commands.setTextSelection(positionOf(second, "link"));
    flushSync();
    const input = toolbar.input();
    input.value = "https://typed.example/";
    input.dispatchEvent(new Event("input"));
    first.commands.setTextSelection(positionOf(first, "plain"));
    first.commands.insertContent("y");
    flushSync();
    expect(input.value).toBe("https://typed.example/");
    expect(toolbar.bold.classList.contains("highlighted")).toBe(false);
  });
});

describe("HyperlinkAction", () => {
  it("keeps the url the user is typing on transactions that change neither doc nor selection", () => {
    const editor = new Editor({ extensions: [StarterKit], content: '<p><a href="https://saved.example/">link</a> text</p>' });
    mount(HyperlinkAction, { target: document.body, props: { editor, language: "en" } });
    flushSync();

    editor.commands.setTextSelection(3);
    flushSync();
    const input = document.body.querySelector<HTMLInputElement>("#tiptob-link-input");
    expect(input.value).toBe("https://saved.example/");

    input.value = "https://typed.example/";
    input.dispatchEvent(new Event("input"));
    editor.view.dispatch(editor.state.tr.setMeta("focus", true));
    flushSync();
    expect(input.value).toBe("https://typed.example/");

    editor.commands.setTextSelection(4);
    flushSync();
    expect(input.value).toBe("https://saved.example/");
  });
});

describe("SimpleButton", () => {
  it("highlights bold after toggling it on an empty selection", () => {
    const editor = new Editor({ extensions: [StarterKit], content: "<p>text</p>" });
    mount(BoldAction, { target: document.body, props: { editor, language: "en" } });
    flushSync();
    const button = document.body.querySelector("button");
    expect(button.classList.contains("highlighted")).toBe(false);

    editor.commands.toggleBold();
    flushSync();
    expect(button.classList.contains("highlighted")).toBe(true);
  });
});
