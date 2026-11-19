<svelte:options customElement="tiptob-bold-button" />

<script lang="ts">
  import { getTranslation } from "../../utils/translation";
  import BoldIcon from "../../../icons/bold.svg?raw";
  import SimpleButton from "../../base/SimpleButton.svelte";
  import type { Editor } from "@tiptap/core";

  let { editor, language = "en" }: { editor: Editor; language: string } = $props();

  const translations: Record<string, string> = {
    de: "Fett",
    en: "Bold",
  };

  //@ts-expect-error: This error is expected because the editor is initilized outside of the Web-component
  const action = () => editor.chain().focus().toggleBold().run();
</script>

{#if editor}
  <SimpleButton {editor} {action} key="bold" icon={BoldIcon} tooltip={getTranslation(translations, language)} />
{/if}
