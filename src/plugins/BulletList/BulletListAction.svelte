<svelte:options customElement="tiptob-bullet-list-button" />

<script lang="ts">
  import BulletListIcon from "../../../icons/list-unordered.svg?raw";
  import SimpleButton from "../../base/SimpleButton.svelte";
  import type { Editor } from "@tiptap/core";

  let { editor, language = "en" }: { editor: Editor; language: "de" | "en" } = $props();

  const translations: Record<string, string> = {
    de: "Aufzählung",
    en: "Bulleted List",
  };

  const action = () => {
    if (editor.isActive("orderedList")) editor.commands.toggleList("orderedList", "listItem");
    editor.commands.toggleList("bulletList", "listItem");
  };
</script>

{#if editor}
  <SimpleButton {editor} {action} key="bulletList" icon={BulletListIcon} tooltip={translations[language]} />
{/if}
