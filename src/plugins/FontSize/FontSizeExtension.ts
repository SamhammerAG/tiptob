import { Extension } from "@tiptap/core";

interface FontSizeOptions {
  types: string[];
}

interface RemoveEmptyTextStyleChain {
  removeEmptyTextStyle?: () => {
    run: () => boolean;
  };
  run: () => boolean;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (fontSize: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

export const FontSizeExtension = Extension.create<FontSizeOptions>({
  name: "fontSize",

  addOptions() {
    return {
      types: ["textStyle"],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element: HTMLElement) => {
              return element.style.fontSize || null;
            },
            renderHTML: (attributes: { fontSize?: string | null }) => {
              if (!attributes.fontSize) {
                return {};
              }

              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }) => {
          return chain().setMark("textStyle", { fontSize }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }) => {
          const textStyleChain = chain().setMark("textStyle", {
            fontSize: null,
          }) as RemoveEmptyTextStyleChain;

          return textStyleChain.removeEmptyTextStyle?.().run() ?? textStyleChain.run();
        },
    };
  },
});
