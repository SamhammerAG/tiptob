import Color, { type ColorOptions } from "@tiptap/extension-color";

export const ExtendedColor = Color.extend<ColorOptions>({
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          color: {
            default: null,
            parseHTML: (element: HTMLElement) => {
              const c = element.style.color?.replace(/['"]+/g, "");
              if (!c) return null;
              const m = c.match(/\d+/g);
              if (m) {
                const [r, g, b] = m.map(Number);
                if (r + g + b < 130 || r + g + b > 720) return null;
              }
              return c;
            },
            renderHTML: (attributes: { color?: string | null }) => {
              if (!attributes.color) return {};
              return { style: `color: ${attributes.color}` };
            },
          },
        },
      },
    ];
  },
});
