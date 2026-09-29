<script lang="ts">
  import { untrack } from 'svelte';
  import { useTheme, useLocale, useLang, useCss } from 'zerodep-svelte-ui';
  let { kind }: { kind: 'theme' | 'locale' | 'lang' | 'css' } = $props();
  const readers = { theme: useTheme, locale: useLocale, lang: useLang, css: useCss };
  untrack(() => readers[kind]());
</script>
