<script lang="ts">
  import { untrack } from 'svelte';
  import { css, type Css } from 'zerodep-css-svelte';
  import { useCss, useTheme, useLocale, useLang } from 'zerodep-svelte-ui';
  let { onRead }: { onRead: (author: Css) => void } = $props();
  const author = useCss();
  const theme = useTheme();
  const locale = useLocale();
  const lang = useLang();
  untrack(() => onRead(author));
</script>

<span class={css(author.color.primary)}
  >{theme.themeName}/{lang.languageName}/{locale.timeZone}/{lang.messages.loading}</span
>
