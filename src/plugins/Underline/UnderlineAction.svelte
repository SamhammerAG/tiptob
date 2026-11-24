<svelte:options customElement="tiptob-underline-button" />

<script lang="ts">
  import SimpleButton from "../../base/SimpleButton.svelte";
  import UnderlineIcon from "../../../icons/underline.svg?raw";
  import type { Editor } from "@tiptap/core";
  import { getTranslation } from "../../utils/translation";

  let { editor, language = "en" }: { editor: Editor; language: string } = $props();

  const translations = {
    de: "Unterstreichen",
    en: "Underline",
  };

  const translation = $derived(getTranslation(translations, language));

  //@ts-expect-error: This error is expected because the editor is initilized outside of the Web-component
  const action = () => editor.chain().focus().toggleUnderline().run();
</script>

{#if editor}
  <SimpleButton key="underline" {editor} {action} icon={UnderlineIcon} tooltip={translation} />
{/if}
