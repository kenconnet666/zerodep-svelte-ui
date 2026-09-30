import type { UiCss } from '../provider/css.js';

/** 只生成焦点可见样式；焦点判断和移动仍由浏览器/所属组件负责。 */
export function focusRing(s: UiCss): string {
  return s._focusVisible(
    s.outlineStyle.solid,
    s.outlineWidth.px(2),
    s.outlineOffset.px(2),
    s.outlineColor._focusRing,
  );
}
