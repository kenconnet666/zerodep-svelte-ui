<script lang="ts">
  import { Css, css } from 'zerodep-css-svelte';

  let { label }: { label: string } = $props();
  const s = new Css();
  const className = css(s.color.red);
</script>

<p class={className}>{label}</p>
