import type { Editor } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { TextSelection } from "@tiptap/pm/state";

export type ListTypeName = "bulletList" | "orderedList";

/**
 * Switches the list type (bulletList <-> orderedList) of only the list item the
 * cursor is currently in, regardless of how deeply that item is nested, without
 * disturbing sibling items or any ancestor lists.
 *
 * Returns `true` if it changed the type of the item's nearest list, or `false`
 * if there was nothing to do here (cursor isn't inside a list, or the nearest
 * list is already the target type) - callers should fall back to the normal
 * `toggleList` command in that case.
 */
export function toggleNestedListType(editor: Editor, targetType: ListTypeName): boolean {
  const { state } = editor;
  const { $from } = state.selection;

  let listDepth: number | null = null;
  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const node = $from.node(depth);
    if (node.type.name === "bulletList" || node.type.name === "orderedList") {
      listDepth = depth;
      break;
    }
  }

  if (listDepth === null) return false;

  const listNode = $from.node(listDepth);
  if (listNode.type.name === targetType) return false;

  const targetListType = state.schema.nodes[targetType];
  if (!targetListType) return false;

  const listPos = $from.before(listDepth);
  const itemIndex = $from.index(listDepth);

  const children: ProseMirrorNode[] = [];
  listNode.forEach((child) => children.push(child));

  const before = children.slice(0, itemIndex);
  const currentItem = children[itemIndex];
  const after = children.slice(itemIndex + 1);

  const replacement: ProseMirrorNode[] = [];
  if (before.length) replacement.push(listNode.type.create(listNode.attrs, before));
  replacement.push(targetListType.create(null, currentItem));
  if (after.length) replacement.push(listNode.type.create(listNode.attrs, after));

  const { tr } = state;
  const cursorPos = state.selection.from;
  tr.replaceWith(listPos, listPos + listNode.nodeSize, replacement);
  tr.setSelection(TextSelection.near(tr.doc.resolve(tr.mapping.map(cursorPos))));

  editor.view.dispatch(tr);
  editor.view.focus();

  return true;
}
