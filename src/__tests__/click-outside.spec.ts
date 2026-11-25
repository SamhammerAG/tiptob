import { describe, expect, it } from "vitest";
import { clickOutside } from "../utils/click-outside";

function mousedownOn(target: Element) {
  target.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
}

describe("clickOutside", () => {
  it("fires outclick when a mousedown happens outside the node", () => {
    const node = document.createElement("div");
    const outsideEl = document.createElement("button");
    document.body.append(node, outsideEl);

    const action = clickOutside(node);
    let fired = false;
    node.addEventListener("outclick", () => (fired = true));

    mousedownOn(outsideEl);

    expect(fired).toBe(true);
    action.destroy?.();
    node.remove();
    outsideEl.remove();
  });

  it("does not fire outclick when the mousedown happens inside the node", () => {
    const node = document.createElement("div");
    const insideEl = document.createElement("span");
    node.append(insideEl);
    document.body.append(node);

    const action = clickOutside(node);
    let fired = false;
    node.addEventListener("outclick", () => (fired = true));

    mousedownOn(insideEl);

    expect(fired).toBe(false);
    action.destroy?.();
    node.remove();
  });

  it("stops listening after destroy is called", () => {
    const node = document.createElement("div");
    const outsideEl = document.createElement("button");
    document.body.append(node, outsideEl);

    const action = clickOutside(node);
    action.destroy?.();

    let fired = false;
    node.addEventListener("outclick", () => (fired = true));

    mousedownOn(outsideEl);

    expect(fired).toBe(false);
    node.remove();
    outsideEl.remove();
  });
});
