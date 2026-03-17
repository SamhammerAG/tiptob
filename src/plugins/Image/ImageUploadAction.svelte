<svelte:options customElement="tiptob-image-button" />

<script lang="ts">
  import SimpleButton from "../../base/SimpleButton.svelte";
  import Icon from "../../base/Icon.svelte";
  import CloseIcon from "../../../icons/close-line.svg?raw";
  import DropdownButton from "../../base/DropdownButton.svelte";
  import ImageIcon from "../../../icons/image-add-line.svg?raw";
  import CheckIcon from "../../../icons/check-line.svg?raw";
  import type { Editor } from "@tiptap/core";

  interface Props {
    editor: Editor;
    language: "de" | "en";
    imageUpload: (file: File) => Promise<string>;
  }
  let { editor, language = "en", imageUpload }: Props = $props();

  const translations: Record<string, string> = {
    de: "Bild einfügen",
    en: "Insert Image",
  };

  let dropdownOpen = $state(false);
  let urlInputField = $state("");

  //svelte-ignore non_reactive_update
  let input: HTMLInputElement;

  // --- Image Upload Logic ---
  function processImages(e: Event) {
    const target = e.target as HTMLInputElement;
    for (const file of target.files ?? []) {
      imageUpload(file).then((imageSrc: string) => editor.chain().focus().setImage({ src: imageSrc }).run());
    }
    input.value = "";
  }

  // --- Fallback Logic---
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      addImageURL();
    }
  }

  function addImageURL() {
    if (urlInputField.trim()) {
      editor.chain().focus().setImage({ src: urlInputField.trim() }).run();
      urlInputField = "";
      dropdownOpen = false;
    }
  }
</script>

{#if editor}
  {#if imageUpload !== undefined}
    <!-- File upload button -->
    <SimpleButton {editor} key="image" action={() => input.click()} icon={ImageIcon} tooltip={translations[language]} />
    <input onchange={processImages} multiple bind:this={input} type="file" accept="image/*" />
  {:else}
    <!-- Image URL modal button -->
    <DropdownButton {editor} bind:dropdownOpen key="image" icon={ImageIcon} text="" tooltip={translations[language]}>
      <div class="tiptob-link-input-wrapper">
        <input
          id="tiptob-link-input"
          bind:value={urlInputField}
          type="url"
          placeholder="Paste a Image Url..."
          onkeydown={handleKeyDown}
          autocomplete="off"
          class="tiptob-link-input"
        />
        <button
          type="button"
          class="confirm"
          onclick={addImageURL}
          disabled={!urlInputField}
          title={!urlInputField ? "" : translations[language]}
        >
          <Icon content={CheckIcon} />
        </button>
        <button
          class="close"
          type="button"
          onclick={() => {
            dropdownOpen = false;
            urlInputField = "";
          }}
        >
          <Icon content={CloseIcon} />
        </button>
      </div>
    </DropdownButton>
  {/if}
{/if}

<style>
  /* --- Image URL Modal Styles --- */
  .tiptob-link-input-wrapper {
    display: flex;
    flex-direction: row;
    gap: 0.25rem;
    padding: 0.25rem;
    background-color: var(--tiptob-bg-button, #ffffff);
  }

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0.25rem;
    border: none;
    border-radius: 0.25rem;
    background-color: var(--tiptob-bg-button, #ffffff);
    flex: 40%;
    &:hover:enabled {
      background-color: var(--tiptob-bg-button-hover, #f0f0f0);
    }
    &:disabled {
      opacity: 0.5;
      cursor: default;

      &.confirm {
        :global(svg) {
          fill: var(--tiptob-bg-icon, #333333);
        }
      }
    }

    &.confirm {
      :global(svg) {
        fill: var(--icon-green, #28a745);
      }
    }

    &.close {
      :global(svg) {
        fill: var(--icon-red, #dc3545);
      }
    }
  }
  .tiptob-link-input::placeholder {
    color: var(--table-resubmission-line, rgba(0, 0, 0, 0.4));
  }
  .tiptob-link-input {
    display: flex;
    padding: 0.25rem;
    background-color: var(--tiptob-bg-button, #ffffff);
    color: var(--tiptob-bg-icon, #333333);
    outline: none;
    border: 0;
  }
  /* --- File Input Styles --- */
  input[type="file"] {
    display: none;
  }
</style>
