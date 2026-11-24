import { afterEach, describe, expect, it } from "vitest";
import { flushSync, mount } from "svelte";
import { Editor, isActive } from "@tiptap/core";
import { StarterKit } from "@tiptap/starter-kit";
import { TextAlign } from "@tiptap/extension-text-align";
import { AllSelection, NodeSelection, TextSelection, type Selection } from "@tiptap/pm/state";
import TextAlignAction from "../plugins/TextAlign/TextAlignAction.svelte";
import { getActiveAlignments } from "../utils/text-align";
import { stubDropdownApis } from "./test-utils.svelte";

stubDropdownApis();

const alignments = ["left", "center", "right", "justify"];

const content = [
  '<p style="text-align: center">center one</p>',
  '<p style="text-align: center">center two</p>',
  '<p style="text-align: left">left</p>',
  "<p>default</p>",
  '<blockquote><p style="text-align: center">quote one</p><p style="text-align: center">quote two</p></blockquote>',
  '<ul><li><p style="text-align: right">item</p></li><li><p style="text-align: right">item</p></li></ul>',
  '<h2 style="text-align: justify">heading</h2>',
  "<hr>",
].join("");

function createEditor() {
  return new Editor({ extensions: [StarterKit, TextAlign.configure({ types: ["heading", "paragraph"] })], content });
}

/** Text positions of the given paragraphs, in document order. */
function textPositions(editor: Editor, ...texts: string[]) {
  const positions: number[] = [];
  editor.state.doc.descendants((node, pos) => {
    if (node.isText && texts.includes(node.text)) positions.push(pos + 1);
  });
  return positions;
}

describe("getActiveAlignments", () => {
  it("matches editor.isActive for every selection", () => {
    const editor = createEditor();
    const { doc } = editor.state;
    const selections: Selection[] = [new AllSelection(doc)];

    for (let anchor = 0; anchor <= doc.content.size; anchor++) {
      for (let head = anchor; head <= doc.content.size; head++) {
        selections.push(TextSelection.between(doc.resolve(anchor), doc.resolve(head)));
      }
      const node = doc.resolve(anchor).nodeAfter;
      if (node && NodeSelection.isSelectable(node)) selections.push(NodeSelection.create(doc, anchor));
    }

    for (const selection of selections) {
      const state = editor.state.apply(editor.state.tr.setSelection(selection));
      const active = getActiveAlignments(state);
      for (const textAlign of alignments) {
        expect(active.has(textAlign), `${textAlign} at ${selection.from}-${selection.to}`).toBe(isActive(state, null, { textAlign }));
      }
    }
  });
});

describe("TextAlignAction", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  function renderToolbar() {
    const editor = createEditor();
    mount(TextAlignAction, { target: document.body, props: { editor, language: "en" } });
    flushSync();
    const main = document.body.querySelector("button");
    return { editor, main };
  }

  function select(editor: Editor, from: number, to = from) {
    editor.commands.setTextSelection({ from, to });
    flushSync();
  }

  it.each([
    ["the cursor is in a left aligned paragraph", ["left"], false],
    ["the cursor is in a paragraph without alignment", ["default"], false],
    ["the cursor is in a centered paragraph", ["center one"], true],
    ["two centered paragraphs are selected", ["center one", "center two"], true],
    ["a centered and a left aligned paragraph are selected", ["center two", "left"], false],
  ])("highlights the button when %s: %s", (_case, texts, highlighted) => {
    const { editor, main } = renderToolbar();
    const positions = textPositions(editor, ...texts);
    select(editor, positions[0], texts.length > 1 ? positions.at(-1) + 2 : undefined);

    expect(main.classList.contains("highlighted")).toBe(highlighted);
  });

  it.each([
    ["center one", "Align center"],
    ["left", "Align left"],
    ["default", "Align left"],
    ["heading", "Justify"],
  ])("highlights only the matching option in the dropdown for %s", (text, expected) => {
    const { editor, main } = renderToolbar();
    select(editor, textPositions(editor, text)[0]);
    main.click();
    flushSync();

    const options = [...document.body.querySelectorAll(".text-align-dropdown button")];
    const highlighted = options.filter((button) => button.classList.contains("highlighted")).map((button) => button.getAttribute("title"));
    expect(highlighted).toEqual([expected]);
  });
});
