<svelte:options customElement="tiptob-image-bubble-menu" />

<script lang="ts">
  import type { Editor } from "@tiptap/core";

  import AlignLeftIcon from "../../../icons/align-left.svg?raw";
  import AlignCenterIcon from "../../../icons/align-center.svg?raw";
  import AlignRightIcon from "../../../icons/align-right.svg?raw";
  import DeleteImageIcon from "../../../icons/delete-bin-2-line.svg?raw";
  import EraserIcon from "../../../icons/eraser-line.svg?raw";
  import Icon from "../../base/Icon.svelte";
  import SimpleButton from "../../base/SimpleButton.svelte";

  let { editor, language = "en" }: { editor: Editor; language: "de" | "en" } = $props();

  const translations: Record<string, Record<string, string>> = {
    de: {
      alignLeft: "Linksbündig",
      alignCenter: "Zentriert",
      alignRight: "Rechtsbündig",
      deleteImage: "Bild löschen",
      resetImage: "Bildformatierung zurücksetzen",
    },
    en: {
      alignLeft: "Align left",
      alignCenter: "Align center",
      alignRight: "Align right",
      deleteImage: "Delete image",
      resetImage: "Reset image formatting",
    },
  };

  type Align = "left" | "center" | "right";

  const alignments: { name: Align; icon: string; label: string }[] = [
    { name: "left", icon: AlignLeftIcon, label: "alignLeft" },
    { name: "center", icon: AlignCenterIcon, label: "alignCenter" },
    { name: "right", icon: AlignRightIcon, label: "alignRight" },
  ];

  function setAlign(align: Align) {
    editor.chain().focus().setImageAlign(align).run();
  }

  function deleteImage() {
    editor.chain().focus().deleteSelection().run();
  }

  function resetImage() {
    editor.chain().focus().resetImageStyling().run();
  }
</script>

{#if editor}
  <div class="image-bubble-menu">
    <div class="image-toolbar">
      <div class="toolbar-button-group">
        <button onclick={deleteImage} title={translations[language]["deleteImage"]}>
          <Icon content={DeleteImageIcon} />
        </button>
        <button onclick={resetImage} title={translations[language]["resetImage"]}>
          <Icon content={EraserIcon} />
        </button>
      </div>
      <div class="toolbar-button-group">
        {#each alignments as alignment (alignment.name)}
          <SimpleButton
            {editor}
            key={{ name: "imageUpload", attributes: { align: alignment.name } }}
            action={() => setAlign(alignment.name)}
            icon={alignment.icon}
            tooltip={translations[language][alignment.label]}
          />
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  .image-bubble-menu {
    background-color: var(--tiptob-bg-button, #ffffff);
    border: 1px solid var(--tiptob-bg-button, #eeeeee);
    border-radius: 0.5rem;
    box-shadow:
      0 0 2px 0 rgba(34, 47, 62, 0.2),
      0 0.25rem 0.5rem 0 rgba(34, 47, 62, 0.15);
    min-width: max-content;
    overflow: hidden;

    & .image-toolbar {
      display: flex;
      flex-direction: row;
      align-items: center;

      & .toolbar-button-group {
        display: flex;
        gap: 0.125rem;
        padding: 0.3rem 0.5rem;
        align-items: center;

        & button {
          cursor: pointer;
          display: flex;
          align-items: center;
          margin: 0.2rem 0;
          height: 1.75rem;
          border: none;
          border-radius: 0.25rem;
          background-color: var(--tiptob-bg-button, #ffffff);
          color: var(--tiptob-bg-icon, #333333);

          &:hover {
            background-color: var(--tiptob-bg-button-hover, #e2e2e2);
          }
        }
      }
    }
  }
</style>
