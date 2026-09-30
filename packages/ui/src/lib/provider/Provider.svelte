<script module lang="ts">
  import { createCssContext } from 'zerodep-css-svelte';
  import { context } from '../tool/context.js';
  import { UiCss, type UiCssFactory } from './css.js';
  import type { UiTheme } from './theme/types.js';
  import type { UiLanguage } from './lang/types.js';
  import type { UiLocale } from './locale/types.js';

  // 键在模块内共享，值由 Svelte 按组件树隔离；Provider 可选读父级，消费 hook 必须读到值。
  const themeContext = context<UiTheme>();
  const localeContext = context<UiLocale>();
  const langContext = context<UiLanguage>();
  const cssFactoryContext = context<UiCssFactory>();
  const bindingContext = createCssContext<UiCss>();

  /** 在后代组件初始化时读取；保留对象，在模板或派生表达式中读取其字段。 */
  export const useTheme = themeContext.use;
  export const useLocale = localeContext.use;
  export const useLang = langContext.use;
  // CSS 消费和编译绑定复用同一上下文，不再重复注入一份 UiCss。
  export const useCss = bindingContext.useCss;
</script>

<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { css as styleClass, type CssInput } from 'zerodep-css-svelte';
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
  const parentTheme = themeContext.optional();
  const parentLocale = localeContext.optional();
  const parentLang = langContext.optional();
  const parentFactory = cssFactoryContext.optional();
  const initialCss = untrack(() => css);
  const createCss: UiCssFactory =
    initialCss ?? parentFactory ?? ((readTheme) => new UiCss(readTheme));
  // 显式主题优先，未提供时继承父级；根 Provider 回退到亮色主题。
  const resolvedTheme = $derived(theme ?? parentTheme ?? lightTheme);
  // 传读取函数而不是主题快照；嵌套 Provider 使用独立作者，避免主题串到兄弟子树。
  const s = createCss(() => resolvedTheme);
  // 各对象引用稳定，字段 getter 跟踪当前 props；整体替换不会让后代持有旧快照。
  themeContext.provide(
    Object.freeze({
      get themeName() {
        return s.theme.themeName;
      },
      get color() {
        return s.theme.color;
      },
      get fontSize() {
        return s.theme.fontSize;
      },
      get fontFamily() {
        return s.theme.fontFamily;
      },
      get fontWeight() {
        return s.theme.fontWeight;
      },
      get lineHeight() {
        return s.theme.lineHeight;
      },
      get controlHeight() {
        return s.theme.controlHeight;
      },
      get space() {
        return s.theme.space;
      },
      get radius() {
        return s.theme.radius;
      },
      get borderWidth() {
        return s.theme.borderWidth;
      },
      get opacity() {
        return s.theme.opacity;
      },
      get shadow() {
        return s.theme.shadow;
      },
      get motion() {
        return s.theme.motion;
      },
      get zIndex() {
        return s.theme.zIndex;
      },
    }),
  );
  const language = langContext.provide(
    Object.freeze({
      get languageName() {
        return (lang ?? parentLang ?? zhCNLanguage).languageName;
      },
      get messages() {
        return (lang ?? parentLang ?? zhCNLanguage).messages;
      },
    }),
  );
  localeContext.provide(
    Object.freeze({
      get localeName() {
        return (locale ?? parentLocale ?? chinaLocale).localeName;
      },
      get timeZone() {
        return (locale ?? parentLocale ?? chinaLocale).timeZone;
      },
    }),
  );
  cssFactoryContext.provide(createCss);
  bindingContext.provideCss(s);

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
  lang={language.languageName}
  class={styleClass(
    s.colorScheme.raw(s.theme.themeName),
    s.fontFamily._sans,
    s.fontSize._md,
    s.fontWeight._normal,
    s.lineHeight._normal,
    s.color._text,
    className,
  )}
>
  {@render children?.()}
</div>
