<script lang="ts">
  import { Search } from '@lucide/icons';
  import { Icon, Provider } from 'zerodep-svelte-ui';
  let { label = '搜索' }: { label?: string } = $props();
</script>

<Provider theme="dark"
  ><Icon icon={Search} size="lg" color="primary" strokeWidth={1.5} aria-label={label} /></Provider
>
