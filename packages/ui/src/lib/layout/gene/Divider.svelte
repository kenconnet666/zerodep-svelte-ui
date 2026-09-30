<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { css, type CssInput } from 'zerodep-css-svelte';
  import { useCss } from '../../provider/Provider.svelte';
  import type { UiCss } from '../../provider/css.js';

  let {
    orientation = 'horizontal',
    color = '_divider',
    thickness = '_thin',
    decorative = false,
    class: className,
    ...rest
  }: Omit<
    HTMLAttributes<HTMLDivElement>,
    'children' | 'class' | 'color' | 'role' | 'aria-hidden' | 'aria-orientation' | 'tabindex'
  > & {
    orientation?: 'horizontal' | 'vertical';
    color?: Parameters<UiCss['color']['raw']>[0];
    thickness?: Parameters<UiCss['borderWidth']['raw']>[0];
    /** 纯视觉分区设为 true，避免屏幕阅读器重复朗读分隔符。 */
    decorative?: boolean;
    class?: CssInput;
  } = $props();
  const s = useCss();
</script>

<!-- 用单侧边框实现粗细（默认 1px），不增加 margin；竖线依赖横向 Flex 的交叉轴或显式高度。 -->
<div
  {...rest}
  role={decorative ? undefined : 'separator'}
  aria-hidden={decorative || undefined}
  aria-orientation={decorative ? undefined : orientation}
  class={css(
    s.boxSizing.borderBox,
    s.margin.px(0),
    s.padding.px(0),
    s.flexShrink.raw(0),
    s.alignSelf.stretch,
    s.color.raw(color),
    s.borderColor.currentColor,
    s.borderStyle.solid,
    s.borderWidth.raw(thickness),
    orientation === 'horizontal'
      ? s.height.px(0) + s.borderInlineWidth.px(0) + s.borderBlockEndWidth.px(0)
      : s.width.px(0) + s.borderBlockWidth.px(0) + s.borderInlineEndWidth.px(0),
    className,
  )}
></div>
