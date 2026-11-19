<svelte:options customElement="tiptob-show-source-button" />

<script lang="ts">
  import { getTranslation } from "../../utils/translation";
  import SimpleButton from "../../base/SimpleButton.svelte";
  import StrikeIcon from "../../../icons/strikethrough.svg?raw";
  import type { Editor } from "@tiptap/core";

  let { editor, language = "en" }: { editor: Editor; language: string } = $props();

  const translations: Record<string, string> = {
    de: "Quellcode anzeigen",
    en: "Show source code",
  };

  const action = () => editor.commands.setContent(`<textarea>${editor.getHTML()}</textarea>`, { emitUpdate: false });
</script>

{#if editor}
  <SimpleButton {editor} {action} key="source" icon={StrikeIcon} tooltip={getTranslation(translations, language)} />
{/if}
