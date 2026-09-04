<svelte:options customElement="tiptob-ordered-list-button" />

<script lang="ts">
  import NumberedListIcon from "../../../icons/list-ordered.svg?raw";
  import SimpleButton from "../../base/SimpleButton.svelte";
  import type { Editor } from "@tiptap/core";
  import { toggleNestedListType } from "../../utils/toggleNestedList";

  let { editor, language = "en" }: { editor: Editor; language: "de" | "en" } = $props();

  const translations: Record<string, string> = {
    de: "Nummerierung",
    en: "Numbered List",
  };

  const action = () => {
    if (toggleNestedListType(editor, "orderedList")) return;
    editor.commands.toggleList("orderedList", "listItem");
  };
</script>

{#if editor}
  <SimpleButton {editor} {action} key="orderedList" icon={NumberedListIcon} tooltip={translations[language]} />
{/if}
