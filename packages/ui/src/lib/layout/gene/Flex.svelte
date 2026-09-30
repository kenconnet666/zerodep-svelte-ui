<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { css, type CssInput } from 'zerodep-css-svelte';
  import { useCss } from '../../provider/Provider.svelte';
  import type { UiCss } from '../../provider/css.js';

  let {
    direction = 'row',
    gap = '_md',
    align = 'stretch',
    justify = 'flex-start',
    wrap = 'nowrap',
    children,
    class: className,
    ...rest
  }: Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class'> & {
    direction?: Parameters<UiCss['flexDirection']['raw']>[0];
    gap?: Parameters<UiCss['gap']['raw']>[0];
    align?: Parameters<UiCss['alignItems']['raw']>[0];
    justify?: Parameters<UiCss['justifyContent']['raw']>[0];
    wrap?: Parameters<UiCss['flexWrap']['raw']>[0];
    children?: Snippet;
    class?: CssInput;
  } = $props();
  const s = useCss();
</script>

<!-- 只负责自身布局，不改子项的最小尺寸、字号或顺序。默认间距 _md=12px，可为 0。 -->
<div
  {...rest}
  class={css(
    s.boxSizing.borderBox,
    s.minWidth.px(0),
    s.display.flex,
    s.flexDirection.raw(direction),
    s.gap.raw(gap),
    s.alignItems.raw(align),
    s.justifyContent.raw(justify),
    s.flexWrap.raw(wrap),
    className,
  )}
>
  {@render children?.()}
</div>
