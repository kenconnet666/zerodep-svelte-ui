<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { css, type CssInput } from 'zerodep-css-svelte';
  import { useCss } from '../../provider/Provider.svelte';
  import type { UiCss } from '../../provider/css.js';

  let {
    maxWidth = '72rem',
    paddingInline = '_xl',
    children,
    class: className,
    ...rest
  }: Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class'> & {
    /** 包含左右内边距的外框上限；默认根字号 16px 时为 1152px。 */
    maxWidth?: Parameters<UiCss['maxWidth']['raw']>[0];
    /** 默认每侧 24px，内容最大宽度为 maxWidth 减去两侧内边距。 */
    paddingInline?: Parameters<UiCss['paddingInline']['raw']>[0];
    children?: Snippet;
    class?: CssInput;
  } = $props();
  const s = useCss();
</script>

<div
  {...rest}
  class={css(
    s.boxSizing.borderBox,
    s.minWidth.px(0),
    s.width.raw('100%'),
    s.maxWidth.raw(maxWidth),
    s.marginInline.auto,
    s.paddingInline.raw(paddingInline),
    className,
  )}
>
  {@render children?.()}
</div>
