<svelte:options customElement="tiptob-heading-button" />

<script lang="ts">
  import DropdownButton from "../../base/DropdownButton.svelte";
  import Icon from "../../base/Icon.svelte";
  import Paragraph from "../../../icons/paragraph.svg?raw";
  import Heading from "../../../icons/heading.svg?raw";
  import Heading1Icon from "../../../icons/heading-1.svg?raw";
  import Heading2Icon from "../../../icons/heading-2.svg?raw";
  import Heading3Icon from "../../../icons/heading-3.svg?raw";
  import Heading4Icon from "../../../icons/heading-4.svg?raw";
  import Heading5Icon from "../../../icons/heading-5.svg?raw";
  import Heading6Icon from "../../../icons/heading-6.svg?raw";
  import type { Editor } from "@tiptap/core";

  let { editor, language = "en" }: { editor: Editor; language: "de" | "en" } = $props();

  let dropdownOpen = $state(false);

  const translations: Record<string, Record<string, string>> = {
    de: {
      main: "Überschriften",
      paragraph: "Paragraph",
      h1: "Überschrift 1",
      h2: "Überschrift 2",
      h3: "Überschrift 3",
      h4: "Überschrift 4",
      h5: "Überschrift 5",
      h6: "Überschrift 6",
    },
    en: {
      main: "Headings",
      paragraph: "Paragraph",
      h1: "Heading 1",
      h2: "Heading 2",
      h3: "Heading 3",
      h4: "Heading 4",
      h5: "Heading 5",
      h6: "Heading 6",
    },
  };

  const headingLevels = [
    { level: null, label: "paragraph", icon: Paragraph },
    { level: 1, label: "h1", icon: Heading1Icon },
    { level: 2, label: "h2", icon: Heading2Icon },
    { level: 3, label: "h3", icon: Heading3Icon },
    { level: 4, label: "h4", icon: Heading4Icon },
    { level: 5, label: "h5", icon: Heading5Icon },
    { level: 6, label: "h6", icon: Heading6Icon },
  ];

  function setHeading(level: number | null) {
    if (level === null) {
      // @ts-expect-error: This error is expected because the editor is initialized outside of the Web-component
      editor.chain().focus().setParagraph().run();
    } else {
      // @ts-expect-error: This error is expected because the editor is initialized outside of the Web-component
      editor.chain().focus().toggleHeading({ level }).run();
    }

    dropdownOpen = false;
  }

  function isActive(level: number | null) {
    if (!editor) return false;
    if (level === null) {
      return editor.isActive("paragraph");
    }
    return editor.isActive("heading", { level });
  }
</script>

{#if editor}
  <DropdownButton {editor} bind:dropdownOpen key="heading" icon={Heading} tooltip={translations[language]["main"]}>
    <div class="heading-dropdown">
      {#each headingLevels as item (item.label)}
        <button
          class={isActive(item.level) && "active"}
          onclick={() => setHeading(item.level)}
          aria-label={translations[language][item.label]}
        >
          <Icon content={item.icon} />
          <span>{translations[language][item.label]}</span>
        </button>
      {/each}
    </div>
  </DropdownButton>
{/if}

<style>
  .heading-dropdown {
    display: flex;
    flex-flow: column;
    min-width: 10rem;
    background-color: var(--tiptob-bg-button, #fff);
  }

  button {
    display: flex;
    align-items: center;
    border: none;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    gap: 0.5rem;
    background: var(--tiptob-bg-button, #fff);

    &:hover {
      background: var(--tiptob-bg-button-hover, #f0f0f0);
    }

    &.active {
      background-color: var(--tiptob-bg-button-highlighted, #a6ccf7);
    }
  }
</style>
