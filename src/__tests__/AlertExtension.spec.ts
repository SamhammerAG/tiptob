import { describe, expect, it } from "vitest";
import { Editor } from "@tiptap/core";
import { StarterKit } from "@tiptap/starter-kit";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import { Markdown } from "@tiptap/markdown";
import { AlertExtension } from "../plugins/Alert/AlertExtension";

const editor = new Editor({
  extensions: [StarterKit.configure({ trailingNode: false }), Table, TableRow, TableHeader, TableCell, Markdown, AlertExtension.configure({ language: "de" })],
});

describe("AlertExtension markdown", () => {
  it.each([
    ["note", "> [!NOTE]\n> Useful information."],
    ["tip", "> [!TIP]\n> Helpful advice."],
    ["important", "> [!IMPORTANT]\n> Key information."],
    ["warning", "> [!WARNING]\n> Urgent info."],
    ["caution", "> [!CAUTION]\n> Risks."],
    ["formatted text", "> [!NOTE]\n> **bold** *italic* [link](https://example.com)"],
    ["multiple paragraphs", "> [!NOTE]\n> first\n>\n> second"],
    ["bullet list", "> [!TIP]\n> intro\n>\n> - a\n> - b"],
    ["ordered list", "> [!TIP]\n> 1. a\n> 2. b"],
    ["line break", "> [!WARNING]\n> a  \n> b"],
    ["text after the alert", "> [!NOTE]\n> a\n\nafter"],
    ["empty paragraphs", "> [!NOTE]\n> a\n>\n>\n>\n> b"],
    ["alert in a list item", "- a\n  > [!NOTE]\n  > b"],
    ["plain blockquote", "> just a quote"],
  ])("round-trips %s", (_name, markdown) => {
    editor.commands.setContent(markdown, { contentType: "markdown" });

    expect(editor.getMarkdown()).toBe(markdown);
  });

  it("parses the type and content", () => {
    editor.commands.setContent("> [!WARNING]\n> **Careful**", { contentType: "markdown" });

    expect(editor.getJSON().content?.[0]).toEqual({
      type: "alert",
      attrs: { type: "warning" },
      content: [{ type: "paragraph", content: [{ type: "text", text: "Careful", marks: [{ type: "bold" }] }] }],
    });
  });

  it("reads a lowercase marker and writes it uppercase", () => {
    editor.commands.setContent("> [!note]\n> a", { contentType: "markdown" });

    expect(editor.getMarkdown()).toBe("> [!NOTE]\n> a");
  });

  it.each([
    ["indented", "  > [!NOTE]\n  > a"],
    ["tab after the marker", "> [!NOTE]\t\n> a"],
  ])("reads an alert that is %s", (_name, markdown) => {
    editor.commands.setContent(markdown, { contentType: "markdown" });

    expect(editor.getMarkdown()).toBe("> [!NOTE]\n> a");
  });

  it("keeps an unknown type as blockquote", () => {
    editor.commands.setContent("> [!FOO]\n> a", { contentType: "markdown" });

    expect(editor.getJSON().content?.[0].type).toBe("blockquote");
  });

  it("keeps a marker followed by text as blockquote", () => {
    editor.commands.setContent("> [!NOTE] title\n> a", { contentType: "markdown" });

    expect(editor.getJSON().content?.[0].type).toBe("blockquote");
  });

  it("parses an alert without content as alert with an empty paragraph", () => {
    editor.commands.setContent("> [!NOTE]", { contentType: "markdown" });

    expect(editor.getJSON().content?.[0]).toEqual({ type: "alert", attrs: { type: "note" }, content: [{ type: "paragraph" }] });
  });

  it("ends the alert at a block that is not allowed in it", () => {
    editor.commands.setContent("> [!NOTE]\n> a\n>\n> ## heading\n>\n> b", { contentType: "markdown" });

    expect(editor.getJSON().content?.map((node) => node.type)).toEqual(["alert", "heading", "paragraph"]);
  });
});

describe("AlertExtension html", () => {
  it("renders the GitHub/Markdig classes without the title", () => {
    editor.commands.setContent("> [!TIP]\n> a", { contentType: "markdown" });

    expect(editor.getHTML()).toBe('<div class="markdown-alert markdown-alert-tip"><p>a</p></div>');
  });

  it("parses SSP html and drops its title", () => {
    editor.commands.setContent(
      '<div class="markdown-alert markdown-alert-caution"><p class="markdown-alert-title"><svg></svg>Caution</p><p>a</p></div>',
    );

    expect(editor.getMarkdown()).toBe("> [!CAUTION]\n> a");
  });

  it("keeps only the content of an alert that is not at the top level", () => {
    editor.commands.setContent('<ul><li><p>a</p><div class="markdown-alert markdown-alert-note"><p>b</p></div></li></ul>');

    expect(editor.getMarkdown()).toBe("- a\n\n  b");
  });
});

