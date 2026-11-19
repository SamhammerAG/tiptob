<svelte:options customElement="tiptob-show-html-button" />

<script lang="ts">
  import { getTranslation } from "../../utils/translation";
  import SimpleButton from "../../base/SimpleButton.svelte";
  import StrikeIcon from "../../../icons/strikethrough.svg?raw";
  import type { Editor } from "@tiptap/core";

  let { editor, language = "en" }: { editor: Editor; language: string } = $props();

  const translations = {
    de: "HTML anzeigen",
    en: "Show HTML",
  };

  const action = () => editor.commands.setContent(editor.getText(), { emitUpdate: false });
</script>

{#if editor}
  <SimpleButton {editor} {action} key="source" icon={StrikeIcon} tooltip={getTranslation(translations, language)} />
{/if}
