<script lang="ts">
  import type { SVGAttributes } from 'svelte/elements';
  import type { LucideIconData, LucideIconNode } from '@lucide/icons';
  import { bx, css } from 'zerodep-css-svelte';
  import { useCss } from './context.js';
  import type { UiColor, UiSize } from './css.js';

  type Props = Omit<
    SVGAttributes<SVGSVGElement>,
    'children' | 'color' | 'width' | 'height' | 'viewBox' | 'stroke-width'
  > & {
    icon: LucideIconData;
    size?: UiSize;
    color?: UiColor;
    strokeWidth?: number;
  };

  const s = useCss();
  let {
    icon,
    size = 'md',
    color = 'inherit',
    strokeWidth = 2,
    class: className,
    role,
    focusable = 'false',
    'aria-label': label,
    'aria-labelledby': labelledBy,
    'aria-hidden': ariaHidden,
    ...rest
  }: Props = $props();

  const viewBox = $derived(
    `0 0 ${icon.size ?? icon.width ?? 24} ${icon.size ?? icon.height ?? 24}`,
  );
  const named = $derived(Boolean(label?.trim() || labelledBy?.trim()));
  const hidden = $derived(ariaHidden ?? (named ? undefined : true));
  const effectiveRole = $derived(
    role ?? (named && hidden !== true && hidden !== 'true' ? 'img' : undefined),
  );

  function svgAttributes(attributes: LucideIconNode[1]) {
    // Lucide 的 key 是渲染器元数据，不属于 SVG 属性；不修改用户共享的数据。
    return Object.fromEntries(Object.entries(attributes).filter(([name]) => name !== 'key'));
  }
</script>

<svg
  {...rest}
  xmlns="http://www.w3.org/2000/svg"
  {viewBox}
  {focusable}
  role={effectiveRole}
  aria-label={label}
  aria-labelledby={labelledBy}
  aria-hidden={hidden}
  class={[
    css(
      s._selector(
        '@layer zerodep-ui',
        s.display.inlineBlock,
        s.flexShrink.raw(0),
        s.verticalAlign.em(-0.125),
        s.width.em(1),
        s.height.em(1),
        s.fill.none,
        s.stroke.raw('currentColor'),
        s.strokeLinecap.round,
        s.strokeLinejoin.round,
        s.fontSize[`_${size}`],
        color === 'inherit' ? s.color.inherit : s.color[`_${color}`],
        s.strokeWidth.raw(bx(strokeWidth)),
      ),
    ),
    className,
  ]}
>
  {#snippet nodes(items: LucideIconNode[])}
    {#each items as [tag, attributes, nested], index (index)}
      <svelte:element this={tag} {...svgAttributes(attributes)} xmlns="http://www.w3.org/2000/svg">
        {#if nested}{@render nodes(nested)}{/if}
      </svelte:element>
    {/each}
  {/snippet}
  {@render nodes(icon.node)}
</svg>
