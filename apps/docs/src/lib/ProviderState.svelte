<script lang="ts">
  import { css } from 'zerodep-css-svelte';
  import { useConfig, useCss } from 'zerodep-svelte-ui';
  let { label }: { label: string } = $props();
  const config = useConfig();
  const s = useCss();
  const appearance = $derived(
    css(s.color.raw(config.theme.color.primary), s.fontSize.raw(config.theme.fontSize.md)),
  );
  const time = $derived(
    new Intl.DateTimeFormat(config.locale.code, {
      timeZone: config.locale.timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).format(new Date('2026-01-15T12:00:00Z')),
  );
</script>

<p class={appearance} data-provider-value={label}>
  {label}：{config.theme.themeName} / {config.lang.code}
</p>
<p data-provider-language={label}>{config.lang.messages.loading}</p>
<p>
  {config.locale.code} · {config.locale.timeZone} · <time data-provider-time={label}>{time}</time>
</p>