describe("AlertExtension paste", () => {
  // jsdom has no ClipboardEvent
  globalThis.ClipboardEvent ??= class extends Event {} as typeof ClipboardEvent;

  it("pastes an alert into an empty top-level paragraph", () => {
    editor.commands.setContent("<p>a</p><p></p>");
    editor.commands.setTextSelection(4);

    editor.view.pasteHTML('<div class="markdown-alert markdown-alert-tip"><p>b</p></div>');

    expect(editor.getMarkdown()).toBe("a\n\n> [!TIP]\n> b");
  });});

describe("AlertExtension commands", () => {
  it("wraps the selected paragraph", () => {
    editor.commands.setContent("<p>a</p><p>b</p>");
    editor.commands.setTextSelection(1);

    expect(editor.commands.setAlert("important")).toBe(true);
    expect(editor.getMarkdown()).toBe("> [!IMPORTANT]\n> a\n\nb");
  });

  it("wraps the whole list when the cursor is in a list item", () => {
    editor.commands.setContent("<ul><li><p>a</p></li><li><p>b</p></li></ul>");
    editor.commands.setTextSelection(3);

    editor.commands.setAlert("note");

    expect(editor.getMarkdown()).toBe("> [!NOTE]\n> - a\n> - b");
  });

  it("changes the type of the surrounding alert", () => {
    editor.commands.setContent("> [!NOTE]\n> a", { contentType: "markdown" });
    editor.commands.setTextSelection(2);

    editor.commands.setAlert("caution");

    expect(editor.getMarkdown()).toBe("> [!CAUTION]\n> a");
  });

  it("removes the alert and keeps its content", () => {
    editor.commands.setContent("> [!NOTE]\n> a\n>\n> b", { contentType: "markdown" });
    editor.commands.setTextSelection(2);

    expect(editor.commands.unsetAlert()).toBe(true);
    expect(editor.getMarkdown()).toBe("a\n\nb");
  });

  it("leaves the alert on Enter in an empty last paragraph", () => {
    editor.commands.setContent('<div class="markdown-alert markdown-alert-note"><p>a</p><p></p></div>');
    editor.commands.setTextSelection(5);

    editor.commands.keyboardShortcut("Enter");

    expect(editor.getJSON().content?.map((node) => node.type)).toEqual(["alert", "paragraph"]);
  });

  it("can not wrap a heading", () => {
    editor.commands.setContent("<h2>a</h2>");
    editor.commands.setTextSelection(1);

    expect(editor.commands.setAlert("note")).toBe(false);
  });

  it("can not be inserted in a table cell", () => {
    editor.commands.setContent("<table><tr><td><p>a</p></td></tr></table>");
    editor.commands.setTextSelection(4);

    expect(editor.can().setAlert("note")).toBe(false);
  });

  it("can not be inserted in a blockquote", () => {
    editor.commands.setContent("<blockquote><p>a</p></blockquote>");
    editor.commands.setTextSelection(2);

    expect(editor.can().setAlert("note")).toBe(false);
  });
});

describe("AlertExtension input rule", () => {
  it("turns a quote into an alert when the marker is typed at its start", () => {
    editor.commands.setContent("<blockquote><p>[!warning]</p><p>b</p></blockquote>");
    editor.commands.setTextSelection(12);

    editor.view.someProp("handleTextInput", (handle) => handle(editor.view, 12, 12, " ", () => editor.state.tr));

    expect(editor.getJSON().content?.[0]).toEqual({
      type: "alert",
      attrs: { type: "warning" },
      content: [{ type: "paragraph" }, { type: "paragraph", content: [{ type: "text", text: "b" }] }],
    });
  });

  it("ignores the marker in a later paragraph of the quote", () => {
    editor.commands.setContent("<blockquote><p>a</p><p>[!NOTE]</p></blockquote>");
    editor.commands.setTextSelection(12);

    editor.view.someProp("handleTextInput", (handle) => handle(editor.view, 12, 12, " ", () => editor.state.tr));

    expect(editor.getJSON().content?.[0].type).toBe("blockquote");
  });

  it("ignores the marker outside a quote", () => {
    editor.commands.setContent("<p>[!NOTE]</p>");
    editor.commands.setTextSelection(8);

    editor.view.someProp("handleTextInput", (handle) => handle(editor.view, 8, 8, " ", () => editor.state.tr));

    expect(editor.getJSON().content?.[0].type).toBe("paragraph");
  });
});

describe("AlertExtension node view", () => {
  it("shows the translated title as text only", () => {
    editor.commands.setContent("> [!WARNING]\n> a", { contentType: "markdown" });

    const title = editor.view.dom.querySelector(".markdown-alert-warning > .markdown-alert-title");
    expect(title?.textContent).toBe("Warnung");
    expect(title?.querySelector("svg")).toBeNull();
  });

  it("shows the English title for other languages", () => {
    const french = new Editor({
      extensions: [StarterKit, AlertExtension.configure({ language: "fr" as "en" })],
      content: '<div class="markdown-alert markdown-alert-tip"><p>a</p></div>',
    });

    expect(french.view.dom.querySelector(".markdown-alert-title")?.textContent).toBe("Tip");
  });
});
