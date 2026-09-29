<script lang="ts">
  import { Provider, type UiCss, type UiTheme } from '../../src/lib/index.js';
  import type { CssInput } from 'zerodep-css-svelte';
  import ConfigProbe from './ConfigProbe.svelte';
  let {
    css,
    theme,
    locale,
    nestedTheme,
    nestedLocale,
    localCss,
    onRead,
    style,
    className,
    showNested = true,
  }: {
    css?: UiCss;
    theme?: UiTheme;
    locale?: string;
    nestedTheme?: UiTheme;
    nestedLocale?: string;
    localCss?: UiCss;
    onRead?: (css: UiCss) => void;
    style?: string;
    className?: CssInput;
    showNested?: boolean;
  } = $props();
</script>

<Provider {css} {theme} {locale} {style} data-testid="root" class={className}>
  <ConfigProbe name="root-value" {onRead} />
  {#if showNested}
    <Provider theme={nestedTheme} locale={nestedLocale} data-testid="nested">
      <ConfigProbe name="nested-value" {onRead} />
    </Provider>
  {/if}
  <Provider css={localCss} data-testid="local">
    <ConfigProbe name="local-value" {onRead} />
  </Provider>
  <ConfigProbe name="sibling-value" {onRead} />
</Provider>
