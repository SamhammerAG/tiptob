<svelte:options customElement="tiptob-show-html-button" />

<script lang="ts">
  import SimpleButton from "../../base/SimpleButton.svelte";
  import StrikeIcon from "../../../icons/strikethrough.svg?raw";
  import type { Editor } from "@tiptap/core";
  import { getTranslation } from "../../utils/translation";

  let { editor, language = "en" }: { editor: Editor; language: string } = $props();

  const translations = {
    de: "HTML anzeigen",
    en: "Show HTML",
  };

  const translation = $derived(getTranslation(translations, language));

  const action = () => editor.commands.setContent(editor.getText(), { emitUpdate: false });
</script>

{#if editor}
  <SimpleButton {editor} {action} key="source" icon={StrikeIcon} tooltip={translation} />
{/if}
