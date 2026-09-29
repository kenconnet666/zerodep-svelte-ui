<script lang="ts">
  import { Search } from '@lucide/icons';
  import { Icon, Provider } from '../../src/lib/index.js';
  const components = $state({ Icon: { sizeMd: '20px' } });
  const tokens = $state({ colorPrimary: 'purple' });
</script>

<button
  onclick={() => {
    components.Icon.sizeMd = '26px';
    tokens.colorPrimary = 'green';
  }}>更新图标 token</button
>
<Provider {components}
  ><Provider><Icon icon={Search} {tokens} color="_primary" data-testid="mutable-icon" /></Provider
  ></Provider
>
