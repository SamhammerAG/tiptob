import { describe, expect, it } from "vitest";
import { INTERNAL_LINK_MARKDOWN_REGEX } from "../plugins/InternalLink/InternalLinkExtension";

describe("INTERNAL_LINK_MARKDOWN_REGEX", () => {
  function exec(src: string) {
    const match = INTERNAL_LINK_MARKDOWN_REGEX.exec(src);
    return match ? { raw: match[0], id: match.groups?.id, text: match.groups?.text } : null;
  }

  it("matches a plain link", () => {
    expect(exec("[[5::a]]")).toEqual({ raw: "[[5::a]]", id: "5", text: "a" });
  });

  it("matches multi-word text", () => {
    expect(exec("[[5::Some Article]]")).toEqual({ raw: "[[5::Some Article]]", id: "5", text: "Some Article" });
  });

  it("matches empty text", () => {
    expect(exec("[[5::]]")).toEqual({ raw: "[[5::]]", id: "5", text: "" });
  });

  it("keeps a literal trailing ] as part of the text (title ending in ])", () => {
    expect(exec("[[5::Roadmap [Q4]]]")).toEqual({ raw: "[[5::Roadmap [Q4]]]", id: "5", text: "Roadmap [Q4]" });
  });

  it("does not stop early on a single stray ] right after the close", () => {
    expect(exec("[[5::a]]]")).toEqual({ raw: "[[5::a]]]", id: "5", text: "a]" });
  });

  it("does not swallow a second, unrelated link later in the same string", () => {
    expect(exec("[[5::Report]] and [[6::Summary]]")).toEqual({ raw: "[[5::Report]]", id: "5", text: "Report" });
  });

  it("requires the id to be numeric", () => {
    expect(exec("[[abc::text]]")).toBeNull();
  });

  it("requires the match to start at the beginning of the given string", () => {
    expect(exec("prefix [[5::a]]")).toBeNull();
  });
});
