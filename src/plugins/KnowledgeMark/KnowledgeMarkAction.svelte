<svelte:options customElement="tiptob-knowledge-button" />

<script lang="ts">
  import SimpleButton from "../../base/SimpleButton.svelte";
  import KnowledgeIcon from "../../../icons/brain-line.svg?raw";
  import type { Editor } from "@tiptap/core";
  import { getTranslation } from "../../utils/translation";

  let { editor, language = "en" }: { editor: Editor; language: string } = $props();

  const translations = {
    de: "Wissensmarkierung",
    en: "Knowledge Mark",
  };

  const translation = $derived(getTranslation(translations, language));

  const action = () => editor.chain().toggleKnowledgeMark().run();
</script>

{#if editor}
  <SimpleButton {editor} {action} key="knowledge" icon={KnowledgeIcon} tooltip={translation} />
{/if}
