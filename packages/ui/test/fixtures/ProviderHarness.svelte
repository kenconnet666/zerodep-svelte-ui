<script lang="ts">
  import { Provider, type UiTheme, type UiLanguage, type UiLocale } from '../../src/lib/index.js';
  import type { Css, CssInput } from 'zerodep-css-svelte';
  import ConfigProbe from './ConfigProbe.svelte';
  let {
    css,
    theme,
    lang,
    locale,
    nestedTheme,
    nestedLang,
    nestedLocale,
    localCss,
    onRead,
    style,
    className,
    showNested = true,
  }: {
    css?: Css;
    theme?: UiTheme;
    lang?: UiLanguage;
    locale?: UiLocale;
    nestedTheme?: UiTheme;
    nestedLang?: UiLanguage;
    nestedLocale?: UiLocale;
    localCss?: Css;
    onRead?: (css: Css) => void;
    style?: string;
    className?: CssInput;
    showNested?: boolean;
  } = $props();
</script>

<Provider {css} {theme} {lang} {locale} {style} data-testid="root" class={className}>
  <ConfigProbe name="root-value" {onRead} />
  {#if showNested}
    <Provider theme={nestedTheme} lang={nestedLang} locale={nestedLocale} data-testid="nested">
      <ConfigProbe name="nested-value" {onRead} />
    </Provider>
  {/if}
  <Provider css={localCss} data-testid="local"><ConfigProbe name="local-value" {onRead} /></Provider
  >
  <ConfigProbe name="sibling-value" {onRead} />
</Provider>
