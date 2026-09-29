<script lang="ts">
  import { untrack } from 'svelte';
  import { css, type Css } from 'zerodep-css-svelte';
  import { useConfig, useCss } from '../../src/lib/index.js';
  let { name, onRead }: { name: string; onRead?: (css: Css) => void } = $props();
  const s = useCss();
  const config = useConfig();
  untrack(() => onRead?.(s));
  const appearance = $derived(css(s.color.primary, s.fontSize.md));
  const time = $derived(
    new Intl.DateTimeFormat(config.locale.code, {
      timeZone: config.locale.timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).format(new Date('2026-01-15T12:00:00Z')),
  );
</script>

<span data-testid={name} class={appearance}
  >{config.theme.themeName} / {config.lang.code} / {config.locale.timeZone}</span
>
<span data-testid={name + '-message'}>{config.lang.messages.loading}</span>
<time data-testid={name + '-time'}>{time}</time>
