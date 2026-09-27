<script lang="ts">
  import { untrack } from 'svelte';
  import { css } from 'zerodep-css-svelte';
  import { useConfig, useCss, type UiCss } from '../../src/lib/index.js';
  let { name, onRead }: { name: string; onRead?: (css: UiCss) => void } = $props();
  const s = useCss();
  const config = useConfig();
  untrack(() => onRead?.(s));
  const appearance = css(s.color._primary, s.fontSize._md);
</script>

<span data-testid={name} class={appearance}>{config.theme} / {config.locale}</span>
