<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { css as styleClass } from 'zerodep-css-svelte';
  import { UiCss, type UiTheme } from './css.js';
  import { parentConfig, provideConfig, type UiConfig } from './context.js';

  type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'lang' | 'dir'> & {
    css?: UiCss;
    theme?: UiTheme;
    locale?: string;
    children?: Snippet;
  };

  let { css, theme, locale, children, class: className, ...rest }: Props = $props();
  const parent = parentConfig();
  const initialCss = untrack(() => css);
  const s = initialCss ?? parent?.css ?? new UiCss();
  const config: UiConfig = {
    css: s,
    get theme() {
      return theme ?? parent?.theme ?? 'light';
    },
    get locale() {
      return locale ?? parent?.locale ?? 'zh-CN';
    },
  };
  provideConfig(config);

  // 作者身份按作用域固定。主题切换使用 theme；换作者需显式重建 Provider。
  $effect.pre(() => {
    if (css !== initialCss) {
      throw new Error(
        'zerodep-svelte-ui: css is an initialization prop; recreate Provider to replace it.',
      );
    }
  });

  const themes = {
    light: styleClass(s._selector('@layer zerodep-ui', s.theme('light'), s.color._text)),
    dark: styleClass(s._selector('@layer zerodep-ui', s.theme('dark'), s.color._text)),
  };
  // 仅改语言的内层容器不重置父级已覆盖的 CSS 变量或文字颜色。
  const themeClass = $derived(
    !parent || initialCss !== undefined || theme !== undefined ? themes[config.theme] : undefined,
  );
</script>

<div {...rest} lang={config.locale} class={[themeClass, className]}>
  {@render children?.()}
</div>
