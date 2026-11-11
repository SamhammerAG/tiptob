import ImageExtension from "./plugins/Image/ImageExtension";
import InternalLinkExtension from "./plugins/InternalLink/InternalLinkExtension";
import KnowledgeExtension from "./plugins/KnowledgeMark/KnowledgeMarkExtension";
import { getBubbleMenuExtension as TableBubbleMenuExtension } from "./plugins/Table/TableExtension";
import { SelectionDecoration } from "./plugins/Selection/SelectionPlugin";
import type { Editor } from "@tiptap/core";
import { ExtendedHighlight } from "./plugins/FontHighlight/HighlightExtension";
import { ExtendedColor } from "./plugins/FontColor/FontColorExtension";
import { TokenExtension } from "./plugins/Token/TokenExtension";
import { SignatureExtension } from "./plugins/SignaturePlaceholder/SignatureExtension";
import { FontSizeExtension } from "./plugins/FontSize/FontSizeExtension";
import { AlertExtension, type AlertType, type AlertOptions } from "./plugins/Alert/AlertExtension";

interface CustomHTMLElement extends HTMLElement {
  editor: Editor;
  imageUpload: (file: File) => Promise<string>;
}

export {
  ImageExtension,
  InternalLinkExtension,
  KnowledgeExtension,
  SelectionDecoration,
  TableBubbleMenuExtension,
  ExtendedHighlight,
  ExtendedColor,
  TokenExtension,
  FontSizeExtension,
  SignatureExtension,
  AlertExtension,
  type AlertType,
  type AlertOptions,
  type CustomHTMLElement,
};
