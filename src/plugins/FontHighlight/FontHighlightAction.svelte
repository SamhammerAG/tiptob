<svelte:options customElement="tiptob-font-highlight-button" />

<script lang="ts">
  import DropdownButton from "../../base/DropdownButton.svelte";
  import FontHighlightIcon from "../../../icons/palette-line.svg?raw";
  import EraserIcon from "../../../icons/eraser-line.svg?raw";
  import Icon from "../../base/Icon.svelte";
  import type { Editor } from "@tiptap/core";

  let { editor, language = "en" }: { editor: Editor; language: "de" | "en" } = $props();

  let dropdownOpen = $state(false);

  const translations: Record<string, string> = {
    de: "Markieren",
    en: "Font Highlight",
  };

  const colors: string[] = ["#E91313", "#118800", "#63F963", "#72CDFD", "#fc7999", "#FDFD77"];

  function clearColor() {
    editor.chain().focus().unsetHighlight().run();
    dropdownOpen = false;
  }

  function setColor(color: string) {
    editor.chain().focus().toggleHighlight({ color }).run();
    dropdownOpen = false;
  }
</script>

{#if editor}
  <DropdownButton {editor} bind:dropdownOpen key="highlight" icon={FontHighlightIcon} tooltip={translations[language]}>
    <div class="color-picker">
      <button class="clear" onclick={clearColor}>
        <Icon content={EraserIcon} />
      </button>

      {#each colors as color (colors.indexOf(color))}
        <button style="background-color: {color};" onclick={() => setColor(color)} aria-label={color}></button>
      {/each}
    </div>
  </DropdownButton>
{/if}

<style>
  .color-picker {
    display: flex;
    flex-flow: row wrap;
    gap: 0.25rem;
    width: 5rem;
    background-color: var(--tiptob-bg-button, #ffffff);
    padding: 0.25rem;

    button {
      border: none;
      border-radius: 0.25rem;
    }

    .clear {
      width: 100%;
      text-align: center;
      padding: 0.5rem;
      background-color: var(--tiptob-bg-button, #ffffff);
      color: #333333;
      align-items: center;
      justify-content: center;
      display: flex;
      cursor: pointer;

      &:hover {
        background-color: var(--tiptob-bg-button-hover, #f0f0f0);
      }
      :global(svg) {
        width: 1.125rem;
        height: 1.125rem;
      }
    }

    button:not(.clear) {
      display: flex;
      width: 1.5rem;
      height: 1.5rem;
      cursor: pointer;

      &:hover {
        border: 2px solid #2977ff;
      }
    }
  }
</style>
