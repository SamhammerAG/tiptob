<svelte:options customElement="tiptob-text-align-button" />

<script lang="ts">
  import TextAlignRightIcon from "../../../icons/align-right.svg?raw";
  import TextAlignLeftIcon from "../../../icons/align-left.svg?raw";
  import TextAlignCenterIcon from "../../../icons/align-center.svg?raw";
  import TextAlignJustifyIcon from "../../../icons/align-justify.svg?raw";
  import DropdownButton from "../../base/DropdownButton.svelte";
  import type { Editor } from "@tiptap/core";
  import SimpleButton from "../../base/SimpleButton.svelte";

  let { editor, language = "en" }: { editor: Editor; language: "de" | "en" } = $props();

  let dropdownOpen = $state(false);

  const translations: Record<string, Record<string, string>> = {
    de: {
      main: "Textausrichtung",
      left: "Linksbündig",
      center: "Zentriert",
      right: "Rechtsbündig",
      justify: "Blocksatz",
    },
    en: {
      main: "Text alignment",
      left: "Align left",
      center: "Align center",
      right: "Align right",
      justify: "Justify",
    },
  };

  const textAlignments: { name: string; icon: string; action: () => void }[] = [
    {
      name: "left",
      icon: TextAlignLeftIcon,
      action: () => {
        //@ts-expect-error: This error is expected because the editor is initialized outside of the Web-component
        editor.chain().focus().setTextAlign("left").run();
        dropdownOpen = false;
      },
    },
    {
      name: "center",
      icon: TextAlignCenterIcon,
      action: () => {
        //@ts-expect-error: This error is expected because the editor is initialized outside of the Web-component
        editor.chain().focus().setTextAlign("center").run();
        dropdownOpen = false;
      },
    },
    {
      name: "right",
      icon: TextAlignRightIcon,
      action: () => {
        //@ts-expect-error: This error is expected because the editor is initialized outside of the Web-component
        editor.chain().focus().setTextAlign("right").run();
        dropdownOpen = false;
      },
    },
    {
      name: "justify",
      icon: TextAlignJustifyIcon,
      action: () => {
        //@ts-expect-error: This error is expected because the editor is initialized outside of the Web-component
        editor.chain().focus().setTextAlign("justify").run();
        dropdownOpen = false;
      },
    },
  ];
</script>

{#if editor}
  <DropdownButton {editor} bind:dropdownOpen key="textAlign" icon={TextAlignLeftIcon} tooltip={translations[language]["main"]}>
    <div class="text-align-dropdown">
      {#each textAlignments as alignment (alignment.name)}
        <SimpleButton
          {editor}
          key={{ attributes: { textAlign: alignment.name } }}
          action={() => alignment.action()}
          icon={alignment.icon}
          tooltip={translations[language][alignment.name]}
        ></SimpleButton>
      {/each}
    </div>
  </DropdownButton>
{/if}

<style>
  .text-align-dropdown {
    display: flex;
    flex-flow: column;
    padding: 0.25rem;
    background-color: var(--tiptob-bg-button, #fff);
  }
</style>
