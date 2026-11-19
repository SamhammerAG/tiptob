<svelte:options customElement="tiptob-knowledge-button" />

<script lang="ts">
  import { getTranslation } from "../../utils/translation";
  import SimpleButton from "../../base/SimpleButton.svelte";
  import KnowledgeIcon from "../../../icons/brain-line.svg?raw";
  import type { Editor } from "@tiptap/core";

  let { editor, language = "en" }: { editor: Editor; language: string } = $props();

  const translations: Record<string, string> = {
    de: "Wissensmarkierung",
    en: "Knowledge Mark",
  };

  const action = () => editor.chain().toggleKnowledgeMark().run();
</script>

{#if editor}
  <SimpleButton {editor} {action} key="knowledge" icon={KnowledgeIcon} tooltip={getTranslation(translations, language)} />
{/if}
