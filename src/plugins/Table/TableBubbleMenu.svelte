<svelte:options customElement="tiptob-table-bubble-menu" />

<script lang="ts">
  import type { Editor } from "@tiptap/core";

  import DeleteTableIcon from "../../../icons/delete-bin-2-line.svg?raw";
  import DeleteColumnIcon from "../../../icons/delete-column.svg?raw";
  import DeleteRowIcon from "../../../icons/delete-row.svg?raw";
  import ToggleHeaderIcon from "../../../icons/layout-row-fill.svg?raw";
  import SplitCells from "../../../icons/split-cells-horizontal.svg?raw";
  import InsertColumnLeftIcon from "../../../icons/insert-column-left.svg?raw";
  import InsertColumnRightIcon from "../../../icons/insert-column-right.svg?raw";
  import InsertRowTopIcon from "../../../icons/insert-row-top.svg?raw";
  import InsertRowBottomIcon from "../../../icons/insert-row-bottom.svg?raw";
  import MergeCells from "../../../icons/merge-cells-horizontal.svg?raw";
  import Icon from "../../base/Icon.svelte";

  let { editor, language = "en" }: { editor: Editor; language: "de" | "en" } = $props();

  const translations: Record<string, Record<string, string>> = {
    de: {
      toggleHeader: "Kopfzeile umschalten",
      mergeCells: "Zellen zusammenführen",
      splitCells: "Zellen spalten ",
      deleteTable: "Tabelle löschen",
      addRowBefore: "Zeile oben einfügen",
      addRowAfter: "Zeile unten einfügen",
      deleteRow: "Zeile entfernen",
      addColumnBefore: "Spalte links einfügen",
      addColumnAfter: "Spalte rechts einfügen",
      deleteColumn: "Spalte entfernen",
    },
    en: {
      toggleHeader: "Toggle Header",
      mergeCells: "Merge Cells",
      splitCells: "Split Cells",
      deleteTable: "Delete Table",
      addRowBefore: "Add Row Before",
      addRowAfter: "Add Row After",
      deleteRow: "Delete Row",
      addColumnBefore: "Add Column Before",
      addColumnAfter: "Add Column After",
      deleteColumn: "Delete Column",
    },
  };
</script>

{#if editor}
  <div class="table-bubble-menu">
    <div class="table-toolbar">
      <div class="toolbar-button-group">
        <button
          onclick={() =>
            //@ts-expect-error: This error is expected because the editor is initilized outside of the Web-component
            editor.commands.deleteTable()}
          title={translations[language]["deleteTable"]}
        >
          <Icon content={DeleteTableIcon} />
        </button>
      </div>
      <div class="toolbar-button-group">
        <button
          onclick={() => {
            //@ts-expect-error: This error is expected because the editor is initilized outside of the Web-component
            editor.commands.toggleHeaderCell();
            //AID-27639 wtf is that bug, but ye this fixes it.
            editor.chain().focus();
          }}
          class="toggle-header-button"
          title={translations[language]["toggleHeader"]}
        >
          <Icon content={ToggleHeaderIcon} />
        </button>
        <button
          onclick={() => {
            //@ts-expect-error: This error is expected because the editor is initilized outside of the Web-component
            editor.commands.mergeCells();
            //AID-27639 wtf is that bug, but ye this fixes it.
            editor.chain().focus();
          }}
          title={translations[language]["mergeCells"]}
        >
          <Icon content={MergeCells} />
        </button>
        <button
          onclick={() => {
            //@ts-expect-error: This error is expected because the editor is initilized outside of the Web-component
            editor.commands.splitCell();
            //AID-27639 wtf is that bug, but ye this fixes it.
            editor.chain().focus();
          }}
          title={translations[language]["splitCells"]}
        >
          <Icon content={SplitCells} />
        </button>
      </div>
      <div class="toolbar-button-group">
        <button
          onclick={() => {
            //@ts-expect-error: This error is expected because the editor is initilized outside of the Web-component
            editor.commands.addRowBefore();
            //AID-27639 wtf is that bug, but ye this fixes it.
            editor.chain().focus();
          }}
          title={translations[language]["addRowBefore"]}
        >
          <Icon content={InsertRowTopIcon} />
        </button>
        <button
          onclick={() => {
            //@ts-expect-error: This error is expected because the editor is initilized outside of the Web-component
            editor.commands.addRowAfter();
            //AID-27639 wtf is that bug, but ye this fixes it.
            editor.chain().focus();
          }}
          title={translations[language]["addRowAfter"]}
        >
          <Icon content={InsertRowBottomIcon} />
        </button>
        <button
          onclick={() => {
            //@ts-expect-error: This error is expected because the editor is initilized outside of the Web-component
            editor.commands.deleteRow();
            //AID-27639 wtf is that bug, but ye this fixes it.
            editor.chain().focus();
          }}
          title={translations[language]["deleteRow"]}
        >
          <Icon content={DeleteRowIcon} />
        </button>
      </div>
      <div class="toolbar-button-group">
        <button
          onclick={() => {
            //@ts-expect-error: This error is expected because the editor is initilized outside of the Web-component
            editor.commands.addColumnBefore();
            //AID-27639 wtf is that bug, but ye this fixes it.
            editor.chain().focus();
          }}
          title={translations[language]["addColumnBefore"]}
        >
          <Icon content={InsertColumnLeftIcon} />
        </button>
        <button
          onclick={() => {
            //@ts-expect-error: This error is expected because the editor is initilized outside of the Web-component
            editor.commands.addColumnAfter();
            //AID-27639 wtf is that bug, but ye this fixes it.
            editor.chain().focus();
          }}
          title={translations[language]["addColumnAfter"]}
        >
          <Icon content={InsertColumnRightIcon} />
        </button>
        <button
          onclick={() => {
            //@ts-expect-error: This error is expected because the editor is initilized outside of the Web-component
            editor.commands.deleteColumn();
            //AID-27639 wtf is that bug, but ye this fixes it.
            editor.chain().focus();
          }}
          title={translations[language]["deleteColumn"]}
        >
          <Icon content={DeleteColumnIcon} />
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .table-bubble-menu {
    background-color: var(--tiptob-bg-button, #ffffff);
    border: 1px solid var(--tiptob-bg-button, #eeeeee);
    border-radius: 0.5rem;
    box-shadow:
      0 0 2px 0 rgba(34, 47, 62, 0.2),
      0 0.25rem 0.5rem 0 rgba(34, 47, 62, 0.15);
    min-width: max-content;
    overflow: hidden;

    & .table-toolbar {
      display: flex;
      flex-direction: row;
      align-items: center;

      & .toolbar-button-group {
        display: flex;
        gap: 0.125rem;
        padding: 0 0.5rem;
        align-items: center;

        & button {
          cursor: pointer;
          margin: 0.5rem 0;
          height: 1.75rem;
          border: none;
          border-radius: 0.25rem;
          background-color: var(--tiptob-bg-button, #ffffff);
          color: var(--tiptob-bg-icon, #333333);

          &:hover {
            background-color: var(--tiptob-bg-button-hover, #e2e2e2);
          }
        }
      }
    }
  }
</style>
