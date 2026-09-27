import { getContext, setContext } from 'svelte';
import { createCssContext } from 'zerodep-css-svelte';
import type { UiCss, UiTheme } from './css.js';

export interface UiConfig {
  readonly css: UiCss;
  readonly theme: UiTheme;
  readonly locale: string;
}

const configKey = Symbol('zerodep-svelte-ui');
const cssContext = createCssContext<UiCss>();

export function parentConfig(): UiConfig | undefined {
  return getContext<UiConfig | undefined>(configKey);
}

export function provideConfig(config: UiConfig): void {
  // 同一个作者也交给 CSS 适配器，保持 bx 绑定所有者与 Provider 作用域一致。
  cssContext.provideCss(config.css);
  setContext(configKey, Object.freeze(config));
}

export function useConfig(): UiConfig {
  const config = parentConfig();
  if (!config) throw new Error('zerodep-svelte-ui: components must be inside a Provider.');
  return config;
}

export function useCss(): UiCss {
  return useConfig().css;
}
