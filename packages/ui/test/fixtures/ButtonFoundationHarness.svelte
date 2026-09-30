<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Provider } from '../../src/lib/index.js';
  import NativeButtonProbe from './NativeButtonProbe.svelte';
  let props: ComponentProps<typeof NativeButtonProbe> = $props();
</script>

<Provider><NativeButtonProbe {...props} /></Provider>
