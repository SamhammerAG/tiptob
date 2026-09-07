import { Mark, mergeAttributes } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    internalLink: {
      setInternalLink: (id: string, text?: string) => ReturnType;
      unsetInternalLink: () => ReturnType;
    };
  }
}

export interface InternalLinkAttrs {
  internalLinkId: string | null;
}

// Wiki-link-style `[[id|text]]` syntax for markdown
const INTERNAL_LINK_MARKDOWN_REGEX = /^\[\[(\d+)\|(.*?)\]\](?!\])/;

export default function getInternalLinkExtension(): Mark {
  return Mark.create({
    name: "internalLink",
    priority: 1000,
    inclusive: true,
    keepOnSplit: false,
    exitable: true,

    addAttributes() {
      return {
        internalLinkId: {
          default: null,
          parseHTML: (element) => element.getAttribute("internallinkid"),
          renderHTML: (attributes) => {
            if (!attributes.internalLinkId) return {};
            return { internallinkid: attributes.internalLinkId };
          },
        },
      };
    },

    parseHTML() {
      return [{ tag: "internallink[internallinkid]" }];
    },

    renderHTML({ HTMLAttributes }) {
      return ["internallink", mergeAttributes(HTMLAttributes), 0];
    },

    addCommands() {
      return {
        setInternalLink:
          (id, text) =>
          ({ chain, state, editor }) => {
            const { selection } = state;
            const { from, empty } = selection;

            if (editor.isActive("image") || editor.isActive("imageUpload")) {
              return chain().focus().setMark(this.name, { internalLinkId: id }).run();
            }

            if (editor.isActive(this.name)) {
              return chain()
                .focus()
                .extendMarkRange(this.name)
                .updateAttributes(this.name, { internalLinkId: id })
                .run();
            }

            if (empty) {
              if (!text) return false;
              return chain()
                .focus()
                .insertContentAt(from, {
                  type: "text",
                  text,
                  marks: [{ type: this.name, attrs: { internalLinkId: id } }],
                })
                .run();
            }

            return chain().focus().setMark(this.name, { internalLinkId: id }).run();
          },

        unsetInternalLink:
          () =>
          ({ chain, editor }) => {
            if (editor.isActive("image") || editor.isActive("imageUpload")) {
              return chain().focus().unsetMark(this.name).run();
            }
            return chain().focus().extendMarkRange(this.name).unsetMark(this.name).run();
          },
      };
    },
  }).extend({
    markdownTokenizer: {
      name: "internalLink",
      level: "inline",
      start: (src: string) => src.indexOf("[["),
      tokenize: (src: string) => {
        const match = INTERNAL_LINK_MARKDOWN_REGEX.exec(src);
        if (!match) return undefined;

        return { type: "internalLink", raw: match[0], internalLinkId: match[1], text: match[2] };
      },
    },
    parseMarkdown: (token, helpers) =>
      helpers.applyMark("internalLink", [helpers.createTextNode(token.text ?? "")], { internalLinkId: token.internalLinkId }),
    renderMarkdown: (node, helpers) => `[[${node.attrs?.internalLinkId ?? ""}|${helpers.renderChildren(node.content ?? [])}]]`,
  });
}
