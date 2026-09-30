<script module lang="ts">
  import type { ComponentProps } from 'svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import type { CssInput } from 'zerodep-css-svelte';
  import Text from '../../display/gene/Text.svelte';

  export interface SliderSlotProps {
    input?: Pick<HTMLInputAttributes, 'style'> & { class?: CssInput };
    value?: Omit<
      ComponentProps<typeof Text>,
      'as' | 'children' | 'role' | 'tabindex' | 'aria-hidden'
    >;
  }
</script>

<script lang="ts">
  import { css } from 'zerodep-css-svelte';
  import { useCss } from '../../provider/Provider.svelte';
  import type { UiCss } from '../../provider/css.js';
  import { focusRing } from '../../tool/focus-ring.js';

  let {
    value = $bindable(),
    defaultValue,
    min = 0,
    max = 100,
    step = 1,
    disabled = false,
    size = '_md',
    color = '_primary',
    showValue = false,
    formatValue,
    slotProps = {},
    class: className,
    style,
    ...rest
  }: Omit<
    HTMLInputAttributes,
    | 'children'
    | 'class'
    | 'type'
    | 'size'
    | 'color'
    | 'value'
    | 'defaultValue'
    | 'defaultvalue'
    | 'min'
    | 'max'
    | 'step'
    | 'checked'
    | 'indeterminate'
    | 'multiple'
    | 'readonly'
    | 'required'
    | 'bind:value'
  > & {
    value?: number;
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number | 'any';
    /** B 默认 1rem；整体宽 12B=192px，输入高 1.5B=24px，滑块 1B=16px、轨道 0.25B=4px。 */
    size?: Parameters<UiCss['fontSize']['raw']>[0];
    color?: Parameters<UiCss['color']['raw']>[0];
    showValue?: boolean;
    /** 同时用于可见数值与 aria-valuetext，例如将秒数格式化成时间。 */
    formatValue?: (value: number) => string;
    slotProps?: SliderSlotProps;
    class?: CssInput;
  } = $props();
  const s = useCss();
  // 省略初值时从 min 开始，避免动态设置原生 range 的边界时，浏览器先将默认 50 截断到 max。
  // 默认值同时用于 SSR、首次挂载和表单重置；显式 value 优先于 defaultValue。
  const displayValue = $derived(value ?? defaultValue ?? min);
  const valueText = $derived(formatValue?.(displayValue));
  const track = $derived(s.height.em(0.25) + s.borderRadius.em(0.125) + s.backgroundColor._border);
  const thumb =
    s.width.em(1) +
    s.height.em(1) +
    s.borderWidth.px(0) +
    s.borderRadius.raw('50%') +
    s.backgroundColor.currentColor;
</script>

<span
  {style}
  class={css(
    s.display.inlineFlex,
    s.alignItems.center,
    s.verticalAlign.middle,
    s.gap.em(0.5),
    s.fontSize.raw(size),
    s.width.em(12),
    s.maxWidth.raw('100%'),
    s.color._text,
    s._selector('&:has(input:disabled)', s.opacity._disabled),
    className,
  )}
>
  <!-- 单滑块水平 range；边界、step、方向键及表单重置交给浏览器和 Svelte 原生绑定。
       不为每次拖动生成 CSS 类；数值变化只更新绑定和可选的 Text。 -->
  <input
    {...rest}
    type="range"
    {disabled}
    {min}
    {max}
    {step}
    defaultValue={defaultValue ?? min}
    bind:value
    aria-valuetext={valueText ?? rest['aria-valuetext']}
    style={slotProps.input?.style}
    class={css(
      s.boxSizing.borderBox,
      s.appearance.none,
      s.backgroundColor.transparent,
      s.flex.raw('1 1 0%'),
      s.minWidth.px(0),
      s.width.px(0),
      s.height.em(1.5),
      s.margin.px(0),
      s.padding.px(0),
      s.fontSize.inherit,
      s.color.raw(color),
      s.cursor.pointer,
      s._selector('&:disabled', s.cursor.notAllowed),
      s._selector('&::-webkit-slider-runnable-track', track),
      s._selector('&::-moz-range-track', track),
      s._selector('&::-webkit-slider-thumb', s.appearance.none, thumb, s.marginTop.em(-0.375)),
      s._selector('&::-moz-range-thumb', thumb),
      focusRing(s),
      s._selector(
        '@media (forced-colors: active)',
        s._selector('&::-webkit-slider-runnable-track', s.backgroundColor.raw('CanvasText')),
        s._selector('&::-moz-range-track', s.backgroundColor.raw('CanvasText')),
        s._selector('&::-webkit-slider-thumb', s.backgroundColor.raw('Highlight')),
        s._selector('&::-moz-range-thumb', s.backgroundColor.raw('Highlight')),
      ),
      slotProps.input?.class,
    )}
  />
  {#if showValue}
    <Text
      {...slotProps.value}
      as="span"
      aria-hidden="true"
      size={slotProps.value?.size ?? '0.875em'}
      class={css(
        s.flexShrink.raw(0),
        s.minWidth.em(3),
        s.textAlign.end,
        s.fontVariantNumeric.tabularNums,
        slotProps.value?.class,
      )}>{valueText ?? displayValue}</Text
    >
  {/if}
</span>
