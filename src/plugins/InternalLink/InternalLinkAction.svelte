<svelte:options customElement="tiptob-internal-link-button" />

<script lang="ts">
  import type { Editor } from "@tiptap/core";
  import CheckIcon from "../../../icons/check-line.svg?raw";
  import CloseIcon from "../../../icons/close-line.svg?raw";
  import ArticleIcon from "../../../icons/article-line.svg?raw";
  import OpenLink from "../../../icons/open-link.svg?raw";
  import Icon from "../../base/Icon.svelte";
  import DropdownButton from "../../base/DropdownButton.svelte";
  import Divider from "../../base/Divider.svelte";

  type Suggestion = { label: string; value: string };

  let {
    editor,
    language = "en",
    fetchSuggestions,
    fetchTitle,
    getPreviewUrl,
  }: {
    editor: Editor;
    language?: "de" | "en";
    fetchSuggestions: (term: string) => Promise<Suggestion[]>;
    fetchTitle: (id: string) => Promise<string>;
    getPreviewUrl: (id: string) => string;
  } = $props();

  let dropdownOpen = $state(false);
  let searchTerm = $state<string | null>(null);
  let suggestions = $state<Suggestion[]>([]);
  let highlightIdx = $state(-1);
  let selectedSuggestion = $state<Suggestion | null>(null);
  let activeId = $state<string | null>(null);
  let activeTitle = $state<string>("");
  let titleError = $state(false);
  let suggestionsLoading = $state(false);

  const SUGGESTION_DEBOUNCE_MS = 300;

  const translations: Record<string, Record<string, string>> = {
    de: {
      main: "Interner Link",
      placeholder: "Suchen...",
      confirm: "Bestätigen",
      open: "Vorschau öffnen",
      remove: "Link entfernen/Schließen",
      loading: "Lädt...",
      noResults: "Keine Treffer",
      error: "Titel konnte nicht geladen werden",
    },
    en: {
      main: "Internal link",
      placeholder: "Search...",
      confirm: "Confirm",
      open: "Open preview",
      remove: "Remove/Close",
      loading: "Loading...",
      noResults: "No results",
      error: "Could not load title",
    },
  };

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let titleFetchToken = 0;
  let suggestionsFetchToken = 0;

  $effect(() => {
    if (!editor) return;
    const onTransaction = () => syncFromEditor();

    editor.on("transaction", onTransaction);

    return () => {
      editor.off("transaction", onTransaction);
      clearDebounce();
      titleFetchToken++;
      suggestionsFetchToken++;
    };
  });

  function syncFromEditor() {
    const id = getActiveInternalLinkId();

    if (!id) {
      activeId = null;
      activeTitle = "";
      titleError = false;
      dropdownOpen = false;
      resetSearch();
      return;
    }

    if (id !== activeId) {
      activeId = id;
      resetSearch();
      loadTitle(id);
    }

    dropdownOpen = true;
  }

  function getActiveInternalLinkId() {
    if (!editor.isActive("internalLink")) return null;
    return (editor.getAttributes("internalLink").internalLinkId as string | null | undefined) ?? null;
  }

  async function loadTitle(id: string) {
    const token = ++titleFetchToken;
    activeTitle = "";
    titleError = false;

    try {
      const title = await fetchTitle(id);
      if (token !== titleFetchToken) return;
      activeTitle = title;
    } catch {
      if (token !== titleFetchToken) return;
      titleError = true;
    }
  }

  function clearDebounce() {
    if (!debounceTimer) return;
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }

  function resetSearch(term: string | null = null) {
    clearDebounce();
    suggestionsFetchToken++;
    searchTerm = term;
    selectedSuggestion = null;
    suggestions = [];
    suggestionsLoading = false;
    highlightIdx = -1;
  }

  function onInput(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    resetSearch(term);

    if (!term.trim()) {
      return;
    }

    const token = suggestionsFetchToken;
    suggestionsLoading = true;
    debounceTimer = setTimeout(() => loadSuggestions(term, token), SUGGESTION_DEBOUNCE_MS);
  }

  async function loadSuggestions(term: string, token: number) {
    debounceTimer = null;

    try {
      const items = await fetchSuggestions(term);
      if (!isCurrentSearch(term, token)) return;
      suggestions = items;
      highlightIdx = items.length > 0 ? 0 : -1;
    } catch {
      if (!isCurrentSearch(term, token)) return;
      suggestions = [];
    } finally {
      if (isCurrentSearch(term, token)) {
        suggestionsLoading = false;
      }
    }
  }

  function isCurrentSearch(term: string, token: number) {
    return token === suggestionsFetchToken && searchTerm === term;
  }

  function pickSuggestion(item: Suggestion) {
    resetSearch(item.label);
    selectedSuggestion = item;
  }

  function confirm() {
    if (!selectedSuggestion) return;
    editor.chain().focus().setInternalLink(selectedSuggestion.value, selectedSuggestion.label).run();
    dropdownOpen = false;
  }

  function openPreview() {
    if (!activeId) return;
    const previewWindow = window.open(getPreviewUrl(activeId), "_blank", "noopener,noreferrer");
    if (previewWindow) previewWindow.opener = null;
  }

  function removeLink() {
    if (editor.isActive("internalLink")) {
      editor.chain().focus().unsetInternalLink().run();
    }
    dropdownOpen = false;
  }

  function onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveHighlight(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveHighlight(-1);
        break;
      case "Enter":
        event.preventDefault();
        if (highlightIdx >= 0 && suggestions[highlightIdx]) {
          pickSuggestion(suggestions[highlightIdx]);
        } else {
          confirm();
        }
        break;
      case "Escape":
        event.preventDefault();
        resetSearch();
        dropdownOpen = false;
        break;
    }
  }

  function moveHighlight(step: 1 | -1) {
    if (suggestions.length === 0) return;
    highlightIdx = (highlightIdx + step + suggestions.length) % suggestions.length;
  }

  function setFocus(element: HTMLInputElement) {
    if (!editor.isActive("internalLink")) element.focus();
  }

  let inputValue = $derived(
    activeId && searchTerm === null
      ? titleError
        ? translations[language].error
        : activeTitle || translations[language].loading
      : (searchTerm ?? ""),
  );

  let titleLoading = $derived(Boolean(activeId && searchTerm === null && !activeTitle && !titleError));
