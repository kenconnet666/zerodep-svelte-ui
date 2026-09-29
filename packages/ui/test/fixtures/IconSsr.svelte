<script lang="ts">
  import { Search } from '@lucide/icons';
  import {
    Icon,
    Provider,
    darkTheme,
    type UiComponentThemes,
    type IconTokens,
  } from 'zerodep-svelte-ui';
  import { css } from 'zerodep-css-svelte';
  let {
    label = '搜索',
    components,
    tokens,
  }: { label?: string; components?: UiComponentThemes; tokens?: Partial<IconTokens> } = $props();
</script>

<Provider theme={darkTheme} {components}>
  <Icon
    icon={Search}
    size="_lg"
    color="_primary"
    strokeWidth={1.5}
    {tokens}
    aria-label={label}
    class={css('width:30px;')}
  />
</Provider>
