<script lang="ts">
  import { css } from 'zerodep-css-svelte';
  import { useConfig, useCss } from 'zerodep-svelte-ui';
  let { label }: { label: string } = $props();
  const config = useConfig();
  const s = useCss();
  const appearance = css(s.color._primary, s.fontSize._md);
</script>

<p class={appearance} data-provider-value={label}>{label}：{config.theme} / {config.locale}</p>
