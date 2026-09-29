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
  const appearance = $derived(css(s.color._primary, s.fontSize._md));
  const time = $derived(
    new Intl.DateTimeFormat(locale.localeName, {
      timeZone: locale.timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).format(new Date('2026-01-15T12:00:00Z')),
  );
</script>

<span
  data-testid={name}
  data-primary={theme.color._primary}
  data-font-size={theme.fontSize._md}
  class={appearance}>{theme.themeName} / {lang.languageName} / {locale.timeZone}</span
>
<span data-testid={name + '-message'}>{lang.messages.loading}</span>
<span
  data-testid={name + '-raw'}
  class={css(s.color.raw('_primary'), s.backgroundColor.raw('_surface'), s.fontSize.raw('_md'))}
  >主题 raw</span
>
<time data-testid={name + '-time'}>{time}</time>
<span
  data-testid={name + '-system'}
  class={css(
    s.display.inlineBlock,
    s.height._md,
    s.paddingInline._sm,
    s.borderRadius._md,
    s.opacity._disabled,
    s.fontWeight._semibold,
    s.lineHeight._normal,
    s.zIndex._modal,
    s.transitionDuration._fast,
  )}>系统 token</span
>
