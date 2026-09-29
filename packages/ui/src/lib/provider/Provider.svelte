<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { css as styleClass, type CssInput } from 'zerodep-css-svelte';
  import { UiCss, type UiCssFactory } from './css.js';
  import { parentConfig, provideConfig } from '../../internal/provider-context.js';
  import type { UiConfig } from './types.js';
  import type { UiTheme } from './theme/types.js';
  import type { UiLanguage } from './lang/types.js';
  import type { UiLocale } from './locale/types.js';
  import { lightTheme } from './theme/light.js';
  import { zhCNLanguage } from './lang/zh-CN.js';
  import { chinaLocale } from './locale/china.js';

  type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class' | 'lang'> & {
    css?: UiCssFactory;
    theme?: UiTheme;
    lang?: UiLanguage;
    locale?: UiLocale;
    children?: Snippet;
    class?: CssInput;
  };

  let { css, theme, lang, locale, children, class: className, ...rest }: Props = $props();
  const parent = parentConfig();
  const initialCss = untrack(() => css);
  const createCss: UiCssFactory =
    initialCss ?? parent?.createCss ?? ((readTheme) => new UiCss(readTheme));
  // 传读取函数而不是主题快照；嵌套 Provider 使用独立作者，避免主题串到兄弟子树。
  const s = createCss(() => theme ?? parent?.theme ?? lightTheme);
  // context 的外层对象稳定；getter 读取当前 props，让替换与嵌套继承保持响应式。
  const config: UiConfig = {
    css: s,
    createCss,
    get theme() {
      return s.theme;
    },
    get lang() {
      return lang ?? parent?.lang ?? zhCNLanguage;
    },
    get locale() {
      return locale ?? parent?.locale ?? chinaLocale;
    },
  };
  provideConfig(config);

  // 作者与绑定所有者按作用域固定；主题、语言、地区对象可直接替换。
  $effect.pre(() => {
    if (css !== initialCss) {
      throw new Error(
        'zerodep-svelte-ui: css is an initialization prop; recreate Provider to replace it.',
      );
    }
  });
</script>

<div
  {...rest}
  lang={config.lang.code}
  class={styleClass(s.colorScheme.raw(s.theme.themeName), s.color.text, className)}
>
  {@render children?.()}
</div>
