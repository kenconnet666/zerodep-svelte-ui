<script lang="ts">
  import { untrack } from 'svelte';
  import { css, type Css } from 'zerodep-css-svelte';
  import { useCss, useConfig } from 'zerodep-svelte-ui';
  let { onRead }: { onRead: (author: Css) => void } = $props();
  const author = useCss();
  const config = useConfig();
  untrack(() => onRead(author));
</script>

<span class={css(author.color.raw(config.theme.color.primary))}
  >{config.theme.name}/{config.lang.code}/{config.locale.timeZone}/{config.lang.messages
    .loading}</span
>
