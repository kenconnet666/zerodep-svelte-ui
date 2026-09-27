<script lang="ts">
  import { Provider, type UiCss, type UiTheme } from '../../src/lib/index.js';
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
    showNested?: boolean;
  } = $props();
</script>

<Provider {css} {theme} {locale} {style} data-testid="root" class={['custom', { active: true }]}>
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
