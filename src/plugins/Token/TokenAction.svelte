<svelte:options customElement="tiptob-token-button" />

<script lang="ts">
  import type { Editor } from "@tiptap/core";
  import Text from "../../../icons/text.svg?raw";
  import Icon from "../../base/Icon.svelte";
  import CheckIcon from "../../../icons/check-line.svg?raw";
  import CloseIcon from "../../../icons/close-line.svg?raw";
  import DropdownButton from "../../base/DropdownButton.svelte";
  import type PlaceHolder from "./PlaceHolderInterface";

  const translations: Record<string, Record<string, string>> = {
    de: {
      main: "Token auswählen",
      confirm: "Token einfügen",
      close: "Abbrechen",
      search: "Suchen...",
    },
    en: {
      main: "choose Token",
      confirm: "insert Token",
      close: "Abort",
      search: "Search...",
    },
  };

  let {
    editor,
    language = "en",
    placeHolders,
  }: { editor: Editor; language: "de" | "en"; placeHolders: Array<PlaceHolder> } = $props();

  let dropdownOpen = $state(false);

  let selected = $state("Select option");

  let searchTerm = $state("");

  let filteredPlaceholders = $derived(placeHolders.filter((p) => p.translation.toLowerCase().includes(searchTerm.toLowerCase())));

  function confirmToken() {
    editor.commands.insertContent(selected);
    dropdownOpen = false;
  }

  function closeDropdown() {
    dropdownOpen = false;
  }

  $effect(() => {
    if (!dropdownOpen && searchTerm !== "") {
      searchTerm = "";
    }
  });
</script>

{#if editor}
  <DropdownButton {editor} bind:dropdownOpen key="token" icon={Text} text="Token" tooltip={translations[language]["main"]}>
    <div class="dropdown-content">
      <div class="search-wrapper">
        <input
          type="text"
          placeholder={translations[language]["search"]}
          bind:value={searchTerm}
          onclick={(e) => e.stopPropagation()}
        />
      </div>

      <div class="menu">
        {#each filteredPlaceholders as placeholder (placeholder.translation)}
          <button class="menu-item" onclick={() => (selected = placeholder.expression)}>
            {placeholder.translation}
          </button>
        {:else}
          <div class="menu-item" style="color: #999; cursor: default;">-</div>
        {/each}
      </div>

      <div class="button-wrapper">
        <button type="button" class="confirm" onclick={confirmToken} title={translations[language]["confirm"]}>
          <Icon content={CheckIcon} />
        </button>
        <button type="button" class="close" onclick={closeDropdown} title={translations[language]["close"]}>
          <Icon content={CloseIcon} />
        </button>
      </div>
    </div>
  </DropdownButton>
{/if}

<style>
  .dropdown-content {
    display: flex;
    flex-direction: column;
    width: 15rem;
    border: 1px solid #ccc;
    background: #ffffff;
    overflow: hidden;
  }

  .search-wrapper {
    padding: 0.5rem;
    border-bottom: 1px solid #eee;
    background: #fff;
  }

  .search-wrapper input {
    width: 100%;
    padding: 0.25rem 0.5rem;
    font-size: 0.8rem;
    border: 1px solid #cecece;
    border-radius: 0.25rem;
    box-sizing: border-box;
    outline: none;
  }

  .search-wrapper input:focus {
    border-color: #aaa;
  }

  .menu {
    flex: 1;
    overflow-y: auto;
    max-height: 15rem;
  }

  .menu-item {
    padding: 0.5rem 0.75rem;
    border: none;
    background: transparent;
    text-align: left;
    cursor: pointer;
    width: 100%;
    font-size: 0.8rem;
    color: #333333;
  }

  .menu-item:focus,
  .menu-item:hover {
    background: #f0f0f0;
  }

  .button-wrapper {
    display: flex;
    justify-content: space-evenly;
    padding: 0.25rem 0;
    border-top: 1px solid #cecece;
    position: sticky;
    background: #fff;

    button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40%;
      border: none;
      border-radius: 0.25rem;
      background-color: var(--tiptob-bg-button, #ffffff);
      cursor: pointer;

      &:hover:enabled {
        background-color: var(--tiptob-bg-button-hover, #f0f0f0);
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
  }
</style>
