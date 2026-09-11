<svelte:options customElement="tiptob-bullet-list-button" />

<script lang="ts">
  import BulletListIcon from "../../../icons/list-unordered.svg?raw";
  import SimpleButton from "../../base/SimpleButton.svelte";
  import { findParentNode, type Editor } from "@tiptap/core";

  let { editor, language = "en", disabled = false }: { editor: Editor; language: "de" | "en"; disabled?: boolean } = $props();

  const translations: Record<string, string> = {
    de: "Aufzählung",
    en: "Bulleted List",
  };

  const action = () => editor.chain().focus().toggleList("bulletList", "listItem").run();

  // Highlight only if the nearest list has this type (editor.isActive would also match outer lists)
  const isActive = (e: Editor) =>
    findParentNode((node) => node.type.name === "bulletList" || node.type.name === "orderedList")(e.state.selection)?.node.type.name === "bulletList";
</script>

{#if editor}
  <SimpleButton {editor} {action} {disabled} key={{ isActive }} icon={BulletListIcon} tooltip={translations[language]} />
{/if}
