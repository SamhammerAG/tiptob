import { describe, expect, it } from "vitest";
import { normalizeLinkHref } from "../utils/link";

describe("normalizeLinkHref", () => {
  it("keeps a well-formed https url unchanged", () => {
    expect(normalizeLinkHref("https://example.com/path")).toBe("https://example.com/path");
  });

  it("prepends https:// to a bare domain", () => {
    expect(normalizeLinkHref("example.com")).toBe("https://example.com/");
  });

  it("rejects a disallowed protocol", () => {
    expect(normalizeLinkHref("javascript:alert(1)")).toBeNull();
  });

  it("rejects empty or whitespace-only input", () => {
    expect(normalizeLinkHref("")).toBeNull();
    expect(normalizeLinkHref("   ")).toBeNull();
  });

  it("rejects an unparsable url", () => {
    expect(normalizeLinkHref("https://")).toBeNull();
  });
});
