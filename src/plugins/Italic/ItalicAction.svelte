<svelte:options customElement="tiptob-italic-button" />

<script lang="ts">
  import SimpleButton from "../../base/SimpleButton.svelte";
  import ItalicIcon from "../../../icons/italic.svg?raw";
  import type { Editor } from "@tiptap/core";
  import { getTranslation } from "../../utils/translation";

  let { editor, language = "en" }: { editor: Editor; language: string } = $props();

  const translations = {
    de: "Kursiv",
    en: "Italic",
  };

  const translation = $derived(getTranslation(translations, language));

  //@ts-expect-error: This error is expected because the editor is initilized outside of the Web-component
  const action = () => editor.chain().focus().toggleItalic().run();
</script>

{#if editor}
  <SimpleButton key="italic" {editor} {action} icon={ItalicIcon} tooltip={translation} />
{/if}
