import { getContext, setContext } from 'svelte';
import { createCssContext } from 'zerodep-css-svelte';
import type { UiCss, UiCssFactory } from '../lib/provider/css.js';
import type { UiTheme } from '../lib/provider/theme/types.js';
import type { UiLocale } from '../lib/provider/locale/types.js';
import type { UiLanguage } from '../lib/provider/lang/types.js';
import type { UiComponentThemes } from '../lib/provider/component-themes.js';

// 每种对象使用独立键；只有 Provider 允许读取不存在的父级，消费入口必须报错。
function context<T>() {
  const key = Symbol();
  return {
    optional: () => getContext<T | undefined>(key),
    provide: (value: T) => setContext(key, value),
    use(): T {
      const value = getContext<T | undefined>(key);
      if (value === undefined) {
        throw new Error('zerodep-svelte-ui: components must be inside a Provider.');
      }
      return value;
    },
  };
}

export const themeContext = context<UiTheme>();
export const localeContext = context<UiLocale>();
export const langContext = context<UiLanguage>();
export const componentThemesContext = context<UiComponentThemes>();
export const cssFactoryContext = context<UiCssFactory>();
export const uiCssContext = context<UiCss>();
const bindingContext = createCssContext<UiCss>();

export function provideCss(s: UiCss): void {
  // CSS 绑定与公开 useCss 使用同一个作者实例。
  bindingContext.provideCss(s);
  uiCssContext.provide(s);
}

/** 扁平 token 按层覆盖；undefined 表示继承，0 和空字符串仍是显式值。 */
export function mergeTokens<T extends object>(
  base: T,
  ...overrides: Array<Partial<T> | undefined>
): T {
  const result = { ...base };
  for (const override of overrides) {
    if (!override) continue;
    for (const key of Object.keys(override) as Array<keyof T>) {
      const value = override[key];
      if (value !== undefined) result[key] = value;
    }
  }
  return result;
}
