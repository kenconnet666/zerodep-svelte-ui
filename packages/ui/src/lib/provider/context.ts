import type { UiCss } from './css.js';
import {
  themeContext,
  localeContext,
  langContext,
  uiCssContext,
} from '../../internal/provider-context.js';
import type { UiTheme } from './theme/types.js';
import type { UiLocale } from './locale/types.js';
import type { UiLanguage } from './lang/types.js';

/** 在 Provider 后代初始化时调用；保留对象并在模板或派生表达式中读取属性。 */
export function useTheme(): UiTheme {
  return themeContext.use();
}
export function useLocale(): UiLocale {
  return localeContext.use();
}
export function useLang(): UiLanguage {
  return langContext.use();
}
export function useCss(): UiCss {
  return uiCssContext.use();
}
