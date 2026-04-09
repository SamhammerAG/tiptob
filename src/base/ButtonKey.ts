import type { Editor } from "@tiptap/core";

export type ButtonKey =
  | string
  | { name: string; attributes?: object }
  | { attributes: object }
  | { isActive: (editor: Editor) => boolean };
