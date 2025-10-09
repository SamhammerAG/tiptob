import { Editor } from "https://esm.sh/@tiptap/core@2.26.0";
import {
  ImageExtension,
  SelectionDecoration,
  TableBubbleMenuExtension,
  ExtendedHighlight,
  TokenExtension,
} from "./src/extensions";

import Bold from "https://esm.sh/@tiptap/extension-bold@2.26.0";
import BulletList from "https://esm.sh/@tiptap/extension-bullet-list@2.26.0";
import Color from "https://esm.sh/@tiptap/extension-color@2.26.0";
import Document from "https://esm.sh/@tiptap/extension-document@2.26.0";
import Gapcursor from "https://esm.sh/@tiptap/extension-gapcursor@2.26.0";
import HardBreak from "https://esm.sh/@tiptap/extension-hard-break@2.26.0";
import History from "https://esm.sh/@tiptap/extension-history@2.26.0";
import Italic from "https://esm.sh/@tiptap/extension-italic@2.26.0";
import Link from "https://esm.sh/@tiptap/extension-link@2.26.0";
import ListItem from "https://esm.sh/@tiptap/extension-list-item@2.26.0";
import OrderdList from "https://esm.sh/@tiptap/extension-ordered-list@2.26.0";
import Paragraph from "https://esm.sh/@tiptap/extension-paragraph@2.26.0";
import Strike from "https://esm.sh/@tiptap/extension-strike@2.26.0";
import Table from "https://esm.sh/@tiptap/extension-table@2.26.0";
import TableCell from "https://esm.sh/@tiptap/extension-table-cell@2.26.0";
import TableHeader from "https://esm.sh/@tiptap/extension-table-header@2.26.0";
import TableRow from "https://esm.sh/@tiptap/extension-table-row@2.26.0";
import Text from "https://esm.sh/@tiptap/extension-text@2.26.0";
import TextAlign from "https://esm.sh/@tiptap/extension-text-align@2.26.0";
import TextStyle from "https://esm.sh/@tiptap/extension-text-style@2.26.0";
import Underline from "https://esm.sh/@tiptap/extension-underline@2.26.0";
import Heading from "https://esm.sh/@tiptap/extension-heading@2.26.0";

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
    Paragraph,
    Text,
    Heading,
    TextStyle.configure({ mergeNestedSpanStyles: true }),
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
    OrderdList,
    History,
    Strike,
    Underline,
    Table,
    TableRow,
    TableHeader,
    TableCell,
    TokenExtension,
    SelectionDecoration,
    ImageExtension(uploadInlineImage.bind(this)),
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
