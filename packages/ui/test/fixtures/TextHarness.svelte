<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Provider, Text, type UiTheme } from '../../src/lib/index.js';
  let {
    text = '文字 <内容>',
    appearance = {},
    theme,
  }: {
    text?: string;
    appearance?: Omit<ComponentProps<typeof Text>, 'children'>;
    theme?: UiTheme;
  } = $props();
</script>

<Provider {theme}>
  <Text {...appearance} data-testid="text">{text}</Text>
  <Text as="strong" data-testid="strong">强调</Text>
  <Text as="code" data-testid="code">code</Text>
</Provider>
