<svelte:options customElement="tiptob-remove-format-button" />

<script lang="ts">
  import ClearIcon from "../../../icons/format-clear.svg?raw";
  import SimpleButton from "../../base/SimpleButton.svelte";
  import type { Editor } from "@tiptap/core";

  let { editor, language = "en" }: { editor: Editor; language: "de" | "en" } = $props();

  const translations: Record<string, string> = {
    de: "Formatierung entfernen",
    en: "Remove Format",
  };

  const action = () => editor.chain().focus().unsetAllMarks().clearNodes().run();
</script>

{#if editor}
  <SimpleButton {editor} {action} key="remove-format" icon={ClearIcon} tooltip={translations[language]} />
{/if}
