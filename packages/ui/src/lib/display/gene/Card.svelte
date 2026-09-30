<script module lang="ts">
  import type { ComponentProps } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import type { CssInput } from 'zerodep-css-svelte';
  import Text from './Text.svelte';
  import Flex from '../../layout/gene/Flex.svelte';
  import Divider from '../../layout/gene/Divider.svelte';

  export interface CardSlotProps {
    header?: Omit<ComponentProps<typeof Flex>, 'children'>;
    title?: Omit<ComponentProps<typeof Text>, 'children'>;
    description?: Omit<ComponentProps<typeof Text>, 'children'>;
    actions?: Omit<ComponentProps<typeof Flex>, 'children'>;
    body?: Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class'> & { class?: CssInput };
    footer?: Omit<ComponentProps<typeof Flex>, 'children'>;
    divider?: Omit<ComponentProps<typeof Divider>, 'orientation' | 'decorative'>;
  }
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { css } from 'zerodep-css-svelte';
  import { useCss } from '../../provider/Provider.svelte';
  import type { UiCss } from '../../provider/css.js';

  let {
    title,
    description,
    actions,
    footer,
    children,
    padding = '_lg',
    radius = '_lg',
    shadow = 'none',
    divided = false,
    slotProps = {},
    class: className,
    ...rest
  }: Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class' | 'title'> & {
    title?: string;
    description?: string;
    actions?: Snippet;
    footer?: Snippet;
    children?: Snippet;
    /** 各个存在的区域默认独立内边距 16px，外框不再叠加 padding。 */
    padding?: Parameters<UiCss['padding']['raw']>[0];
    radius?: Parameters<UiCss['borderRadius']['raw']>[0];
    shadow?: Parameters<UiCss['boxShadow']['raw']>[0];
    divided?: boolean;
    slotProps?: CardSlotProps;
    class?: CssInput;
  } = $props();
  const s = useCss();
</script>

<!-- 自然撑高、允许收缩，不裁剪焦点环，不将普通内容区伪装成可点击控件。 -->
<div
  {...rest}
  class={css(
    s.boxSizing.borderBox,
    s.minWidth.px(0),
    s.borderStyle.solid,
    s.borderWidth._thin,
    s.borderRadius.raw(radius),
    s.borderColor._border,
    s.backgroundColor._background,
    s.color._text,
    s.boxShadow.raw(shadow),
    className,
  )}
>
  {#if title || description || actions}
    <Flex
      {...slotProps.header}
      align={slotProps.header?.align ?? 'center'}
      justify={slotProps.header?.justify ?? 'space-between'}
      wrap={slotProps.header?.wrap ?? 'wrap'}
      class={css(s.padding.raw(padding), slotProps.header?.class)}
    >
      {#if title || description}
        <Flex
          direction="column"
          gap="_xs"
          class={css(s.flex.raw('1 1 10rem'), s.overflowWrap.anywhere)}
        >
          {#if title}
            <!-- 默认 span；需要文档标题层级时通过 slotProps.title.as 选择 h2/h3 等。 -->
            <Text
              {...slotProps.title}
              size={slotProps.title?.size ?? '_md'}
              fontWeight={slotProps.title?.fontWeight ?? '_semibold'}
              lineHeight={slotProps.title?.lineHeight ?? '_tight'}
              class={css(s.margin.px(0), slotProps.title?.class)}>{title}</Text
            >
          {/if}
          {#if description}
            <Text
              {...slotProps.description}
              size={slotProps.description?.size ?? '_sm'}
              color={slotProps.description?.color ?? '_muted'}
              class={css(s.margin.px(0), slotProps.description?.class)}>{description}</Text
            >
          {/if}
        </Flex>
      {/if}
      {#if actions}
        <Flex
          {...slotProps.actions}
          align={slotProps.actions?.align ?? 'center'}
          wrap={slotProps.actions?.wrap ?? 'wrap'}
          class={css(s.maxWidth.raw('100%'), s.marginInlineStart.auto, slotProps.actions?.class)}
          >{@render actions()}</Flex
        >
      {/if}
    </Flex>
    {#if divided && (children || footer)}<Divider {...slotProps.divider} decorative />{/if}
  {/if}
  {#if children}
    <div
      {...slotProps.body}
      class={css(
        s.boxSizing.borderBox,
        s.minWidth.px(0),
        s.padding.raw(padding),
        slotProps.body?.class,
      )}
    >
      {@render children()}
    </div>
    {#if divided && footer}<Divider {...slotProps.divider} decorative />{/if}
  {/if}
  {#if footer}
    <Flex
      {...slotProps.footer}
      align={slotProps.footer?.align ?? 'center'}
      wrap={slotProps.footer?.wrap ?? 'wrap'}
      class={css(s.padding.raw(padding), slotProps.footer?.class)}>{@render footer()}</Flex
    >
  {/if}
</div>
