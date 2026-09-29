<script lang="ts">
  import type { SVGAttributes } from 'svelte/elements';
  import type { LucideIconData, LucideIconNode } from '@lucide/icons';
  import { bx, css, type CssInput } from 'zerodep-css-svelte';
  import { useCss, useTheme } from '../../provider/context.js';
  import type { UiColor, UiSize } from '../../provider/theme/types.js';
  import { createIconTokens, type IconTokens } from './icon-theme.js';
  import { componentThemesContext, mergeTokens } from '../../../internal/provider-context.js';

  type Props = Omit<
    SVGAttributes<SVGSVGElement>,
    'children' | 'class' | 'color' | 'width' | 'height' | 'viewBox' | 'stroke-width'
  > & {
    icon: LucideIconData;
    size?: UiSize;
    color?: UiColor;
    strokeWidth?: number;
    /** 当前图标的组件 token，优先于 Provider 的 components.Icon。 */
    tokens?: Partial<IconTokens>;
    /** 与默认声明合成；传入当前宿主的 css() 结果或 CSS 声明。 */
    class?: CssInput;
  };

  const s = useCss();
  const theme = useTheme();
  const components = componentThemesContext.use();
  let {
    icon,
    size = '_md',
    color = 'inherit',
    strokeWidth,
    tokens,
    class: className,
    role,
    focusable = 'false',
    'aria-label': label,
    'aria-labelledby': labelledBy,
    'aria-hidden': ariaHidden,
    ...rest
  }: Props = $props();

  const resolvedTokens = $derived(mergeTokens(createIconTokens(theme), components.Icon, tokens));
  const effectiveStrokeWidth = $derived(strokeWidth ?? resolvedTokens.strokeWidth);
  const fontSize = $derived(
    { _sm: resolvedTokens.sizeSm, _md: resolvedTokens.sizeMd, _lg: resolvedTokens.sizeLg }[size],
  );
  const textColor = $derived(
    {
      inherit: 'inherit',
      _text: resolvedTokens.colorText,
      _muted: resolvedTokens.colorMuted,
      _textDisabled: resolvedTokens.colorTextDisabled,
      _primary: resolvedTokens.colorPrimary,
      _info: resolvedTokens.colorInfo,
      _success: resolvedTokens.colorSuccess,
      _warning: resolvedTokens.colorWarning,
      _danger: resolvedTokens.colorDanger,
    }[color],
  );

  const named = $derived(Boolean(label?.trim() || labelledBy?.trim()));
  const hidden = $derived(ariaHidden ?? (named ? undefined : true));
</script>

<svg
  {...rest}
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 {icon.size ?? icon.width ?? 24} {icon.size ?? icon.height ?? 24}"
  {focusable}
  role={role ?? (named && hidden !== true && hidden !== 'true' ? 'img' : undefined)}
  aria-label={label}
  aria-labelledby={labelledBy}
  aria-hidden={hidden}
  class={css(
    s.display.inlineBlock,
    s.flexShrink.raw(0),
    s.verticalAlign.raw(resolvedTokens.verticalAlign),
    s.width.em(1),
    s.height.em(1),
    s.fill.none,
    s.stroke.raw('currentColor'),
    s.strokeLinecap.round,
    s.strokeLinejoin.round,
    s.fontSize.raw(fontSize),
    s.color.raw(textColor),
    s.strokeWidth.raw(bx(effectiveStrokeWidth)),
    className,
  )}
>
  {#snippet nodes(items: LucideIconNode[])}
    <!-- 解构时分离 Lucide 的节点 key，只用于列表标识，不输出到 SVG。 -->
    {#each items as [tag, { key, ...attributes }, nested], index (key ?? index)}
      <svelte:element this={tag} {...attributes} xmlns="http://www.w3.org/2000/svg">
        {#if nested}{@render nodes(nested)}{/if}
      </svelte:element>
    {/each}
  {/snippet}
  {@render nodes(icon.node)}
</svg>
