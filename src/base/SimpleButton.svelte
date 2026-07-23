<script lang="ts">
  import type { Editor } from "@tiptap/core";
  import Icon from "./Icon.svelte";
  import { onDestroy, onMount } from "svelte";
  import type { ButtonKey } from "./ButtonKey";

  interface Props {
    editor: Editor;
    key?: ButtonKey;
    action: () => void;
    icon?: string;
    tooltip: string;
    text?: string;
    dropdownOpen?: boolean;
    disabled?: boolean;
  }

  let {
    editor,
    key,
    action,
    icon,
    tooltip,
    text = "",
    dropdownOpen = $bindable(false),
    disabled: externalDisabled = $bindable(false),
  }: Props = $props();

  let highlighted = $state(false);
  let isEditorReadonly = $state(false);
  let disabled = $derived(isEditorReadonly || externalDisabled);

  function setHighlighted() {
    if (typeof key === "string") {
      highlighted = editor.isActive(key);
    } else if ("isActive" in key) {
      highlighted = key.isActive(editor);
    } else if ("name" in key) {
      highlighted = editor.isActive(key.name, key.attributes);
    } else if ("attributes" in key) {
      highlighted = editor.isActive(key.attributes);
    }
  }

  function setIsEditorReadonly() {
    isEditorReadonly = !editor.isEditable;
  }

  onMount(() => {
    if (key !== undefined) {
      setHighlighted();
      editor.on("transaction", setHighlighted);
    }

    setIsEditorReadonly();
    editor.on("update", setIsEditorReadonly);
  });

  onDestroy(() => {
    if (key !== undefined) {
      editor.off("transaction", setHighlighted);
    }

    editor.off("update", setIsEditorReadonly);
  });
</script>

<button {disabled} class:highlighted class:dropdownOpen onclick={() => action()} title={disabled ? "" : tooltip}>
  {#if icon}
    <Icon content={icon} />
  {/if}
  {#if text}
    <div class="icon-text">{text}</div>
  {/if}
</button>

<style>
  button {
    display: flex;
    gap: 0.25rem;
    align-items: center;

    margin: 0.2rem 0;
    height: 1.75rem;
    border: none;
    border-radius: 0.25rem;
    background-color: var(--tiptob-bg-button, #ffffff);

    &:hover:enabled {
      background-color: var(--tiptob-bg-button-hover, #f0f0f0);

      :global(svg) {
        fill: var(--tiptob-bg-icon-hover, #333333);
      }
    }

    &:hover:enabled::after {
      border-top: 0.3rem solid var(--tiptob-bg-icon-hover, #333333);
    }

    .icon-text {
      font-size: 0.8rem;
    }
  }

  button:enabled {
    cursor: pointer;
  }

  button:disabled {
    opacity: var(--tiptob-button-disabled-opacity, 1);
  }
  button.dropdownOpen:enabled,
  button.highlighted:enabled {
    color: var(--tiptob-bg-icon-highlighted, #2977ff);
    background-color: var(--tiptob-bg-button-highlighted, #f0f7ff);

    :global(svg) {
      fill: var(--tiptob-bg-icon-highlighted, #2977ff);
    }
  }

  button.dropdownOpen:enabled::after,
  button.highlighted:enabled::after {
    border-top: 0.3rem solid var(--tiptob-bg-icon-highlighted, #2977ff);
  }
</style>
