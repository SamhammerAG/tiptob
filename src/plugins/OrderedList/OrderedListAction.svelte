<svelte:options customElement="tiptob-ordered-list-button" />

<script lang="ts">
  import NumberedListIcon from "../../../icons/list-ordered.svg?raw";
  import SimpleButton from "../../base/SimpleButton.svelte";
  import { findParentNode, type Editor } from "@tiptap/core";

  let { editor, language = "en" }: { editor: Editor; language: "de" | "en" } = $props();

  const translations: Record<string, string> = {
    de: "Nummerierung",
    en: "Numbered List",
  };

  const action = () => editor.chain().focus().toggleList("orderedList", "listItem").run();

  // Highlight only if the nearest list has this type (editor.isActive would also match outer lists)
  const isActive = (e: Editor) =>
    findParentNode((node) => node.type.name === "orderedList" || node.type.name === "bulletList")(e.state.selection)?.node.type.name === "orderedList";
</script>

{#if editor}
  <SimpleButton {editor} {action} key={{ isActive }} icon={NumberedListIcon} tooltip={translations[language]} />
{/if}
