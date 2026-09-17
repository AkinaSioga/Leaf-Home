<script lang="ts">
  import { getIconSvg, hasIcon } from '@/constants/icons';

  let { icon, class: cls = '' }: { icon: string; class?: string } = $props();

  let svg = $derived(getIconSvg(icon));
  let exists = $derived(hasIcon(icon));
</script>

{#if exists && svg}
  <span class={`inline-icon ${cls}`.trim()} aria-hidden="true">{@html svg}</span>
{:else}
  <!-- fallback：图标未预构建时的占位圆圈 -->
  <span class={`inline-icon ${cls}`.trim()} aria-hidden="true" title={`Missing: ${icon}`}>
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" opacity="0.3" />
    </svg>
  </span>
{/if}

<style>
  .inline-icon :global(svg) {
    display: inline-block;
    width: 1em;
    height: 1em;
    vertical-align: middle;
    fill: currentColor;
  }
</style>
