<script lang="ts">
  import DOMPurify from "dompurify";

  interface IconProps {
    content: string;
  }

  let { content = $bindable() }: IconProps = $props();
</script>

<div class="icon-wrapper">
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html DOMPurify.sanitize(content, { USE_PROFILES: { svg: true } })}
</div>

<style>
  .icon-wrapper {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  :global(svg) {
    width: 1.25rem;
    height: 1.25rem;
    fill: var(--tiptob-bg-icon, #333333);
  }
</style>
