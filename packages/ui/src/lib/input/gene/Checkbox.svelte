<script module lang="ts">
  import type { ComponentProps } from 'svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import type { CssInput } from 'zerodep-css-svelte';
  import Text from '../../display/gene/Text.svelte';

  export interface CheckboxSlotProps {
    input?: Pick<HTMLInputAttributes, 'style'> & { class?: CssInput };
    label?: Omit<ComponentProps<typeof Text>, 'as' | 'children' | 'role' | 'tabindex'>;
  }
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { css } from 'zerodep-css-svelte';
  import { useCss } from '../../provider/Provider.svelte';
  import type { UiCss } from '../../provider/css.js';
  import { focusRing } from '../../tool/focus-ring.js';

  let {
    checked = $bindable(),
    indeterminate = $bindable(),
    defaultChecked = false,
    disabled = false,
    size = '_md',
    color = '_primary',
    slotProps = {},
    children,
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
    | 'checked'
    | 'indeterminate'
    | 'defaultChecked'
    | 'defaultchecked'
    | 'aria-checked'
  > & {
    checked?: boolean;
    indeterminate?: boolean;
    defaultChecked?: boolean;
    /** B 默认 1rem；复选框 1B，文字 0.875B，间距 0.5B。原生勾选图形由浏览器绘制。 */
    size?: Parameters<UiCss['fontSize']['raw']>[0];
    color?: Parameters<UiCss['color']['raw']>[0];
    slotProps?: CheckboxSlotProps;
    children?: Snippet;
    class?: CssInput;
  } = $props();
  const s = useCss();
</script>

<!-- 原生 input 保留表单、标签点击、Space、半选和高对比度支持，不模拟点击。 -->
<label
  {style}
  class={css(
    s.display.inlineFlex,
    s.alignItems.center,
    s.gap.em(0.5),
    s.verticalAlign.middle,
    s.fontSize.raw(size),
    s.color._text,
    s.cursor.pointer,
    s._selector('&:has(input:disabled)', s.opacity._disabled, s.cursor.notAllowed),
    className,
  )}
>
  <input
    {...rest}
    type="checkbox"
    {disabled}
    {defaultChecked}
    bind:checked
    bind:indeterminate
    aria-checked={indeterminate ? 'mixed' : undefined}
    style={slotProps.input?.style}
    class={css(
      s.boxSizing.borderBox,
      s.flexShrink.raw(0),
      s.margin.px(0),
      s.fontSize.inherit,
      s.width.em(1),
      s.height.em(1),
      s.color.raw(color),
      s.accentColor.raw('currentColor'),
      s.cursor.inherit,
      focusRing(s),
      slotProps.input?.class,
    )}
  />
  {#if children}
    <Text
      {...slotProps.label}
      as="span"
      size={slotProps.label?.size ?? '0.875em'}
      lineHeight={slotProps.label?.lineHeight ?? '_normal'}>{@render children()}</Text
    >
  {/if}
</label>
