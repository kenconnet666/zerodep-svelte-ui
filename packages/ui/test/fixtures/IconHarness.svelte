<script lang="ts">
  import type { ComponentProps } from 'svelte';

  import { Provider, Icon, type UiCssFactory, type UiTheme } from '../../src/lib/index.js';
  let {
    iconProps,
    css,
    theme,
    style,
    show = true,
  }: {
    iconProps: ComponentProps<typeof Icon>;
    css?: UiCssFactory;
    theme?: UiTheme;
    style?: string;
    show?: boolean;
  } = $props();
</script>

<Provider {css} {theme} {style}>
  {#if show}<Icon {...iconProps} data-testid="icon" />{/if}
  <span id="icon-description">说明图标</span>
</Provider>
