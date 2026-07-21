import { Editor } from "https://esm.sh/@tiptap/core@3.27.3";
import { ImageExtension, SelectionDecoration, TableBubbleMenuExtension, ExtendedHighlight, FontSizeExtension } from "https://esm.sh/@samhammer/tiptob/extensions.js";
import { Bold } from "https://esm.sh/@tiptap/extension-bold@3.27.3";
import { BulletList, ListItem, OrderedList } from "https://esm.sh/@tiptap/extension-list@3.27.3";
import { Color } from "https://esm.sh/@tiptap/extension-color@3.27.3";
import { Document } from "https://esm.sh/@tiptap/extension-document@3.27.3";
import { Gapcursor, UndoRedo } from "https://esm.sh/@tiptap/extensions@3.27.3";
import { HardBreak } from "https://esm.sh/@tiptap/extension-hard-break@3.27.3";
import { Italic } from "https://esm.sh/@tiptap/extension-italic@3.27.3";
import { Link } from "https://esm.sh/@tiptap/extension-link@3.27.3";
import { Paragraph } from "https://esm.sh/@tiptap/extension-paragraph@3.27.3";
import { Strike } from "https://esm.sh/@tiptap/extension-strike@3.27.3";
import { Table, TableCell, TableHeader, TableRow } from "https://esm.sh/@tiptap/extension-table@3.27.3";
import { Text } from "https://esm.sh/@tiptap/extension-text@3.27.3";
import { TextAlign } from "https://esm.sh/@tiptap/extension-text-align@3.27.3";
import { TextStyle } from "https://esm.sh/@tiptap/extension-text-style@3.27.3";
import { Underline } from "https://esm.sh/@tiptap/extension-underline@3.27.3";

function uploadInlineImage(file) {
  // Replace this with your actual upload logic
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate upload and return a dummy URL
      resolve('https://your.cdn.com/' + file.name);
    }, 1000);
  });
}
var tableBubbleMenu = document.querySelector("tiptob-table-bubble-menu");

const editor = new Editor({
  element: document.querySelector(".text-area") || undefined,
  content: "<p>Hello World! 🌍</p>",
  extensions: [
    Paragraph,
    Text,
    TextStyle,
    FontSizeExtension,
    Color,
    Document,
    Gapcursor,
    Bold,
    Italic,
    ListItem,
    HardBreak,
    BulletList,
    ExtendedHighlight.configure({
      multicolor: true,
    }),
    OrderedList,
    UndoRedo,
    Strike,
    Underline,
    Table,
    TableRow,
    TableHeader,
    TableCell,
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
    Link.configure({
      openOnClick: false,
      defaultProtocol: "https",
      protocols: ["https"],
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
document.querySelector("tiptob-image-button").imageUpload = uploadInlineImage.bind(this);
document.querySelector("tiptob-table-button").editor = editor;
document.querySelector("tiptob-undo-button").editor = editor;
document.querySelector("tiptob-redo-button").editor = editor;
document.querySelector("tiptob-remove-format-button").editor = editor;
tableBubbleMenu.editor = editor;
