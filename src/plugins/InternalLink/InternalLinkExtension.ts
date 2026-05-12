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

export default function getInternalLinkExtension(): Mark {
  return Mark.create({
    name: "internalLink",
    inclusive: false,

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
          ({ chain }) => {
            return chain().focus().extendMarkRange(this.name).unsetMark(this.name).run();
          },
      };
    },
  });
}
