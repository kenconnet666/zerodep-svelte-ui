import type { ComponentProps } from 'svelte';
import { Css } from 'zerodep-css-svelte';
import {
  Provider,
  UiCss,
  lightTheme,
  enUSLanguage,
  usLocale,
  useTheme,
  useLocale,
  useLang,
} from '../../src/lib/index.js';

type Props = ComponentProps<typeof Provider>;
export const valid: Props = {
  css: (readTheme) => new UiCss(readTheme),
  theme: { ...lightTheme, color: { ...lightTheme.color, _primary: 'purple' } },
  lang: enUSLanguage,
  locale: usLocale,
  class: ['color:red;', [false, undefined, 'padding:4px;']],
};
// @ts-expect-error class 接受 CssInput，不接受条件对象。
export const badClass: Props = { class: { ready: true } };
// @ts-expect-error 主题必须提供数据，不接收模式字符串。
export const badTheme: Props = { theme: 'dark' };
// @ts-expect-error lang 是语言对象。
export const badLanguage: Props = { lang: 'en' };
// @ts-expect-error 语言名称只能使用明确支持的 zh-CN / en-US。
export const badLanguageName: Props = { lang: { ...enUSLanguage, languageName: 'en-GB' } };
// @ts-expect-error 地区名称只能使用明确支持的 zh-CN / en-US。
export const badLocaleName: Props = { locale: { ...usLocale, localeName: 'fr-FR' } };
// @ts-expect-error 地区配置必须有显式时区。
export const badLocale: Props = { locale: { localeName: 'en-US' } };
// @ts-expect-error 作者应实现 Css。
export const badCss: Props = { css: {} };
// @ts-expect-error Provider 不再提供组件 token 覆盖。
export const badComponentTokens: Props = { components: { Icon: { _sizeMd: '20px' } } };
export function readonlyObjects() {
  const theme = useTheme();
  const locale = useLocale();
  const lang = useLang();
  // @ts-expect-error 主题通过只读对象提供。
  theme.color._primary = 'red';
  // @ts-expect-error 地区通过只读对象提供。
  locale.timeZone = 'UTC';
  // @ts-expect-error 语言通过只读对象提供。
  lang.messages.loading = 'Loading';
}

// @ts-expect-error 必须传创建函数，让 Provider 注入当前作用域的主题。
export const badInstance: Props = { css: new Css() };

export function themeAuthor(s: UiCss) {
  const declarations: string[] = [
    s.color._primary,
    s.color.raw('_primary'),
    s.backgroundColor._surface,
    s.backgroundColor.raw('_surface'),
    s.fontSize._md,
    s.fontSize.raw('_md'),
    s.fontSize.raw(0),
  ];
  // @ts-expect-error 主题语义属性必须带下划线。
  void s.color.primary;
  // @ts-expect-error 主题字号属性必须带下划线。
  void s.fontSize.md;
  return declarations;
}

export const oldThemeKey: Props = {
  // @ts-expect-error 主题数据键也必须带下划线，不保留旧名称。
  theme: { ...lightTheme, color: { ...lightTheme.color, primary: 'purple' } },
};
export const oldSpaceKey: Props = {
  // @ts-expect-error 数字尺寸键统一带下划线。
  theme: { ...lightTheme, space: { ...lightTheme.space, '2xs': '2px' } },
};
