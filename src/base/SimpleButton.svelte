<script lang="ts">
  import type { Editor } from "@tiptap/core";
  import Icon from "./Icon.svelte";
  import { onMount } from "svelte";

  interface Props {
    editor: Editor;
    key: string | { name: string; attributes?: {} } | { attributes: {} };
    action: () => void;
    icon: string;
    tooltip: string;
    text?: string;
    dropdownOpen?: boolean;
  }

  let { editor, key, action, icon, tooltip, text = "", dropdownOpen = $bindable(false) }: Props = $props();

  let highlighted = $state(false);
  let disabled = $state(false);

  function setHighlighted() {
    if (typeof key === "string") {
      highlighted = key === "textStyle" ? !!editor.getAttributes(key).color && editor.isActive(key) : editor.isActive(key);
    } else if ("name" in key) {
      highlighted = editor.isActive(key.name, key.attributes);
    } else if ("attributes" in key) {
      highlighted = editor.isActive(key.attributes);
    }
  }

  function setDisabled() {
    disabled = !editor.isEditable;
  }

  onMount(() => {
    setHighlighted();
    setDisabled();

    editor.on("transaction", setHighlighted);
    editor.on("update", () => setDisabled);
  });
</script>

<button {disabled} class:highlighted class:dropdownOpen onclick={() => action()} title={disabled ? "" : tooltip}>
  <Icon content={icon} />
  {#if text}
    <div class="icon-text">{text}</div>
  {/if}
</button>

<style>
  button {
    display: flex;
    align-items: center;

    margin: 0.2rem 0;
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
      margin-left: 0.25rem;
    }
  }

  button:enabled {
    cursor: pointer;
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
