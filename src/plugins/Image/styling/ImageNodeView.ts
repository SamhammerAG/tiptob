import type { Editor } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { type Align, alignClass } from "./ImageAlign";
import { imageBubbleMenuPluginKey } from "../ImageBubbleMenuExtension";
import { resizeClass } from "./ImageResize";
import { normalizeLinkHref } from "../../../utils/link";

type Corner = "tl" | "tr" | "bl" | "br";

const CORNERS: Corner[] = ["tl", "tr", "bl", "br"];

const HANDLE_BASE_STYLE =
  "position:absolute;width:9px;height:9px;border-radius:50%;" +
  "background:var(--tiptob-bg-button,#ffffff);" +
  "border:1.5px solid var(--tiptob-bg-icon,#6c6c6c);" +
  "box-shadow:0 0 2px rgba(34,47,62,0.2),0 0.25rem 0.5rem rgba(34,47,62,0.15);" +
  "z-index:2;";

const HANDLE_CORNER_STYLES: Record<Corner, string> = {
  tl: "top:-5px;left:-5px;cursor:nwse-resize;",
  tr: "top:-5px;right:-5px;cursor:nesw-resize;",
  bl: "bottom:-5px;left:-5px;cursor:nesw-resize;",
  br: "bottom:-5px;right:-5px;cursor:nwse-resize;",
};

interface NodeViewArgs {
  node: ProseMirrorNode;
  editor: Editor;
  getPos: () => number | undefined;
  resizable: boolean;
  linkEnabled: boolean;
}

export class ImageNodeView {
  dom: HTMLElement;
  private img: HTMLImageElement;
  private link?: HTMLAnchorElement;
  private handles: HTMLElement[] = [];
  private editor: Editor;
  private node: ProseMirrorNode;
  private getPos: () => number | undefined;
  private resizable: boolean;
  private selected = false;

  private resizing = false;
  private startX = 0;
  private startWidth = 0;
  private activeCorner: Corner | null = null;
  private boundPointerMove?: (e: PointerEvent) => void;
  private boundPointerUp?: (e: PointerEvent) => void;

  constructor({ node, editor, getPos, resizable, linkEnabled }: NodeViewArgs) {
    this.node = node;
    this.editor = editor;
    this.getPos = getPos;
    this.resizable = resizable;

    const figure = document.createElement("figure");
    figure.style.position = "relative";

    const img = document.createElement("img");
    img.style.display = "block";
    img.style.width = "100%";
    img.style.height = "auto";
    if (linkEnabled) {
      const link = document.createElement("a");
      link.addEventListener("click", (event) => {
        if (this.editor.isEditable) event.preventDefault();
      });
      link.appendChild(img);
      figure.appendChild(link);
      this.link = link;
    } else {
      figure.appendChild(img);
    }

    this.dom = figure;
    this.img = img;

    this.applyAttrs();
  }

  private applyAttrs(): void {
    const { src, alt, title, width, align, href } = this.node.attrs as {
      src: string | null;
      alt: string | null;
      title: string | null;
      width: string | null;
      align: Align | null;
      href: string | null;
    };

    if (src) {
      this.img.src = src;
    } else {
      this.img.removeAttribute("src");
    }
    if (alt) {
      this.img.alt = alt;
    } else {
      this.img.removeAttribute("alt");
    }
    if (title) {
      this.img.title = title;
    } else {
      this.img.removeAttribute("title");
    }

    const selectedClass = this.selected ? "ProseMirror-selectednode" : "";
    const classes = ["image", resizeClass(width), alignClass(align), selectedClass].filter(Boolean);
    this.dom.className = classes.join(" ");

    this.dom.style.width = width ? width : "";

    if (this.link) {
      const normalizedHref = href ? normalizeLinkHref(href) : null;
      if (normalizedHref) this.link.href = normalizedHref;
      else this.link.removeAttribute("href");
    }
  }

