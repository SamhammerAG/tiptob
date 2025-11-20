<svelte:options customElement="tiptob-hyperlink-button" />

<script lang="ts">
  import type { Editor } from "@tiptap/core";
  import CheckIcon from "../../../icons/check-line.svg?raw";
  import CloseIcon from "../../../icons/close-line.svg?raw";
  import LinkIcon from "../../../icons/link.svg?raw";
  import OpenLink from "../../../icons/open-link.svg?raw";
  import Icon from "../../base/Icon.svelte";
  import DropdownButton from "../../base/DropdownButton.svelte";
  import Divider from "../../base/Divider.svelte";

  let { editor, language = "en" }: { editor: Editor; language: "de" | "en" } = $props();

  let dropdownOpen = $state(false);
  let urlInputField = $state("");

  const translations: Record<string, Record<string, string>> = {
    de: {
      main: "Link",
      confirm: "Bestätigen",
      open: "Öffnen",
      remove: "Link entfernen/Schließen",
    },
    en: {
      main: "Link",
      confirm: "Confirm",
      open: "Open",
      remove: "Remove/Close",
    },
  };

  $effect(() => {
    editor?.on("transaction", () => {
      if (editor.isActive("link")) {
        urlInputField = editor.getAttributes("link").href;
        dropdownOpen = true;
      } else {
        urlInputField = "";
        dropdownOpen = false;
      }
    });
  });

  function setLink() {
    const parsedUrl = urlInputField.includes(":") ? urlInputField : `https://${urlInputField}`;

    const { from, empty } = editor.state.selection;

    if (empty) {
      editor
        .chain()
        .focus()
        .insertContentAt(from, [{ type: "text", text: parsedUrl, marks: [{ type: "link", attrs: { href: parsedUrl } }] }])
        .run();
    } else {
      //@ts-expect-error: This error is expected because the editor is initilized outside of the Web-component
      editor.chain().focus().extendMarkRange("link").setLink({ href: parsedUrl }).run();
    }
    dropdownOpen = false;
  }

  function removeLink() {
    //@ts-expect-error: This error is expected because the editor is initilized outside of the Web-component
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    urlInputField = "";
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      setLink();
    }
  }

  function setFocus(element: HTMLInputElement) {
    if (!editor.isActive("link")) element.focus();
  }
</script>

{#if editor}
  <DropdownButton {editor} bind:dropdownOpen key="link" icon={LinkIcon} text="" tooltip={translations[language]["main"]}>
    <div class="tiptob-link-input-wrapper">
      <input
        id="tiptob-link-input"
        bind:value={urlInputField}
        type="url"
        placeholder="Paste a link..."
        onkeydown={handleKeyDown}
        autocomplete="off"
        class="tiptob-link-input"
        use:setFocus
      />
      <button
        type="button"
        class="confirm"
        onclick={setLink}
        disabled={!urlInputField}
        title={!urlInputField ? "" : translations[language]["confirm"]}
      >
        <Icon content={CheckIcon} />
      </button>
      <Divider></Divider>
      <button
        type="button"
        onclick={() => window.open(urlInputField, "_blank")}
        disabled={!urlInputField}
        title={translations[language]["open"]}
      >
        <Icon content={OpenLink} />
      </button>
      <button class="close" type="button" onclick={removeLink} title={translations[language]["remove"]}>
        <Icon content={CloseIcon} />
      </button>
    </div>
  </DropdownButton>
{/if}

<style>
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
    color: var(--tiptob-bg-icon, #333333);
    opacity: 0.5;
  }
  .tiptob-link-input {
    display: flex;
    padding: 0.25rem;
    background-color: var(--tiptob-bg-button, #ffffff);
    color: var(--tiptob-bg-icon, #333333);
    outline: none;
    border: 0;
  }
</style>
