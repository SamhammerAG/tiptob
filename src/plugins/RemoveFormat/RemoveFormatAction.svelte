<svelte:options customElement="tiptob-remove-format-button" />

<script lang="ts">
  import { getTranslation } from "../../utils/translation";
  import ClearIcon from "../../../icons/format-clear.svg?raw";
  import SimpleButton from "../../base/SimpleButton.svelte";
  import type { Editor } from "@tiptap/core";

  let { editor, language = "en" }: { editor: Editor; language: string } = $props();

  const translations = {
    de: "Formatierung entfernen",
    en: "Remove Format",
  };

  const action = () => editor.chain().focus().unsetAllMarks().clearNodes().run();
</script>

{#if editor}
  <SimpleButton {editor} {action} key="remove-format" icon={ClearIcon} tooltip={getTranslation(translations, language)} />
{/if}
