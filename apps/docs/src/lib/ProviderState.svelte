<script lang="ts">
  import { css } from 'zerodep-css-svelte';
  import { useTheme, useLocale, useLang, useCss } from 'zerodep-svelte-ui';
  let { label }: { label: string } = $props();
  const theme = useTheme();
  const locale = useLocale();
  const lang = useLang();
  const s = useCss();
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

<p class={appearance} data-provider-value={label}>
  {label}：{theme.themeName} / {lang.languageName}
</p>
<p data-provider-language={label}>{lang.messages.loading}</p>
<p data-provider-keyword={label}>主色实际值：{s.keywords.color._primary}</p>
<p>
  {locale.localeName} · {locale.timeZone} · <time data-provider-time={label}>{time}</time>
</p>
