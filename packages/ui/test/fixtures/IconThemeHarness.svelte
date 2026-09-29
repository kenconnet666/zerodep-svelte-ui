<script lang="ts">
  import { Search } from '@lucide/icons';
  import {
    Icon,
    Provider,
    type UiTheme,
    type UiComponentThemes,
    type IconTokens,
  } from '../../src/lib/index.js';
  let {
    theme,
    components,
    nestedTheme,
    nestedComponents,
    tokens,
    strokeWidth,
  }: {
    theme?: UiTheme;
    components?: UiComponentThemes;
    nestedTheme?: UiTheme;
    nestedComponents?: UiComponentThemes;
    tokens?: Partial<IconTokens>;
    strokeWidth?: number;
  } = $props();
</script>

<Provider {theme} {components}>
  <Icon icon={Search} color="_primary" data-testid="root-icon" />
  <Provider theme={nestedTheme} components={nestedComponents}>
    <Icon icon={Search} color="_primary" {tokens} {strokeWidth} data-testid="nested-icon" />
  </Provider>
  <Icon icon={Search} color="_primary" data-testid="sibling-icon" />
</Provider>
