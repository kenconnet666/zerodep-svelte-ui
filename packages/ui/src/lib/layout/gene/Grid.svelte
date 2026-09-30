<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { css, type CssInput } from 'zerodep-css-svelte';
  import { useCss } from '../../provider/Provider.svelte';
  import type { UiCss } from '../../provider/css.js';

  let {
    columns = 'minmax(0, 1fr)',
    rows,
    gap = '_md',
    align = 'stretch',
    children,
    class: className,
    ...rest
  }: Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class'> & {
    columns?: Parameters<UiCss['gridTemplateColumns']['raw']>[0];
    rows?: Parameters<UiCss['gridTemplateRows']['raw']>[0];
    gap?: Parameters<UiCss['gap']['raw']>[0];
    align?: Parameters<UiCss['alignItems']['raw']>[0];
    children?: Snippet;
    class?: CssInput;
  } = $props();
  const s = useCss();
</script>

<!-- 默认单列允许收缩；响应式列直接使用 repeat/minmax 或 class，不另建断点配置。 -->
<div
  {...rest}
  class={css(
    s.boxSizing.borderBox,
    s.minWidth.px(0),
    s.display.grid,
    s.gridTemplateColumns.raw(columns),
    rows !== undefined && s.gridTemplateRows.raw(rows),
    s.gap.raw(gap),
    s.alignItems.raw(align),
    className,
  )}
>
  {@render children?.()}
</div>
