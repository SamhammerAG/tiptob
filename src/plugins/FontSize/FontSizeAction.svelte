<svelte:options customElement="tiptob-font-size-button" />

<script lang="ts">
  import DropdownButton from "../../base/DropdownButton.svelte";
  import FontSizeIcon from "../../../icons/font-size.svg?raw";
  import EraserIcon from "../../../icons/eraser-line.svg?raw";
  import type { Editor } from "@tiptap/core";
  import SimpleButton from "../../base/SimpleButton.svelte";
  import Icon from "../../base/Icon.svelte";

  let {
    editor,
    language = "en",
    availableOptions = ["12px", "14px", "16px", "18px", "24px", "32px"],
  }: { editor: Editor; language: "de" | "en"; availableOptions: string[] } = $props();

  let dropdownOpen = $state(false);

  const translations: Record<string, Record<string, string>> = {
    de: {
      main: "Schriftgröße",
      clear: "Schriftgröße entfernen",
    },
    en: {
      main: "Font size",
      clear: "Clear font size",
    },
  };

  function setFontSize(size: string) {
    editor.chain().focus().setFontSize(size).run();
    dropdownOpen = false;
  }

  function clearFontSize() {
    editor.chain().focus().unsetFontSize().run();
    dropdownOpen = false;
  }
</script>

{#if editor}
  <DropdownButton
    {editor}
    bind:dropdownOpen
    key={{ isActive: (editorInstance) => !!editorInstance.getAttributes("textStyle").fontSize && editorInstance.isActive("textStyle") }}
    icon={FontSizeIcon}
    tooltip={translations[language]["main"]}
  >
    <div class="heading-dropdown">
      <div class="clear-action">
        <button class="clear" onclick={clearFontSize}>
          <Icon content={EraserIcon} />
        </button>
      </div>
      {#each availableOptions as availableOption (availableOption)}
        <SimpleButton
          {editor}
          key={{ name: "textStyle", attributes: { fontSize: availableOption } }}
          action={() => setFontSize(availableOption)}
          text={availableOption}
          tooltip={availableOption}
        ></SimpleButton>
      {/each}
    </div>
  </DropdownButton>
{/if}

<style>
  .heading-dropdown {
    display: flex;
    flex-flow: column;
    padding: 0.25rem;
    background-color: var(--tiptob-bg-button, #fff);
  }

  .clear {
    width: 100%;
    border: none;
    border-radius: 0.25rem;
    height: 1.75rem;
    background-color: var(--tiptob-bg-button, #ffffff);

    &:hover {
      background-color: var(--tiptob-bg-button-hover, #f0f0f0);
    }
  }
</style>
