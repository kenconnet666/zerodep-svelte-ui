<script lang="ts">
  import type { SVGAttributes } from 'svelte/elements';
  import type { LucideIconData, LucideIconNode } from '@lucide/icons';
  import { bx, css, type CssInput } from 'zerodep-css-svelte';
  import { useCss } from '../../provider/context.js';
  import type { UiCss } from '../../provider/css.js';

  type Props = Omit<
    SVGAttributes<SVGSVGElement>,
    'children' | 'class' | 'color' | 'width' | 'height' | 'viewBox' | 'stroke-width'
  > & {
    icon: LucideIconData;
    /** 系统字号 token 或原始 font-size 值；图标宽高为 1em。 */
    size?: Parameters<UiCss['fontSize']['raw']>[0];
    color?: Parameters<UiCss['color']['raw']>[0];
    strokeWidth?: Parameters<UiCss['strokeWidth']['raw']>[0];
    verticalAlign?: Parameters<UiCss['verticalAlign']['raw']>[0];
    /** 与默认声明合成；传入当前宿主的 css() 结果或 CSS 声明。 */
    class?: CssInput;
  };

  const s = useCss();
  let {
    icon,
    size = '_md',
    color = 'inherit',
    strokeWidth = 2,
    verticalAlign = '-0.125em',
    class: className,
    role,
    focusable = 'false',
    'aria-label': label,
    'aria-labelledby': labelledBy,
    'aria-hidden': ariaHidden,
    ...rest
  }: Props = $props();

  // CSS 全局关键字必须作用于 stroke-width 本身，不能写进 bx 的自定义属性。
  const globalStrokeWidth = $derived(
    typeof strokeWidth === 'string' &&
      ['inherit', 'initial', 'unset', 'revert', 'revert-layer'].includes(
        strokeWidth.trim().toLowerCase(),
      ),
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
    s.verticalAlign.raw(verticalAlign),
    s.width.em(1),
    s.height.em(1),
    s.fill.none,
    s.stroke.currentColor,
    s.strokeLinecap.round,
    s.strokeLinejoin.round,
    s.fontSize.raw(size),
    s.color.raw(color),
    globalStrokeWidth ? s.strokeWidth.raw(strokeWidth) : s.strokeWidth.raw(bx(strokeWidth)),
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
