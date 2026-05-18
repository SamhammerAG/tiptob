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
  import { onDestroy, onMount } from "svelte";

  type Suggestion = { label: string; value: string };
  type TitleRequest = { status: "idle" } | { status: "loading" } | { status: "success"; data: string } | { status: "failed" };
  type SuggestionsRequest =
    | { status: "idle" }
    | { status: "loading" }
    | { status: "success"; data: Suggestion[] }
    | { status: "failed" };

  let {
    editor,
    language = "en",
    fetchSuggestions,
    fetchTitle,
    getPreviewUrl,
    translationOverrides,
  }: {
    editor: Editor;
    language?: "de" | "en";
    fetchSuggestions: (term: string, signal?: AbortSignal) => Promise<Suggestion[]>;
    fetchTitle: (id: string, signal?: AbortSignal) => Promise<string>;
    getPreviewUrl: (id: string) => string;
    translationOverrides?: { de?: Record<string, string>; en?: Record<string, string> };
  } = $props();

  let dropdownOpen = $state(false);
  let searchTerm = $state<string | null>(null);
  let highlightIdx = $state(-1);
  let selectedSuggestion = $state<Suggestion | null>(null);
  let activeId = $state<string | null>(null);
  let titleRequest = $state<TitleRequest>({ status: "idle" });
  let suggestionsRequest = $state<SuggestionsRequest>({ status: "idle" });

  const SUGGESTION_DEBOUNCE_MS = 300;

  const translations = $derived<Record<string, Record<string, string>>>({
    de: {
      main: "Interner Link",
      placeholder: "Suchen...",
      confirm: "Bestätigen",
      open: "Öffnen",
      remove: "Link entfernen/Schließen",
      loading: "Lädt...",
      noResults: "Keine Treffer",
      error: "Fehler beim Laden",
      ...(translationOverrides?.de ?? {}),
    },
    en: {
      main: "Internal link",
      placeholder: "Search...",
      confirm: "Confirm",
      open: "Open",
      remove: "Remove/Close",
      loading: "Loading...",
      noResults: "No results",
      error: "Could not load data",
      ...(translationOverrides?.en ?? {}),
    },
  });

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let titleController: AbortController | null = null;
  let suggestionsController: AbortController | null = null;

  onMount(() => {
    editor.on("transaction", syncFromEditor);
  });

  onDestroy(() => {
    editor.off("transaction", syncFromEditor);
    clearDebounce();
    abortTitle();
    abortSuggestions();
  });

  function syncFromEditor() {
    const id = getActiveInternalLinkId();

    if (!id) {
      activeId = null;
      abortTitle();
      titleRequest = { status: "idle" };
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

  function abortTitle() {
    titleController?.abort();
    titleController = null;
  }

  function abortSuggestions() {
    suggestionsController?.abort();
    suggestionsController = null;
  }

  async function loadTitle(id: string) {
    abortTitle();
    const controller = new AbortController();
    titleController = controller;
    titleRequest = { status: "loading" };

    try {
      const title = await fetchTitle(id, controller.signal);
      if (controller.signal.aborted) return;
      titleRequest = { status: "success", data: title };
    } catch (err) {
      if (controller.signal.aborted || (err as Error)?.name === "AbortError") return;
      titleRequest = { status: "failed" };
    }
  }

  function clearDebounce() {
    if (!debounceTimer) return;
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }

  function resetSearch(term: string | null = null) {
    clearDebounce();
    abortSuggestions();
    searchTerm = term;
    selectedSuggestion = null;
    suggestionsRequest = { status: "idle" };
    highlightIdx = -1;
  }

  function onInput(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    resetSearch(term);

    if (!term.trim()) {
      return;
    }

    const controller = new AbortController();
    suggestionsController = controller;
    suggestionsRequest = { status: "loading" };
    debounceTimer = setTimeout(() => loadSuggestions(term, controller), SUGGESTION_DEBOUNCE_MS);
  }

  async function loadSuggestions(term: string, controller: AbortController) {
    debounceTimer = null;

    try {
      const items = await fetchSuggestions(term, controller.signal);
      if (!isCurrentSearch(term, controller)) return;
      suggestionsRequest = { status: "success", data: items };
      highlightIdx = items.length > 0 ? 0 : -1;
    } catch (err) {
      if (!isCurrentSearch(term, controller) || (err as Error)?.name === "AbortError") return;
      suggestionsRequest = { status: "failed" };
    }
  }

  function isCurrentSearch(term: string, controller: AbortController) {
    return controller === suggestionsController && !controller.signal.aborted && searchTerm === term;
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
    const items = suggestionsRequest.status === "success" ? suggestionsRequest.data : [];
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveHighlight(1, items);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveHighlight(-1, items);
        break;
      case "Enter":
        event.preventDefault();
        if (highlightIdx >= 0 && items[highlightIdx]) {
          pickSuggestion(items[highlightIdx]);
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

  function moveHighlight(step: 1 | -1, items: Suggestion[]) {
    if (!items.length) return;
    highlightIdx = (highlightIdx + step + items.length) % items.length;
  }

  function setFocus(element: HTMLInputElement) {
    if (!editor.isActive("internalLink")) element.focus();
  }

  let inputValue = $derived.by(() => {
    if (!activeId || searchTerm !== null) return searchTerm ?? "";
    switch (titleRequest.status) {
      case "loading":
        return translations[language].loading;
      case "failed":
        return translations[language].error;
      case "success":
        return titleRequest.data;
      default:
        return "";
    }
  });

  let searchReadonly = $derived(
    titleRequest.status === "loading" || (Boolean(activeId) && searchTerm === null && titleRequest.status === "failed"),
  );
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
          class:muted={searchReadonly}
          value={inputValue}
          placeholder={translations[language]["placeholder"]}
          oninput={onInput}
          onkeydown={onKeyDown}
          autocomplete="off"
          readonly={searchReadonly}
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

      {#if suggestionsRequest.status === "success" && suggestionsRequest.data.length}
        <ul class="tiptob-internallink-suggestions" role="listbox">
          {#each suggestionsRequest.data as item, idx (item.value)}
            <li
              role="option"
              aria-selected={idx === highlightIdx}
              class:active={idx === highlightIdx}
              title={item.label}
              onmousedown={(e) => {
                e.preventDefault();
                pickSuggestion(item);
              }}
            >
              {item.label}
            </li>
          {/each}
        </ul>
      {:else if suggestionsRequest.status === "loading"}
        <div class="tiptob-internallink-loading" role="status">{translations[language]["loading"]}</div>
      {:else if searchTerm?.trim() && suggestionsRequest.status === "failed"}
        <div class="tiptob-internallink-empty">{translations[language]["error"]}</div>
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
    width: 18rem;
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
  .tiptob-internallink-input.muted {
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
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    overflow-wrap: anywhere;
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
