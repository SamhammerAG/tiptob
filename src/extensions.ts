import ImageExtension from "./plugins/Image/ImageExtension";
import KnowledgeExtension from "./plugins/KnowledgeMark/KnowledgeMarkExtension";
import { getBubbleMenuExtension as TableBubbleMenuExtension } from "./plugins/Table/TableExtension";
import { SelectionDecoration } from "./plugins/Selection/SelectionPlugin";
import type { Editor } from "@tiptap/core";
import { ExtendedHighlight } from "./plugins/FontHighlight/HighlightExtension";
import { TokenExtension } from "./plugins/Token/TokenExtension";
import { SignatureExtension } from "./plugins/SignaturePlaceholder/SignatureExtension";

interface CustomHTMLElement extends HTMLElement {
  editor: Editor;
  imageUpload: (file: File) => Promise<string>;
}

export {
  ImageExtension,
  KnowledgeExtension,
  SelectionDecoration,
  TableBubbleMenuExtension,
  ExtendedHighlight,
  TokenExtension,
  SignatureExtension,
  type CustomHTMLElement
};
