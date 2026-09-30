<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { css, keyframes, type CssInput } from 'zerodep-css-svelte';
  import { useCss, useLang } from '../../provider/Provider.svelte';
  import type { UiCss } from '../../provider/css.js';

  let {
    size = '1em',
    color = 'inherit',
    decorative = false,
    label,
    class: className,
    ...rest
  }: Omit<
    HTMLAttributes<HTMLSpanElement>,
    | 'children'
    | 'class'
    | 'color'
    | 'role'
    | 'aria-hidden'
    | 'aria-label'
    | 'aria-labelledby'
    | 'tabindex'
  > & {
    /** 圆环宽高均为 1em；size 控制 font-size，默认跟随父级字号。 */
    size?: Parameters<UiCss['fontSize']['raw']>[0];
    color?: Parameters<UiCss['color']['raw']>[0];
    /** 嵌入已有忙碌语义的控件时隐藏装饰，避免重复播报。 */
    decorative?: boolean;
    label?: string;
    class?: CssInput;
  } = $props();
  const s = useCss();
  const lang = useLang();
  const spin = keyframes(`to{${s.transform.raw('rotate(360deg)')}}`);
</script>

<span
  {...rest}
  role={decorative ? undefined : 'status'}
  aria-label={decorative ? undefined : (label ?? lang.messages.loading)}
  aria-hidden={decorative || undefined}
  class={css(
    s.display.inlineFlex,
    s.flexShrink.raw(0),
    s.width.em(1),
    s.height.em(1),
    s.verticalAlign.em(-0.125),
    s.fontSize.raw(size),
    s.color.raw(color),
    className,
  )}
>
  <span
    class={css(
      s.boxSizing.borderBox,
      s.width.raw('100%'),
      s.height.raw('100%'),
      s.borderStyle.solid,
      s.borderWidth.em(0.125),
      s.borderColor.currentColor,
      s.borderRightColor.transparent,
      s.borderRadius.raw('50%'),
      s.animationName.raw(spin),
      s.animationDuration.ms(750),
      s.animationTimingFunction.linear,
      s.animationIterationCount.infinite,
      s._selector('@media (prefers-reduced-motion: reduce)', s.animationName.none),
    )}
  ></span>
</span>
