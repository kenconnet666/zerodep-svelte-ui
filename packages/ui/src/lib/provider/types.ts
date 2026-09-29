import type { Css } from 'zerodep-css-svelte';
import type { UiTheme } from './theme/types.js';
import type { UiLanguage } from './lang/types.js';
import type { UiLocale } from './locale/types.js';

/** 保持对象引用，读取属性时跟踪最新配置；不要解构成初始化快照。 */
export interface UiConfig {
  readonly css: Css;
  readonly theme: UiTheme;
  readonly lang: UiLanguage;
  readonly locale: UiLocale;
}
