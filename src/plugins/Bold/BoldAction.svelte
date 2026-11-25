<svelte:options customElement="tiptob-bold-button" />

<script lang="ts">
  import BoldIcon from "../../../icons/bold.svg?raw";
  import SimpleButton from "../../base/SimpleButton.svelte";
  import type { Editor } from "@tiptap/core";
  import { getTranslation } from "../../utils/translation";

  let { editor, language = "en", disabled = false }: { editor: Editor; language: string; disabled?: boolean } = $props();

  const translations = {
    de: "Fett",
    en: "Bold",
  };

  const translation = $derived(getTranslation(translations, language));

  //@ts-expect-error: This error is expected because the editor is initilized outside of the Web-component
  const action = () => editor.chain().focus().toggleBold().run();
</script>

{#if editor}
  <SimpleButton {editor} {action} {disabled} key="bold" icon={BoldIcon} tooltip={translation} />
{/if}
