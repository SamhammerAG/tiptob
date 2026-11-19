<svelte:options customElement="tiptob-strike-button" />

<script lang="ts">
  import { getTranslation } from "../../utils/translation";
  import SimpleButton from "../../base/SimpleButton.svelte";
  import StrikeIcon from "../../../icons/strikethrough.svg?raw";
  import type { Editor } from "@tiptap/core";

  let { editor, language = "en" }: { editor: Editor; language: string } = $props();

  const translations = {
    de: "Durchstreichen",
    en: "Strikethrough",
  };

  //@ts-expect-error: This error is expected because the editor is initilized outside of the Web-component
  const action = () => editor.chain().focus().toggleStrike().run();
</script>

{#if editor}
  <SimpleButton {editor} {action} key="strike" icon={StrikeIcon} tooltip={getTranslation(translations, language)} />
{/if}
