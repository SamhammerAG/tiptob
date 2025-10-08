<script lang="ts">
  import type { Snippet } from "svelte";
  import { clickOutside } from "../utils/click-outside";
  import SimpleButton from "./SimpleButton.svelte";
  import type { Editor } from "@tiptap/core";
  import { fly } from "svelte/transition";

  interface Props {
    editor: Editor;
    key: string | { name: string; attributes?: object } | { attributes: object };
    icon: string;
    children: Snippet;
    tooltip: string;
    text?: string;
    dropdownOpen?: boolean;
  }

  let { editor, key, icon, text = "", dropdownOpen = $bindable(), children, tooltip }: Props = $props();

  function toggleDropdown() {
    dropdownOpen = !dropdownOpen;
  }

  // Close dropdown when user clicks outside
  function outsideclick() {
    dropdownOpen = false;
  }
</script>

<div class="dropdown-wrapper" class:open={dropdownOpen} use:clickOutside onoutclick={outsideclick}>
  <SimpleButton {key} {editor} action={toggleDropdown} {icon} {text} {tooltip} {dropdownOpen} />

  {#if dropdownOpen}
    <div transition:fly class="dropdown">
      {@render children()}
    </div>
  {/if}
</div>

<style>
  .dropdown-wrapper {
    position: relative;

    :global(> button::after) {
      margin-left: 0.25rem;
      content: "";
      display: inline-block;
      border-top: 0.3rem solid var(--tiptob-bg-icon, #333333);
      border-right: 0.3rem solid transparent;
      border-left: 0.3rem solid transparent;
      transition: transform 0.3s ease;
      transform: rotate(0deg);
    }

    &.open :global(> button::after) {
      transform: rotate(180deg);
    }

    .dropdown {
      z-index: 99;
      position: absolute;
      box-shadow:
        rgba(0, 0, 0, 0.05) 0px 6px 10px 0px,
        rgba(0, 0, 0, 0.1) 0px 0px 0px 1px;
      background-color: var(--tiptob-bg-button, #ffffff);
      top: 2.125rem;
    }
  }
</style>
