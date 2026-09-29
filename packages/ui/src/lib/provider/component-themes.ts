import type { IconTokens } from '../display/gene/icon-theme.js';

/** 仅列已实现组件；Provider 注入显式覆盖项，不提前计算组件默认值。 */
export interface UiComponentThemes {
  readonly Icon?: Partial<IconTokens>;
}
