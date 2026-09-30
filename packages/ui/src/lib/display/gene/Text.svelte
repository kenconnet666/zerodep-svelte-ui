<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { css, type CssInput } from 'zerodep-css-svelte';
  import { useCss } from '../../provider/Provider.svelte';
  import type { UiCss } from '../../provider/css.js';

  let {
    as = 'span',
    size,
    color,
    fontFamily,
    fontWeight,
    lineHeight,
    textAlign,
    children,
    class: className,
    ...rest
  }: Omit<HTMLAttributes<HTMLElement>, 'children' | 'class' | 'color'> & {
    as?:
      | 'span'
      | 'p'
      | 'strong'
      | 'em'
      | 'small'
      | 'code'
      | 'kbd'
      | 'samp'
      | 'sub'
      | 'sup'
      | 'del'
      | 'ins'
      | 'h1'
      | 'h2'
      | 'h3'
      | 'h4'
      | 'h5'
      | 'h6';
    size?: Parameters<UiCss['fontSize']['raw']>[0];
    color?: Parameters<UiCss['color']['raw']>[0];
    fontFamily?: Parameters<UiCss['fontFamily']['raw']>[0];
    fontWeight?: Parameters<UiCss['fontWeight']['raw']>[0];
    lineHeight?: Parameters<UiCss['lineHeight']['raw']>[0];
    textAlign?: Parameters<UiCss['textAlign']['raw']>[0];
    children?: Snippet;
    class?: CssInput;
  } = $props();
  const s = useCss();
</script>

<!-- 未传外观属性时保留原生标签样式，例如 strong 的粗体和 code 的等宽字体。 -->
<svelte:element
  this={as}
  {...rest}
  class={css(
    size !== undefined && s.fontSize.raw(size),
    color !== undefined && s.color.raw(color),
    fontFamily !== undefined && s.fontFamily.raw(fontFamily),
    fontWeight !== undefined && s.fontWeight.raw(fontWeight),
    lineHeight !== undefined && s.lineHeight.raw(lineHeight),
    textAlign !== undefined && s.textAlign.raw(textAlign),
    className,
  )}>{@render children?.()}</svelte:element
>
