import { findParentNode, InputRule, mergeAttributes, Node, type JSONContent } from "@tiptap/core";
import { NodeRange } from "@tiptap/pm/model";
import { findWrapping, liftTarget } from "@tiptap/pm/transform";
import type { EditorState } from "@tiptap/pm/state";

export const ALERT_TYPES = ["note", "tip", "important", "warning", "caution"] as const;

export type AlertType = (typeof ALERT_TYPES)[number];

export interface AlertOptions {
  language: "de" | "en";
  titles?: Partial<Record<AlertType, string>>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    alert: {
      /** Wraps the selected top-level blocks in an alert, or changes the type of the surrounding one. */
      setAlert: (type: AlertType) => ReturnType;
      /** Removes the surrounding alert and keeps its content. */
      unsetAlert: () => ReturnType;
    };
  }
}

export const ALERT_TITLES: Record<"de" | "en", Record<AlertType, string>> = {
  de: { note: "Hinweis", tip: "Tipp", important: "Wichtig", warning: "Warnung", caution: "Vorsicht" },
  en: { note: "Note", tip: "Tip", important: "Important", warning: "Warning", caution: "Caution" },
};

// the content Markdig renders and the SSP styles, so the box stays a short hint
const ALLOWED_CHILDREN = ["paragraph", "bulletList", "orderedList"];

// GitHub syntax as Markdig's UseAlertBlocks reads it: the marker alone on the first quote line
const MARKDOWN_REGEX = /^ {0,3}> ?\[!(note|tip|important|warning|caution)\][ \t]*(?:\n|$)((?: {0,3}>.*(?:\n|$))*)/i;

const findParentAlert = (state: EditorState) => findParentNode((node) => node.type.name === "alert")(state.selection);

export const AlertExtension = Node.create<AlertOptions>({
  name: "alert",
  group: "block",
  content: "(paragraph | bulletList | orderedList)+",
  defining: true,

  addOptions() {
    return { language: "en" };
  },

  addAttributes() {
    return {
      type: {
        default: "note",
        parseHTML: (element) => /markdown-alert-(note|tip|important|warning|caution)/.exec(element.className)?.[1] ?? "note",
        renderHTML: (attributes) => ({ class: `markdown-alert markdown-alert-${attributes.type}` }),
      },
    };
  },

  parseHTML() {
    return [
      // like Markdig without nested alerts: in a list, table or quote only the content is kept.
      // "doc/paragraph/" is a paste into a top-level paragraph.
      { tag: "div.markdown-alert", context: "doc/ | doc/paragraph/" },
      // the title of GitHub/SSP html is shown by the node view, it is not content
      { tag: "p.markdown-alert-title", ignore: true, priority: 60 },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes), 0];
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement("div");

      // text only: the icon is drawn by the consumer's css, like in the SSP
      const title = document.createElement("p");
      title.className = "markdown-alert-title";
      title.contentEditable = "false";

      const contentDOM = document.createElement("div");
      contentDOM.className = "markdown-alert-content";
      dom.append(title, contentDOM);

      const render = (type: AlertType) => {
        dom.className = `markdown-alert markdown-alert-${type}`;
        title.textContent = this.options.titles?.[type] ?? ALERT_TITLES[this.options.language][type];
      };
      render(node.attrs.type);

      // a changed type is updated in place, so the selection and IME input stay intact
      const update = (updated: typeof node) => {
        if (updated.type !== node.type) return false;
        render(updated.attrs.type);
        return true;
      };

      return { dom, contentDOM, update };
    };
  },

  addCommands() {
    return {
      setAlert:
        (type) =>
        ({ state, tr, dispatch, commands }) => {
          if (findParentAlert(state)) return commands.updateAttributes(this.name, { type });

          // like GitHub, alerts only live at the top level, so the range always spans whole top-level blocks
          const range = state.selection.$from.blockRange(state.selection.$to, (node) => node.type.name === "doc");
          const wrapping = range && findWrapping(range, this.type, { type });
          if (!wrapping) return false;

          if (dispatch) tr.wrap(range, wrapping);
          return true;
        },

      unsetAlert:
        () =>
        ({ state, tr, dispatch }) => {
          const alert = findParentAlert(state);
          if (!alert) return false;

          const content = new NodeRange(tr.doc.resolve(alert.start), tr.doc.resolve(alert.start + alert.node.content.size), alert.depth);
          const target = liftTarget(content);
          if (target === null) return false;

          if (dispatch) tr.lift(content, target);
          return true;
        },
    };
  },

  // like StarterKit's markdown shortcuts: "[!WARNING] " at the start of a top-level quote
  addInputRules() {
    return [
      new InputRule({
        find: /^\[!(note|tip|important|warning|caution)\]\s$/i,
        handler: ({ state, range, match }) => {
          const $start = state.doc.resolve(range.from);
          const quote = $start.node(1);
          if ($start.depth !== 2 || quote.type.name !== "blockquote" || $start.index(1) !== 0 || !this.type.validContent(quote.content)) {
            return null;
          }

          state.tr.delete(range.from, range.to).setNodeMarkup($start.before(1), this.type, { type: match[1].toLowerCase() });
        },
      }),
    ];
  },

  markdownTokenizer: {
    name: "alert",
    level: "block",
    start: (src) => src.search(/^ {0,3}> ?\[!/m),
    tokenize: (src, _tokens, lexer) => {
      const match = MARKDOWN_REGEX.exec(src);
      if (!match) return undefined;

      return {
        type: "alert",
        raw: match[0],
        alertType: match[1].toLowerCase(),
        tokens: lexer.blockTokens(match[2].replace(/^ {0,3}> ?/gm, "")),
      };
    },
  },

  // blocks not allowed in an alert (only in hand-written markdown) end it and follow it
  parseMarkdown: (token, helpers) => {
    // inside a list marked returns paragraphs as "text" tokens
    const tokens = (token.tokens ?? []).map((child) => (child.type === "text" ? { ...child, type: "paragraph" } : child));
    // keeps empty paragraphs, like the blockquote
    const children: JSONContent[] = (helpers.parseBlockChildren ?? helpers.parseChildren)(tokens);
    const end = children.findIndex((child) => !ALLOWED_CHILDREN.includes(child.type ?? ""));
    const content = children.splice(0, end === -1 ? children.length : end);

    return [{ type: "alert", attrs: { type: token.alertType }, content: content.length ? content : [{ type: "paragraph" }] }, ...children];
  },

  renderMarkdown: (node, helpers) => {
    const body = helpers.renderChildren(node.content ?? [], "\n\n");
    return [`[!${node.attrs?.type.toUpperCase()}]`, ...body.split("\n")].map((line) => (line.trim() ? `> ${line}` : ">")).join("\n");
  },
});
