<svelte:options customElement="tiptob-ordered-list-button" />

<script lang="ts">
  import NumberedListIcon from "../../../icons/list-ordered.svg?raw";
  import SimpleButton from "../../base/SimpleButton.svelte";
  import type { Editor } from "@tiptap/core";

  let { editor, language = "en", disabled = false }: { editor: Editor; language: "de" | "en"; disabled?: boolean } = $props();

  const translations: Record<string, string> = {
    de: "Nummerierung",
    en: "Numbered List",
  };

  const action = () => {
    if (editor.isActive("bulletList")) editor.commands.toggleList("bulletList", "listItem");
    editor.commands.toggleList("orderedList", "listItem");
  };
</script>

{#if editor}
  <SimpleButton {editor} {action} {disabled} key="orderedList" icon={NumberedListIcon} tooltip={translations[language]} />
{/if}
