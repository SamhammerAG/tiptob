<svelte:options customElement="tiptob-alert-button" />

<script lang="ts">
  import type { Editor } from "@tiptap/core";
  import DropdownButton from "../../base/DropdownButton.svelte";
  import SimpleButton from "../../base/SimpleButton.svelte";
  import DeleteIcon from "../../../icons/delete-bin-2-line.svg?raw";
  import NoteIcon from "../../../icons/alert-note.svg?raw";
  import TipIcon from "../../../icons/alert-tip.svg?raw";
  import ImportantIcon from "../../../icons/alert-important.svg?raw";
  import WarningIcon from "../../../icons/alert-warning.svg?raw";
  import CautionIcon from "../../../icons/alert-caution.svg?raw";
  import { ALERT_TYPES, getAlertTitle, type AlertType } from "./AlertExtension";

  const ALERT_ICONS: Record<AlertType, string> = {
    note: NoteIcon,
    tip: TipIcon,
    important: ImportantIcon,
    warning: WarningIcon,
    caution: CautionIcon,
  };

  const translations: Record<string, Record<string, string>> = {
    de: { main: "Hinweisbox", remove: "Hinweisbox entfernen" },
    en: { main: "Alert box", remove: "Remove alert box" },
  };

  let { editor, language = "en", disabled = false }: { editor: Editor; language: "de" | "en"; disabled?: boolean } = $props();

  let dropdownOpen = $state(false);
  let insideAlert = $state(false);
  let allowed = $state(true);

  const updateState = () => {
    insideAlert = editor.isActive("alert");
    allowed = editor.can().setAlert("note");
  };

  // the editor is assigned after the web component is created
  $effect(() => {
    if (!editor) return;

    const current = editor;
    updateState();
    current.on("transaction", updateState);
    return () => current.off("transaction", updateState);
  });

  function setAlert(type: AlertType) {
    editor.chain().focus().setAlert(type).run();
    dropdownOpen = false;
  }

  function unsetAlert() {
    editor.chain().focus().unsetAlert().run();
    dropdownOpen = false;
  }
</script>

{#if editor}
  <DropdownButton {editor} bind:dropdownOpen disabled={disabled || !allowed} key="alert" icon={NoteIcon} tooltip={translations[language]["main"]}>
    <div class="alert-dropdown">
      {#each ALERT_TYPES as type (type)}
        <SimpleButton
          {editor}
          key={{ name: "alert", attributes: { type } }}
          action={() => setAlert(type)}
          icon={ALERT_ICONS[type]}
          text={getAlertTitle(type, language)}
          tooltip={getAlertTitle(type, language)}
        />
      {/each}
      {#if insideAlert}
        <SimpleButton {editor} action={unsetAlert} icon={DeleteIcon} text={translations[language]["remove"]} tooltip={translations[language]["remove"]} />
      {/if}
    </div>
  </DropdownButton>
{/if}

<style>
  .alert-dropdown {
    display: flex;
    flex-flow: column;
    padding: 0.25rem;
    background-color: var(--tiptob-bg-button, #fff);
  }
</style>
