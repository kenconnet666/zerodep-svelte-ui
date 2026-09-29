import type { ComponentProps } from 'svelte';
import { Provider, UiCss, type UiConfig } from '../../src/lib/index.js';

type Props = ComponentProps<typeof Provider>;
export const valid: Props = {
  css: new UiCss(),
  theme: 'dark',
  locale: 'en-US',
  class: ['color:red;', [false, undefined, 'padding:4px;']],
};
// @ts-expect-error class 使用 CssInput，不接受原生 class 条件对象。
export const badClass: Props = { class: { ready: true } };
// @ts-expect-error 第一版只支持明确的亮暗模式。
export const badTheme: Props = { theme: 'system' };
// @ts-expect-error dir 不属于 Provider API。
export const noDirection: Props = { dir: 'rtl' };
// @ts-expect-error lang 由 locale 统一控制。
export const noLang: Props = { lang: 'en' };
// @ts-expect-error 作者必须满足组件库的 UiCss 契约。
export const badCss: Props = { css: {} };
export function readonlyConfig(config: UiConfig) {
  // @ts-expect-error 消费者不能修改注入的有效配置。
  config.locale = 'en';
}
