import { Editor } from "@tiptap/core";
import {
  ImageExtension,
  SelectionDecoration,
  TableBubbleMenuExtension,
  ExtendedHighlight,
  TokenExtension,
  FontSizeExtension,
} from "./src/extensions";

import { Color } from "@tiptap/extension-color";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { StarterKit } from "@tiptap/starter-kit";

function uploadInlineImage(file) {
  // Replace this with your actual upload logic
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate upload and return a dummy URL
      resolve("https://your.cdn.com/" + file.name);
    }, 1000);
  });
}
var tableBubbleMenu = document.querySelector("tiptob-table-bubble-menu");

const editor = new Editor({
  element: document.querySelector(".text-area") || undefined,
  content: "<p>Hello World!  {{ token.id }} </p>",
  extensions: [
    StarterKit.configure({
      link: {
        openOnClick: false,
        defaultProtocol: "https",
        protocols: ["https"],
      },
    }),
    TextStyle,
    FontSizeExtension,
    Color,
    ExtendedHighlight.configure({
      multicolor: true,
    }),
    Table,
    TableRow,
    TableHeader,
    TableCell,
    TokenExtension,
    SelectionDecoration,
    ImageExtension(uploadInlineImage.bind(this)).configure({
      inline: true,
      allowBase64: true,
      resize: {
        enabled: true,
        directions: ["top-left", "top-right", "bottom-left", "bottom-right"],
        minWidth: 24,
        minHeight: 24,
        alwaysPreserveAspectRatio: true,
      },
    }),
    TableBubbleMenuExtension(() => editor),
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
  ],
});

document.querySelector("tiptob-bold-button").editor = editor;
document.querySelector("tiptob-italic-button").editor = editor;
document.querySelector("tiptob-underline-button").editor = editor;
document.querySelector("tiptob-strike-button").editor = editor;
document.querySelector("tiptob-font-color-button").editor = editor;
document.querySelector("tiptob-font-highlight-button").editor = editor;
document.querySelector("tiptob-font-size-button").editor = editor;
document.querySelector("tiptob-text-align-button").editor = editor;
document.querySelector("tiptob-bullet-list-button").editor = editor;
document.querySelector("tiptob-ordered-list-button").editor = editor;
document.querySelector("tiptob-hyperlink-button").editor = editor;
document.querySelector("tiptob-image-button").editor = editor;
//document.querySelector("tiptob-image-button").imageUpload = uploadInlineImage.bind(this);
document.querySelector("tiptob-table-button").editor = editor;
document.querySelector("tiptob-undo-button").editor = editor;
document.querySelector("tiptob-redo-button").editor = editor;
document.querySelector("tiptob-remove-format-button").editor = editor;
document.querySelector("tiptob-token-button").editor = editor;
document.querySelector("tiptob-heading-button").editor = editor;
document.querySelector("tiptob-token-button").placeHolders = [
  { translation: "token.id", expression: "{{ token.id }}" },
  { translation: "token.id", expression: "{{ token.id }}" },
  { translation: "token.id", expression: "{{ token.id }}" },
  { translation: "token.id", expression: "{{ token.id }}" },
  { translation: "token.id", expression: "{{ token.id }}" },
  { translation: "token.id", expression: "{{ token.id }}" },
  { translation: "token.id", expression: "{{ token.id }}" },
  { translation: "token.id", expression: "{{ token.id }}" },
  { translation: "token.id", expression: "{{ token.id }}" },
  { translation: "token.id", expression: "{{ token.id }}" },
  { translation: "token.id", expression: "{{ token.id }}" },
  { translation: "token.id", expression: "{{ token.id }}" },
  { translation: "token.id", expression: "{{ token.id }}" },
  { translation: "token.id", expression: "{{ token.id }}" },
  { translation: "token.id", expression: "{{ token.id }}" },
  { translation: "token.id", expression: "{{ token.id }}" },
  { translation: "token.id", expression: "{{ token.id }}" },
  { translation: "token.id", expression: "{{ token.id }}" },
  { translation: "token.id", expression: "{{ token.id }}" },
  { translation: "token.id", expression: "{{ token.id }}" },
  { translation: "token.id", expression: "{{ token.id }}" },
  { translation: "token.id", expression: "{{ token.id }}" },
  { translation: "token.id", expression: "{{ token.id }}" },
  { translation: "token.id", expression: "{{ token.id }}" },
  { translation: "token.id", expression: "{{ token.id }}" },
  { translation: "token.id", expression: "{{ token.id }}" },
];

tableBubbleMenu.editor = editor;
