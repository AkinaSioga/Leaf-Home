<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from '@components/common/Icon.svelte';

  type ThemePreference = 'system' | 'light' | 'dark';

  const labels: Record<ThemePreference, string> = {
    system: '跟随系统',
    light: '亮色模式',
    dark: '暗色模式',    
  }

  let open = $state(false);
  let preference: ThemePreference = $state('system');
  let systemQuery: MediaQueryList | undefined;
  let toggleButton: HTMLButtonElement;

  function resolveTheme(value: ThemePreference): 'light' | 'dark' {
    if (value !== 'system') return value;
    return systemQuery?.matches ? 'dark' : 'light';
  }

  function applyTheme(value: ThemePreference) {
    const theme = resolveTheme(value);
    document.documentElement.dataset.themePreference = value;
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#10101c' : '#f6f7ff');
  }
  
  function selectTheme(value: ThemePreference) {
    preference = value;
    try {
      localStorage.setItem('denia-theme', value);
    } catch {
      // 存储不可用时仍允许本次页面切换主题。
    }
    applyTheme(value);
    open = false;
  }

  function togglePanel() {
    open = !open;
  }

  onMount(() => {
    systemQuery = window.matchMedia('(prefers-color-scheme: dark)');

    let saved: string | null = null;
    try {
      saved = localStorage.getItem('denia-theme');
    } catch {
      // 存储不可用时继续使用系统偏好。
    }
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      preference = saved;
    }
    applyTheme(preference);

    // 系统主题变化时，如果当前是"跟随系统"，自动跟着换
    const handleSystemChange = () => {
      if (preference === 'system') applyTheme('system');
    };
    systemQuery.addEventListener('change', handleSystemChange);

    // 点面板外面 → 关面板
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target instanceof Element)) return;
      const target = e.target;
      const insideToggle = target.closest('.theme-toggle');
      const insidePanel = target.closest('.theme-panel');
      if (!insideToggle && !insidePanel) {
        open = false;
      }
    };
    document.addEventListener('click', handleClickOutside);

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        open = false;
        toggleButton.focus();
      }
    };
    document.addEventListener('keydown', handleKeydown);

    return () => {
      systemQuery?.removeEventListener('change', handleSystemChange);
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeydown);
    };
  });

</script>

<button
  bind:this={toggleButton}
  class="theme-toggle"
  type="button"
  aria-label={`选择主题，当前${labels[preference]}`}
  aria-controls="theme-panel"
  aria-expanded={open}
  title={labels[preference]}
  onclick={togglePanel}
>
  {#if preference === 'system'}
    <Icon icon="material-symbols:brightness-auto-outline-rounded" />
  {:else if preference === 'light'}
    <Icon icon="material-symbols:wb-sunny-outline-rounded" />
  {:else}
    <Icon icon="material-symbols:dark-mode-outline-rounded" />
  {/if}
</button>

{#if open}
  <div id="theme-panel" class="theme-panel" role="group" aria-label="主题选择">
    {#each (['system', 'light', 'dark'] as ThemePreference[]) as key}
      <button
        class="theme-panel__item"
        class:theme-panel__item--active={key === preference}
        type="button"
        aria-pressed={key === preference}
        onclick={() => selectTheme(key)}
      >
        {#if key === 'system'}
          <Icon icon="material-symbols:brightness-auto-outline-rounded" />
        {:else if key === 'light'}
          <Icon icon="material-symbols:wb-sunny-outline-rounded" />
        {:else}
          <Icon icon="material-symbols:dark-mode-outline-rounded" />
        {/if}
        <span>{labels[key]}</span>
      </button>
    {/each}
  </div>
{/if}

<style lang="stylus">
  .theme-toggle
    display grid
    place-items center
    width 2.75rem
    height 2.75rem
    padding 0
    border 1px solid transparent
    border-radius .75rem
    color var(--text-primary)
    background transparent
    font-size 1.2rem
    cursor pointer
    transition background .2s, border-color .2s

    &:hover
      background var(--surface-muted)
      border-color var(--line-soft)

    &:focus-visible
      outline 3px solid var(--focus-ring)
      outline-offset 3px

  .theme-panel
    position absolute
    top calc(100% + .5rem)
    right 0
    z-index 200
    min-width 11rem
    padding .4rem
    border 1px solid var(--line-soft)
    border-radius .85rem
    background var(--surface-raised)
    box-shadow var(--shadow-card)
    backdrop-filter blur(18px)

  .theme-panel__item
    display flex
    align-items center
    gap .65rem
    width 100%
    min-height 2.5rem
    padding .45rem .8rem
    border 0
    border-radius .6rem
    color var(--text-secondary)
    background transparent
    font inherit
    font-size .88rem
    cursor pointer
    transition background .15s

    &:hover
      background var(--surface-muted)

  .theme-panel__item--active
    color var(--accent-blue-strong)
    background var(--surface-muted)
    font-weight 700
</style>