  selectNode(): void {
    if (!this.editor.isEditable) return;
    this.selected = true;
    this.applyAttrs();
    if (this.resizable) this.addHandles();
  }

  deselectNode(): void {
    this.selected = false;
    this.applyAttrs();
    this.removeHandles();
  }

  private addHandles(): void {
    if (this.handles.length) return;
    for (const corner of CORNERS) {
      const dot = document.createElement("div");
      dot.className = `tiptob-image-resize-handle tiptob-image-resize-handle-${corner}`;
      dot.setAttribute("data-corner", corner);
      dot.setAttribute("contenteditable", "false");
      dot.setAttribute("style", HANDLE_BASE_STYLE + HANDLE_CORNER_STYLES[corner]);
      dot.style.touchAction = "none";
      this.attachResize(dot, corner);
      this.dom.appendChild(dot);
      this.handles.push(dot);
    }
  }

  private removeHandles(): void {
    for (const dot of this.handles) dot.remove();
    this.handles = [];
  }

  private attachResize(dot: HTMLElement, corner: Corner): void {
    dot.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      dot.setPointerCapture(e.pointerId);
      this.beginResize(corner, e.clientX);

      this.boundPointerMove = (ev) => this.onResizeMove(ev.clientX);
      this.boundPointerUp = () => this.endResize(dot);
      dot.addEventListener("pointermove", this.boundPointerMove);
      dot.addEventListener("pointerup", this.boundPointerUp);
      dot.addEventListener("pointercancel", this.boundPointerUp);
    });
  }

  private beginResize(corner: Corner, clientX: number): void {
    this.resizing = true;
    this.activeCorner = corner;
    this.startX = clientX;
    this.startWidth = this.dom.offsetWidth;

    this.editor.view.dispatch(this.editor.state.tr.setMeta(imageBubbleMenuPluginKey, "hide"));
  }

  private onResizeMove(clientX: number): void {
    if (!this.resizing || !this.activeCorner) return;

    const isLeft = this.activeCorner === "tl" || this.activeCorner === "bl";
    const deltaX = isLeft ? -(clientX - this.startX) : clientX - this.startX;
    const newWidth = this.startWidth + deltaX;
    const parent = this.dom.parentElement;
    const parentWidth = parent ? parent.offsetWidth : newWidth;
    if (!parentWidth) return;

    let percent = (newWidth / parentWidth) * 100;
    percent = Math.max(5, Math.min(percent, 100));

    this.dom.style.width = `${percent.toFixed(1)}%`;
    if (!this.dom.classList.contains("image_resized")) {
      this.dom.classList.add("image_resized");
    }
  }

  private endResize(dot: HTMLElement): void {
    if (!this.resizing) return;
    this.resizing = false;
    this.activeCorner = null;

    if (this.boundPointerMove) dot.removeEventListener("pointermove", this.boundPointerMove);
    if (this.boundPointerUp) {
      dot.removeEventListener("pointerup", this.boundPointerUp);
      dot.removeEventListener("pointercancel", this.boundPointerUp);
    }
    this.boundPointerMove = undefined;
    this.boundPointerUp = undefined;

    const finalWidth = this.dom.style.width;
    if (!finalWidth) return;

    const pos = this.getPos();
    if (typeof pos !== "number") return;

    this.editor
      .chain()
      .setNodeSelection(pos)
      .updateAttributes("imageUpload", { width: finalWidth })
      .run();
  }

  update(node: ProseMirrorNode): boolean {
    if (node.type !== this.node.type) return false;
    this.node = node;
    this.applyAttrs();
    if (this.resizable && this.selected && this.handles.length === 0) {
      this.addHandles();
    }
    return true;
  }

  ignoreMutation(): boolean {
    return true;
  }

  stopEvent(event: Event): boolean {
    const target = event.target as HTMLElement | null;
    if (target && target.classList.contains("tiptob-image-resize-handle")) {
      return true;
    }
    return false;
  }
}
