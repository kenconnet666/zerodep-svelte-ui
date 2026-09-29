<script lang="ts">
  import { Search } from '@lucide/icons';
  import { Icon, Provider, darkTheme } from 'zerodep-svelte-ui';
  import { css } from 'zerodep-css-svelte';
  let { label = '搜索' }: { label?: string } = $props();
</script>

<Provider theme={darkTheme}>
  <Icon
    icon={Search}
    size="lg"
    color="primary"
    strokeWidth={1.5}
    aria-label={label}
    class={css('width:30px;')}
  />
</Provider>
