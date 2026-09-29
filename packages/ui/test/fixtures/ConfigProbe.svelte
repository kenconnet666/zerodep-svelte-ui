<script lang="ts">
  import { untrack } from 'svelte';
  import { css, type Css } from 'zerodep-css-svelte';
  import { useTheme, useLocale, useLang, useCss } from '../../src/lib/index.js';
  let { name, onRead }: { name: string; onRead?: (css: Css) => void } = $props();
  const s = useCss();
  const theme = useTheme();
  const locale = useLocale();
  const lang = useLang();
  untrack(() => onRead?.(s));
  const appearance = $derived(css(s.color.primary, s.fontSize.md));
  const time = $derived(
    new Intl.DateTimeFormat(locale.code, {
      timeZone: locale.timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).format(new Date('2026-01-15T12:00:00Z')),
  );
</script>

<span
  data-testid={name}
  data-primary={theme.color.primary}
  data-font-size={theme.fontSize.md}
  class={appearance}>{theme.themeName} / {lang.code} / {locale.timeZone}</span
>
<span data-testid={name + '-message'}>{lang.messages.loading}</span>
<time data-testid={name + '-time'}>{time}</time>
