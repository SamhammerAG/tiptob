<svelte:options customElement="tiptob-redo-button" />

<script lang="ts">
  import RedoIcon from "../../../icons/arrow-go-forward-line.svg?raw";
  import SimpleButton from "../../base/SimpleButton.svelte";
  import type { Editor } from "@tiptap/core";
  import { getTranslation } from "../../utils/translation";

  let { editor, language = "en" }: { editor: Editor; language: string } = $props();

  const translations = {
    de: "Wiederherstellen",
    en: "Redo",
  };

  const translation = $derived(getTranslation(translations, language));

  let canRedo = $state(false);

  function updateCanRedo() {
    //@ts-expect-error: This error is expected because the editor is initilized outside of the Web-component
    canRedo = editor.can().redo();
  }

  $effect(() => {
    if (!editor) return;

    const currentEditor = editor;
    updateCanRedo();
    currentEditor.on("transaction", updateCanRedo);

    return () => currentEditor.off("transaction", updateCanRedo);
  });

  //@ts-expect-error: This error is expected because the editor is initilized outside of the Web-component
  const action = () => editor.chain().focus().redo().run();
</script>

{#if editor}
  <SimpleButton {editor} {action} key="redo" icon={RedoIcon} tooltip={translation} disabled={!canRedo} />
{/if}
