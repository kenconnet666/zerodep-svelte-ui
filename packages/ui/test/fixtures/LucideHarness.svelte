<script lang="ts">
  import { Icon, Provider } from 'zerodep-svelte-ui';
  let { plus = false }: { plus?: boolean } = $props();
</script>

<Provider>
  {#if plus}
    <Icon lucide="plus" aria-label="添加" data-testid="lucide-icon" />
  {:else}
    <Icon lucide={(i) => i.search} aria-label="搜索" data-testid="lucide-icon" />
  {/if}
</Provider>
