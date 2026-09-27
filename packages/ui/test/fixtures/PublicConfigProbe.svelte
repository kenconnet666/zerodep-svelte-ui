<script lang="ts">
  import { untrack } from 'svelte';
  import { useCss, useConfig, type UiCss } from 'zerodep-svelte-ui';
  let { onRead }: { onRead: (author: UiCss) => void } = $props();
  const author = useCss();
  const config = useConfig();
  untrack(() => onRead(author));
</script>

<span>{config.theme}/{config.locale}</span>
