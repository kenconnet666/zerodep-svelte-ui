<script lang="ts">
  import {
    Provider,
    zhCNLanguage,
    type UiTheme,
    type UiLanguage,
    type UiLocale,
  } from 'zerodep-svelte-ui';
  import { css, type Css } from 'zerodep-css-svelte';
  import PublicConfigProbe from './PublicConfigProbe.svelte';
  let {
    theme,
    lang,
    locale,
    brand,
    onRead,
  }: {
    theme: UiTheme;
    lang: UiLanguage;
    locale: UiLocale;
    brand: string;
    onRead: (author: Css) => void;
  } = $props();
  const requestTheme = $derived({ ...theme, color: { ...theme.color, primary: brand } });
</script>

<Provider theme={requestTheme} {lang} {locale} class={css('color:green;')}>
  <PublicConfigProbe {onRead} />
  <Provider lang={zhCNLanguage}><PublicConfigProbe {onRead} /></Provider>
</Provider>
