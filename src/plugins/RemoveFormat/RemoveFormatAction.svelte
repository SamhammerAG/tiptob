<svelte:options customElement="tiptob-remove-format-button" />

<script lang="ts">
  import ClearIcon from "../../../icons/format-clear.svg?raw";
  import SimpleButton from "../../base/SimpleButton.svelte";
  import type { Editor } from "@tiptap/core";
  import { getTranslation } from "../../utils/translation";

  let { editor, language = "en" }: { editor: Editor; language: string } = $props();

  const translations = {
    de: "Formatierung entfernen",
    en: "Remove Format",
  };

  const translation = $derived(getTranslation(translations, language));

  const action = () => editor.chain().focus().unsetAllMarks().clearNodes().run();
</script>

{#if editor}
  <SimpleButton {editor} {action} key="remove-format" icon={ClearIcon} tooltip={translation} />
{/if}
