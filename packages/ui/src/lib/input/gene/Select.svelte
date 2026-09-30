<script module lang="ts">
  import type { ComponentProps } from 'svelte';
  import type { HTMLSelectAttributes } from 'svelte/elements';
  import type { CssInput } from 'zerodep-css-svelte';
  import Icon from '../../display/gene/Icon.svelte';

  export interface SelectSlotProps {
    select?: Pick<HTMLSelectAttributes, 'style'> & { class?: CssInput };
    icon?: Omit<
      ComponentProps<typeof Icon>,
      'icon' | 'role' | 'tabindex' | 'focusable' | 'aria-hidden' | 'aria-label' | 'aria-labelledby'
    >;
  }
</script>

<script lang="ts" generics="T = string">
  import type { Snippet } from 'svelte';
  import { ChevronDown } from '@lucide/icons';
  import { css } from 'zerodep-css-svelte';
  import { useCss } from '../../provider/Provider.svelte';
  import type { UiCss } from '../../provider/css.js';
  import { focusRing } from '../../tool/focus-ring.js';

  let {
    value = $bindable(),
    defaultValue,
    disabled = false,
    size = '_md',
    slotProps = {},
    children,
    class: className,
    style,
    ...rest
  }: Omit<
    HTMLSelectAttributes,
    | 'children'
    | 'class'
    | 'size'
    | 'multiple'
    | 'value'
    | 'defaultValue'
    | 'defaultvalue'
    | 'bind:value'
  > & {
    value?: T;
    defaultValue?: T;
    /** B 默认 1rem；外框高 2.125B=34px、默认宽 12B=192px，文字 0.875B=14px。 */
    size?: Parameters<UiCss['fontSize']['raw']>[0];
    slotProps?: SelectSlotProps;
    /** 原生 option/optgroup 内容；选项文字必须为纯文本，不提供可替换弹层。 */
    children?: Snippet;
    class?: CssInput;
  } = $props();
  const s = useCss();
</script>

<span
  {style}
  class={css(
    s.boxSizing.borderBox,
    s.display.inlineFlex,
    s.position.relative,
    s.verticalAlign.middle,
    s.fontSize.raw(size),
    s.height.em(2.125),
    s.width.em(12),
    s.maxWidth.raw('100%'),
    s.borderStyle.solid,
    s.borderWidth.em(0.0625),
    s.borderRadius.em(0.375),
    s.borderColor._border,
    s.backgroundColor._background,
    s.color._text,
    s._selector('&:has(select:disabled)', s.opacity._disabled),
    s._selector('&:has(select[aria-invalid="true"])', s.borderColor._danger),
    className,
  )}
>
  <!-- 布局高度由外框决定；select 自身字号为 14/16，左右 padding 据此换算，默认左 12px、右 32px。 -->
  <select
    {...rest}
    {disabled}
    {defaultValue}
    bind:value
    style={slotProps.select?.style}
    class={css(
      s.boxSizing.borderBox,
      s.appearance.none,
      s.width.raw('100%'),
      s.height.raw('100%'),
      s.minWidth.px(0),
      s.margin.px(0),
      s.borderWidth.px(0),
      s.borderRadius.inherit,
      s.backgroundColor.transparent,
      s.color.inherit,
      s.fontFamily.inherit,
      s.fontSize.em(0.875),
      s.lineHeight._normal,
      s.paddingBlock.px(0),
      s.paddingInlineStart.em(12 / 14),
      s.paddingInlineEnd.em(32 / 14),
      s.cursor.pointer,
      s._selector('&:disabled', s.cursor.notAllowed),
      focusRing(s),
      // 系统高对比度使用原生箭头，避免依赖装饰 SVG 的颜色。
      s._selector('@media (forced-colors: active)', s.appearance.auto),
      slotProps.select?.class,
    )}>{@render children?.()}</select
  >
  <span
    aria-hidden="true"
    class={css(
      s.position.absolute,
      s.insetInlineEnd.em(0.75),
      s.top.px(0),
      s.height.raw('100%'),
      s.display.inlineFlex,
      s.alignItems.center,
      s.pointerEvents.none,
      s._selector('@media (forced-colors: active)', s.display.none),
    )}
  >
    <Icon
      {...slotProps.icon}
      icon={ChevronDown}
      size={slotProps.icon?.size ?? '1em'}
      aria-hidden="true"
      focusable="false"
    />
  </span>
</span>
