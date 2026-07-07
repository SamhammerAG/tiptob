<svelte:options customElement="tiptob-undo-button" />

<script lang="ts">
  import UndoIcon from "../../../icons/arrow-go-back-line.svg?raw";
  import SimpleButton from "../../base/SimpleButton.svelte";
  import type { Editor } from "@tiptap/core";

  let { editor, language = "en" }: { editor: Editor; language: "de" | "en" } = $props();

  const translations: Record<string, string> = {
    de: "Rückgängig",
    en: "Undo",
  };

  let canUndo = $state(false);

  function updateCanUndo() {
    //@ts-expect-error: This error is expected because the editor is initilized outside of the Web-component
    canUndo = editor.can().undo();
  }

  $effect(() => {
    if (!editor) return;

    updateCanUndo();
    editor.on("transaction", updateCanUndo);

    return () => editor.off("transaction", updateCanUndo);
  });

  //@ts-expect-error: This error is expected because the editor is initilized outside of the Web-component
  const action = () => editor.chain().focus().undo().run();
</script>

{#if editor}
  <SimpleButton key="undo" {editor} {action} icon={UndoIcon} tooltip={translations[language]} disabled={!canUndo} />
{/if}
