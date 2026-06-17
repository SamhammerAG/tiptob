<svelte:options customElement="tiptob-redo-button" />

<script lang="ts">
  import RedoIcon from "../../../icons/arrow-go-forward-line.svg?raw";
  import SimpleButton from "../../base/SimpleButton.svelte";
  import type { Editor } from "@tiptap/core";
  import { onDestroy, onMount } from "svelte";

  let { editor, language = "en", disable = false }: { editor: Editor; language: "de" | "en"; disable?: boolean } = $props();

  const translations: Record<string, string> = {
    de: "Wiederherstellen (Ctrl+Y)",
    en: "Redo (Ctrl+Y)",
  };

  let canRedo = $state(false);

  function updateCanRedo() {
    //@ts-expect-error: This error is expected because the editor is initilized outside of the Web-component
    canRedo = editor.can().redo();
  }

  onMount(() => {
    updateCanRedo();
    editor.on("transaction", updateCanRedo);
  });

  onDestroy(() => {
    editor.off("transaction", updateCanRedo);
  });

  //@ts-expect-error: This error is expected because the editor is initilized outside of the Web-component
  const action = () => editor.chain().focus().redo().run();
</script>

{#if editor}
  <SimpleButton {editor} {action} key="redo" icon={RedoIcon} tooltip={translations[language]} disabled={disable && !canRedo} />
{/if}
