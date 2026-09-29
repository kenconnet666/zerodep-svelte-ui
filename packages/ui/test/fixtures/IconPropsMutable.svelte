<script lang="ts">
  import { Search } from '@lucide/icons';
  import { Icon, Provider, lightTheme } from '../../src/lib/index.js';
  const theme = $state({
    ...lightTheme,
    fontSize: { ...lightTheme.fontSize },
    color: { ...lightTheme.color },
  });
  const appearance = $state({ strokeWidth: 2, verticalAlign: '-0.125em' });
</script>

<button
  onclick={() => {
    theme.fontSize._md = '26px';
    theme.color._primary = 'green';
    appearance.strokeWidth = 3;
    appearance.verticalAlign = '0px';
  }}>更新图标外观</button
>
<Provider {theme}
  ><Provider
    ><Icon icon={Search} {...appearance} color="_primary" data-testid="mutable-icon" /></Provider
  ></Provider
>
