import { getContext, setContext } from 'svelte';
import { createCssContext } from 'zerodep-css-svelte';
import type { UiCss } from '../lib/provider/css.js';
import type { UiConfig } from '../lib/provider/types.js';

const configKey = Symbol('zerodep-svelte-ui');
const cssContext = createCssContext<UiCss>();

export function parentConfig(): UiConfig | undefined {
  return getContext<UiConfig | undefined>(configKey);
}

export function provideConfig(config: UiConfig): void {
  // CSS 绑定的所有者与组件使用同一个作者；每个请求的 context 相互隔离。
  cssContext.provideCss(config.css);
  setContext(configKey, Object.freeze(config));
}