</script>

{#if editor}
  <DropdownButton
    {editor}
    bind:dropdownOpen
    key="internalLink"
    icon={ArticleIcon}
    text=""
    tooltip={translations[language]["main"]}
  >
    <div class="tiptob-internallink-wrapper">
      <div class="tiptob-internallink-row">
        <input
          type="text"
          class="tiptob-internallink-input"
          value={inputValue}
          placeholder={translations[language]["placeholder"]}
          oninput={onInput}
          onkeydown={onKeyDown}
          autocomplete="off"
          readonly={titleLoading}
          use:setFocus
        />
        <button
          type="button"
          class="confirm"
          onclick={confirm}
          disabled={!selectedSuggestion}
          title={!selectedSuggestion ? "" : translations[language]["confirm"]}
        >
          <Icon content={CheckIcon} />
        </button>
        <Divider></Divider>
        <button type="button" onclick={openPreview} disabled={!activeId} title={translations[language]["open"]}>
          <Icon content={OpenLink} />
        </button>
        <button type="button" class="close" onclick={removeLink} title={translations[language]["remove"]}>
          <Icon content={CloseIcon} />
        </button>
      </div>

      {#if suggestions.length > 0}
        <ul class="tiptob-internallink-suggestions" role="listbox">
          {#each suggestions as item, idx (item.value)}
            <li
              role="option"
              aria-selected={idx === highlightIdx}
              class:active={idx === highlightIdx}
              onmousedown={(e) => {
                e.preventDefault();
                pickSuggestion(item);
              }}
            >
              {item.label}
            </li>
          {/each}
        </ul>
      {:else if suggestionsLoading}
        <div class="tiptob-internallink-loading" role="status">{translations[language]["loading"]}</div>
      {:else if searchTerm?.trim() && !selectedSuggestion}
        <div class="tiptob-internallink-empty">{translations[language]["noResults"]}</div>
      {/if}
    </div>
  </DropdownButton>
{/if}

<style>
  .tiptob-internallink-wrapper {
    display: flex;
    flex-direction: column;
    background-color: var(--tiptob-bg-button, #ffffff);
    min-width: 18rem;
  }
  .tiptob-internallink-row {
    display: flex;
    flex-direction: row;
    gap: 0.25rem;
    padding: 0.25rem;
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
  .tiptob-internallink-input {
    flex: 1;
    padding: 0.25rem;
    background-color: var(--tiptob-bg-button, #ffffff);
    color: var(--tiptob-bg-icon, #333333);
    outline: none;
    border: 0;
  }
  .tiptob-internallink-input::placeholder {
    color: var(--tiptob-bg-icon, #333333);
    opacity: 0.5;
  }
  .tiptob-internallink-suggestions {
    list-style: none;
    margin: 0;
    padding: 0;
    max-height: 12rem;
    overflow-y: auto;
    border-top: 1px solid var(--tiptob-bg-button-hover, #f0f0f0);
  }
  .tiptob-internallink-suggestions li {
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    color: var(--tiptob-bg-icon, #333333);
  }
  .tiptob-internallink-suggestions li:hover {
    background-color: var(--tiptob-bg-button-hover, #f0f0f0);
    color: var(--tiptob-bg-icon, #333333);
  }
  .tiptob-internallink-suggestions li.active {
    background-color: var(--tiptob-bg-button-highlighted, #f0f7ff);
    color: var(--tiptob-bg-icon-highlighted, #2977ff);
  }
  .tiptob-internallink-loading,
  .tiptob-internallink-empty {
    padding: 0.5rem;
    font-size: 0.85rem;
    color: var(--tiptob-bg-icon, #333333);
    opacity: 0.7;
    border-top: 1px solid var(--tiptob-bg-button-hover, #f0f0f0);
  }
</style>
