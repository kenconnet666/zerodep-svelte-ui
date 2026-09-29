<script lang="ts">
  import { Provider, UiCss, type UiTheme } from 'zerodep-svelte-ui';
  import { css } from 'zerodep-css-svelte';
  import PublicConfigProbe from './PublicConfigProbe.svelte';
  let {
    theme,
    locale,
    brand,
    onRead,
  }: {
    theme: UiTheme;
    locale: string;
    brand: string;
    onRead: (author: UiCss) => void;
  } = $props();
  class RequestCss extends UiCss {
    override theme(mode: UiTheme): string {
      return super.theme(mode) + `--ui-color-primary:${brand};`;
    }
  }
  const author = new RequestCss();
</script>

<Provider css={author} {theme} {locale} class={css(author.color.green)}>
  <PublicConfigProbe {onRead} />
  <Provider locale="ja-JP"><PublicConfigProbe {onRead} /></Provider>
</Provider>
