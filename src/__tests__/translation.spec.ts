import { afterAll, afterEach, describe, expect, it } from "vitest";
import { flushSync, mount, unmount } from "svelte";
import { Editor } from "@tiptap/core";
import { StarterKit } from "@tiptap/starter-kit";
import { getTranslation } from "../utils/translation";
import { AlertExtension } from "../plugins/Alert/AlertExtension";
import AlertAction from "../plugins/Alert/AlertAction.svelte";
import BoldAction from "../plugins/Bold/BoldAction.svelte";
import HeadingAction from "../plugins/Heading/HeadingAction.svelte";
import InternalLinkAction from "../plugins/InternalLink/InternalLinkAction.svelte";

describe("getTranslation", () => {
  const translations = { de: "Fett", en: "Bold" };

  it.each([
    ["de", "Fett"],
    ["de-DE", "Fett"],
    ["DE", "Fett"],
    ["en", "Bold"],
    ["ja", "Bold"],
    ["constructor", "Bold"],
    ["", "Bold"],
    [undefined, "Bold"],
  ])("returns the translation for %s", (language, expected) => {
    expect(getTranslation(translations, language)).toBe(expected);
  });
});

describe("buttons in a language without translations", () => {
  const editor = new Editor({ extensions: [StarterKit, AlertExtension.configure({ language: "fr", titles: { note: "Remarque" } })] });
  let component: ReturnType<typeof mount> | undefined;

  afterEach(() => {
    if (component) unmount(component);
    component = undefined;
  });

  afterAll(() => editor.destroy());

  it.each([
    ["simple button", BoldAction, "Bold"],
    ["dropdown button", HeadingAction, "Headings"],
  ])("renders the %s with the english tooltip", (_name, Action, tooltip) => {
    component = mount(Action, { target: document.body, props: { editor, language: "ja" } });
    flushSync();

    expect(document.body.querySelector("button")?.getAttribute("title")).toBe(tooltip);
  });

  it("applies the overrides of the language on top of the english texts", () => {
    component = mount(InternalLinkAction, {
      target: document.body,
      props: {
        editor,
        language: "ja",
        fetchSuggestions: async () => [] as never[],
        fetchTitle: async () => "",
        getPreviewUrl: () => "",
        translationOverrides: { ja: { main: "Article link" }, en: { main: "Ignored" } },
      },
    });
    flushSync();

    expect(document.body.querySelector("button")?.getAttribute("title")).toBe("Article link");
  });

  it("shows the titles of AlertExtension in the alert button", () => {
    // jsdom has neither the popover nor the web animations API, the dropdown uses both
    HTMLElement.prototype.showPopover ??= () => {};
    Element.prototype.animate ??= () => ({ cancel: () => {} }) as unknown as Animation;
    component = mount(AlertAction, { target: document.body, props: { editor, language: "fr" } });
    flushSync();
    document.body.querySelector("button")?.click();
    flushSync();

    const titles = [...document.body.querySelectorAll(".alert-dropdown button")].map((button) => button.getAttribute("title"));
    expect(titles).toEqual(["Remarque", "Tip", "Important", "Warning", "Caution"]);
  });
});
