<script lang="ts">
  import type { Snippet } from "svelte";
  import { clickOutside } from "../utils/click-outside";
  import SimpleButton from "./SimpleButton.svelte";
  import type { Editor } from "@tiptap/core";
  import { fly } from "svelte/transition";
  import type { ButtonKey } from "./ButtonKey";
  import type { Action } from "svelte/action";
  import { autoUpdate, computePosition, flip, offset, shift } from "@floating-ui/dom";

  interface Props {
    editor: Editor;
    key?: ButtonKey;
    icon: string;
    children: Snippet;
    tooltip: string;
    text?: string;
    dropdownOpen?: boolean;
    disabled?: boolean;
  }

  let { editor, key, icon, text = "", dropdownOpen = $bindable(), children, tooltip, disabled = false }: Props = $props();
  const gap = 6;

  function toggleDropdown() {
    dropdownOpen = !dropdownOpen;
  }

  // Close dropdown when user clicks outside
  function outsideclick() {
    dropdownOpen = false;
  }

  const floatingDropdown: Action<HTMLDivElement> = (menu) => {
    const wrapper = menu.parentElement;

    menu.showPopover();

    return {
      destroy: autoUpdate(wrapper, menu, () =>
        computePosition(wrapper, menu, {
          strategy: "fixed",
          placement: "bottom-start",
          middleware: [offset(gap), flip(), shift({ padding: gap })],
        }).then(({ x, y }) => {
          menu.style.left = `${x}px`;
          menu.style.top = `${y}px`;
        }),
      ),
    };
  };
</script>

<div class="dropdown-wrapper" class:open={dropdownOpen} use:clickOutside onoutclick={outsideclick}>
  <SimpleButton {key} {editor} action={toggleDropdown} {icon} {text} {tooltip} {dropdownOpen} {disabled} />

  {#if dropdownOpen}
    <div use:floatingDropdown popover="manual" transition:fly class="dropdown">
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
      position: fixed;
      inset: auto;
      margin: 0;
      border: none;
      padding: 0;
      color: inherit;
      box-shadow:
        rgba(0, 0, 0, 0.05) 0px 6px 10px 0px,
        rgba(0, 0, 0, 0.1) 0px 0px 0px 1px;
      background-color: var(--tiptob-bg-button, #ffffff);
    }
  }
</style>
