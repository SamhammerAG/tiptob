import { afterEach, describe, expect, it } from "vitest";
import { flushSync, mount, unmount } from "svelte";
import { Editor } from "@tiptap/core";
import { StarterKit } from "@tiptap/starter-kit";
import { getTranslation } from "../utils/translation";
import BoldAction from "../plugins/Bold/BoldAction.svelte";
import HeadingAction from "../plugins/Heading/HeadingAction.svelte";

describe("getTranslation", () => {
  const translations = { de: "Fett", en: "Bold" };

  it.each([
    ["de", "Fett"],
    ["en", "Bold"],
    ["ja", "Bold"],
    ["", "Bold"],
    [undefined, "Bold"],
  ])("returns the translation for %s", (language, expected) => {
    expect(getTranslation(translations, language)).toBe(expected);
  });
});

describe("buttons in a language without translations", () => {
  const editor = new Editor({ extensions: [StarterKit] });
  let component: ReturnType<typeof mount> | undefined;

  afterEach(() => {
    if (component) unmount(component);
    component = undefined;
    document.body.innerHTML = "";
  });

  it.each([
    ["simple button", BoldAction, "Bold"],
    ["dropdown button", HeadingAction, "Headings"],
  ])("renders the %s with the english tooltip", (_name, Action, tooltip) => {
    component = mount(Action, { target: document.body, props: { editor, language: "ja" } });
    flushSync();

    expect(document.body.querySelector("button")?.getAttribute("title")).toBe(tooltip);
  });
});
