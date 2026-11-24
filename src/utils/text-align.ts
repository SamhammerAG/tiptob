import type { EditorState } from "@tiptap/pm/state";

/**
 * Returns every alignment for which `editor.isActive({ textAlign })` is true, in a single pass over the selection
 * (`isActive` walks the whole selection twice per alignment - once for nodes, once for marks).
 *
 * Same rule as tiptap's `isNodeActive`: a cursor is aligned if any node around it is; a range only if the nodes with
 * that alignment cover all of it, so a selection with mixed alignments matches none.
 */
export function getActiveAlignments(state: EditorState): Set<string> {
  const { from, to, empty } = state.selection;
  const coveredRange = new Map<string, number>();

  state.doc.nodesBetween(from, to, (node, pos) => {
    const alignment: unknown = node.attrs.textAlign;
    if (node.isText || typeof alignment !== "string") return;

    const range = Math.min(to, pos + node.nodeSize) - Math.max(from, pos);
    coveredRange.set(alignment, (coveredRange.get(alignment) ?? 0) + range);
  });

  const active = new Set<string>();
  for (const [alignment, range] of coveredRange) {
    if (empty || range >= to - from) active.add(alignment);
  }
  return active;
}
