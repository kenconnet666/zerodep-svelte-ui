<script lang="ts">
  import { Provider, Text, Ripple } from 'zerodep-svelte-ui';
  let { label }: { label: string } = $props();
</script>

<Provider>
  <Text as="h2" color="_primary">{label}</Text>
  <button type="button" style="position:relative"><Text>保存</Text><Ripple /></button>
</Provider>
