<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Search } from '@lucide/icons';
  import { Icon, Provider, darkTheme } from 'zerodep-svelte-ui';
  import { css } from 'zerodep-css-svelte';
  let {
    label = '搜索',
    appearance = {},
  }: { label?: string; appearance?: Partial<ComponentProps<typeof Icon>> } = $props();
</script>

<Provider theme={darkTheme}>
  <Icon
    icon={Search}
    size="_lg"
    color="_primary"
    strokeWidth={1.5}
    {...appearance}
    aria-label={label}
    class={css('width:30px;')}
  />
</Provider>
