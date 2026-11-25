<svelte:options customElement="tiptob-undo-button" />

<script lang="ts">
  import UndoIcon from "../../../icons/arrow-go-back-line.svg?raw";
  import SimpleButton from "../../base/SimpleButton.svelte";
  import type { Editor } from "@tiptap/core";
  import { getTranslation } from "../../utils/translation";

  let { editor, language = "en" }: { editor: Editor; language: string } = $props();

  const translations = {
    de: "Rückgängig",
    en: "Undo",
  };

  const translation = $derived(getTranslation(translations, language));

  let canUndo = $state(false);

  function updateCanUndo() {
    //@ts-expect-error: This error is expected because the editor is initilized outside of the Web-component
    canUndo = editor.can().undo();
  }

  $effect(() => {
    if (!editor) return;

    const currentEditor = editor;
    updateCanUndo();
    currentEditor.on("transaction", updateCanUndo);

    return () => currentEditor.off("transaction", updateCanUndo);
  });

  //@ts-expect-error: This error is expected because the editor is initilized outside of the Web-component
  const action = () => editor.chain().focus().undo().run();
</script>

{#if editor}
  <SimpleButton key="undo" {editor} {action} icon={UndoIcon} tooltip={translation} disabled={!canUndo} />
{/if}
