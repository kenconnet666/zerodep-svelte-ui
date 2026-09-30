<script module lang="ts">
  import type { ComponentProps } from 'svelte';
  import Text from '../../display/gene/Text.svelte';
  import Icon from '../../display/gene/Icon.svelte';
  import Loading from '../../feedback/gene/Loading.svelte';
  import Ripple from '../../feedback/gene/Ripple.svelte';

  /** 固定复用底层组件，只转发属性；内容、标签和交互状态由 Button 管理。 */
  export interface ButtonSlotProps {
    label?: Omit<
      ComponentProps<typeof Text>,
      'as' | 'children' | 'role' | 'tabindex' | 'aria-hidden'
    >;
    icon?: Omit<
      ComponentProps<typeof Icon>,
      'icon' | 'role' | 'tabindex' | 'focusable' | 'aria-hidden' | 'aria-label' | 'aria-labelledby'
    >;
    loading?: Omit<ComponentProps<typeof Loading>, 'decorative' | 'label'>;
    ripple?: Omit<ComponentProps<typeof Ripple>, 'disabled'>;
  }
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import type { LucideIconData } from '@lucide/icons';
  import { css, type CssInput } from 'zerodep-css-svelte';
  import type { RippleHandle } from '../../feedback/gene/Ripple.svelte';
  import { useCss } from '../../provider/Provider.svelte';
  import type { UiCss } from '../../provider/css.js';
  import { focusRing } from '../../tool/focus-ring.js';
  import { rippleButton } from '../../tool/ripple-button.js';

  let {
    type = 'button',
    disabled = false,
    loading = false,
    size = '_md',
    icon,
    slotProps = {},
    children,
    onclick,
    class: className,
    ...rest
  }: Omit<HTMLButtonAttributes, 'children' | 'class' | 'aria-disabled' | 'aria-busy'> & {
    /** 受控忙碌状态：保留焦点和原内容占位，阻止点击回调及默认提交。 */
    loading?: boolean;
    /** 联动尺寸基准（font-size 输入）；默认 _md=1rem。底层 slotProps 显式值优先。 */
    size?: Parameters<UiCss['fontSize']['raw']>[0];
    icon?: LucideIconData;
    slotProps?: ButtonSlotProps;
    children?: Snippet;
    class?: CssInput;
  } = $props();
  const s = useCss();
  let ripple = $state<RippleHandle>();

  function activate(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
    if (
      disabled ||
      loading ||
      event.currentTarget.matches(':disabled') ||
      event.currentTarget.getAttribute('aria-disabled') === 'true'
    ) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onclick?.(event);
  }
</script>

<!-- 根节点长期固定 button；键盘激活、表单提交/重置由浏览器处理。 -->
<button
  {...rest}
  {type}
  {disabled}
  aria-disabled={disabled || loading || undefined}
  aria-busy={loading || undefined}
  onclick={activate}
  {@attach rippleButton(
    () => ripple,
    () => disabled || loading,
  )}
  class={css(
    s.boxSizing.borderBox,
    s.display.inlineFlex,
    s.alignItems.center,
    s.justifyContent.center,
    s.position.relative,
    s.isolation.isolate,
    s.verticalAlign.middle,
    s.margin.px(0),
    // size 是统一尺寸基准 B，默认 _md=1rem，根字号 16px 时 B=16px。
    // 外框高 2.125B=34px，已含上下各 0.0625B=1px 边框；上下 padding 为 0，通过 flex 居中。
    s.fontSize.raw(size),
    s.height.em(2.125),
    s.paddingBlock.px(0),
    // 宽度随内容；左右各 0.75B=12px。两字宽约 28px 时，总宽约 1+12+28+12+1=54px。
    s.paddingInline.em(0.75),
    s.borderStyle.solid,
    s.borderWidth.em(0.0625),
    s.borderRadius.em(0.375),
    s.borderColor._border,
    s.backgroundColor._surface,
    s.color._text,
    s.fontFamily._sans,
    s.lineHeight._normal,
    s.whiteSpace.nowrap,
    s.cursor.pointer,
    s._selector(
      '&:not(:disabled):not([aria-disabled="true"]):hover',
      s.backgroundColor._surfaceHover,
    ),
    s._selector('&:disabled', s.opacity._disabled, s.cursor.notAllowed),
    loading && s.cursor.progress,
    focusRing(s),
    className,
  )}
>
  <!-- 透明保留原内容的宽高和可访问名称；绝对定位的 Loading/Ripple 不参与尺寸计算。 -->
  <span
    class={css(
      s.display.inlineFlex,
      s.alignItems.center,
      s.gap.em(0.5),
      s.position.relative,
      s.zIndex.raw(1),
      s.pointerEvents.none,
      loading && s.opacity.raw(0),
    )}
  >
    {#if icon}
      <!-- 图标为 1B=16px，图文间距 0.5B=8px；slotProps.icon 可覆盖比例默认值。 -->
      <Icon
        {...slotProps.icon}
        size={slotProps.icon?.size ?? '1em'}
        {icon}
        aria-hidden="true"
        focusable="false"
      />
    {/if}
    {#if children}
      <!-- 文字为 0.875B=14px，1.5 倍行高得到 21px 行框。size 改为 20px 时全体等比放大 1.25 倍。
           slotProps 显式值优先于比例默认值；单独放大文字时，需要调用方确保外框足够高。 -->
      <Text
        {...slotProps.label}
        size={slotProps.label?.size ?? '0.875em'}
        lineHeight={slotProps.label?.lineHeight ?? '_normal'}
        as="span">{@render children()}</Text
      >
    {/if}
  </span>
  {#if loading}
    <span
      class={css(
        s.position.absolute,
        s.inset.px(0),
        s.display.flex,
        s.alignItems.center,
        s.justifyContent.center,
        s.pointerEvents.none,
      )}
    >
      <Loading {...slotProps.loading} decorative />
    </span>
  {/if}
  <Ripple color="inherit" {...slotProps.ripple} bind:this={ripple} disabled={disabled || loading} />
</button>
