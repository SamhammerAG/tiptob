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

// Wiki-link-style `[[id|text]]` syntax for markdown. The lazy `.*?` normally stops at the first
// "]]" it finds - but `(?!\])` rejects that stop if a third "]" immediately follows, forcing the
// lazy match to grow by one more character and try again. That's what lets text end in a literal
// "]" (e.g. a title like "Roadmap [Q4]"): "[[5|Roadmap [Q4]]]" first tries to stop after "Q4",
// sees a third "]" right after, and grows to include it, then stops cleanly at the real "]]".
// A "]]" that isn't immediately followed by another "]" (the common case) is accepted right away,
// so unrelated "]]" appearing later in the same line - e.g. a second link - is never swallowed.
const INTERNAL_LINK_MARKDOWN_REGEX = /^\[\[(?<id>\d+)\|(?<text>.*?)\]\](?!\])/;

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

    markdownTokenizer: {
      name: "internalLink",
      start: "[[",
      tokenize: (src, _tokens, lexer) => {
        const match = INTERNAL_LINK_MARKDOWN_REGEX.exec(src);
        if (!match?.groups) return undefined;

        return { type: "internalLink", raw: match[0], internalLinkId: match.groups.id, tokens: lexer.inlineTokens(match.groups.text) };
      },
    },
    parseMarkdown: (token, helpers) =>
      helpers.applyMark("internalLink", helpers.parseInline(token.tokens ?? []), { internalLinkId: token.internalLinkId }),
    renderMarkdown: (node, helpers) => `[[${node.attrs?.internalLinkId ?? ""}|${helpers.renderChildren(node)}]]`,
  });
}
