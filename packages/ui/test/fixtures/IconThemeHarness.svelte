<script lang="ts">
  import { Search } from '@lucide/icons';
  import { Icon, Provider, type UiTheme } from '../../src/lib/index.js';
  let { theme, nestedTheme }: { theme?: UiTheme; nestedTheme?: UiTheme } = $props();
</script>

<Provider {theme}>
  <Icon icon={Search} color="_primary" data-testid="root-icon" />
  <Provider theme={nestedTheme}>
    <Icon icon={Search} color="_primary" data-testid="nested-icon" />
  </Provider>
  <Icon icon={Search} color="_primary" data-testid="sibling-icon" />
</Provider>
