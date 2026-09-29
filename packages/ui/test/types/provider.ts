import type { ComponentProps } from 'svelte';
import { Css } from 'zerodep-css-svelte';
import {
  Provider,
  UiCss,
  lightTheme,
  enUSLanguage,
  usLocale,
  type UiConfig,
} from '../../src/lib/index.js';

type Props = ComponentProps<typeof Provider>;
export const valid: Props = {
  css: (readTheme) => new UiCss(readTheme),
  theme: { ...lightTheme, color: { ...lightTheme.color, primary: 'purple' } },
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
// @ts-expect-error 地区配置必须有显式时区。
export const badLocale: Props = { locale: { code: 'en-US' } };
// @ts-expect-error 作者应实现 Css。
export const badCss: Props = { css: {} };
export function readonlyConfig(config: UiConfig) {
  // @ts-expect-error 注入配置只读。
  config.locale = usLocale;
  // @ts-expect-error 默认主题也以只读数据提供。
  config.theme.color.primary = 'red';
}

// @ts-expect-error 必须传创建函数，让 Provider 注入当前作用域的主题。
export const badInstance: Props = { css: new Css() };
