import type { ComponentProps, Snippet } from 'svelte';
import { Search } from '@lucide/icons';
import { Icon } from '../../src/lib/index.js';

type Props = ComponentProps<typeof Icon>;
export const valid: Props = {
  icon: Search,
  size: '_sm',
  color: '_primary',
  strokeWidth: 1.5,
  verticalAlign: 'middle',
  'aria-label': '搜索',
  class: ['width:24px;', [false, null, 'color:red;']],
};
// @ts-expect-error class 使用 CssInput，不接受原生 class 条件对象。
export const badClass: Props = { icon: Search, class: { active: true } };
// 普通可选属性；缺少图标由运行时检查。
export const missing: Props = {};
// @ts-expect-error 图标名字符串不是 SVG 资源。
export const badIcon: Props = { icon: 'Search' };
export const rawValues: Props = {
  icon: Search,
  size: '18px',
  color: '#fff',
  strokeWidth: '2px',
  verticalAlign: 'text-bottom',
};
export const allThemeKeys: Props = { icon: Search, size: '_2xl', color: '_onPrimary' };
export const inherited: Props = {
  icon: Search,
  size: 'inherit',
  color: 'currentColor',
  strokeWidth: 'inherit',
  verticalAlign: 'inherit',
};
// @ts-expect-error 非零尺寸必须带 CSS 单位，不额外约定数字转 px。
export const badSize: Props = { icon: Search, size: 24 };
// @ts-expect-error CSS 颜色不接受数字。
export const badColor: Props = { icon: Search, color: 123 };
// @ts-expect-error 描边不接受布尔值。
export const badStroke: Props = { icon: Search, strokeWidth: false };
// @ts-expect-error 垂直对齐不接受对象。
export const badAlign: Props = { icon: Search, verticalAlign: {} };
// @ts-expect-error viewBox 由图标数据决定。
export const badGeometry: Props = { icon: Search, viewBox: '0 0 1 1' };
declare const children: Snippet;
// @ts-expect-error 图形只通过 icon 数据传入，不接受 children snippet。
export const badChildren: Props = { icon: Search, children };
// @ts-expect-error icon 接收 SVG 数据，不接受 Svelte 组件。
export const badComponent: Props = { icon: Icon };

// @ts-expect-error Icon 不再接收组件 tokens。
export const oldComponentToken: Props = { icon: Search, tokens: { strokeWidth: 2 } };

export const named: Props = { lucide: 'search' };
export const hyphenName: Props = { lucide: 'circle-plus' };
// 属性类型保持简单，二选一由编译插件和运行时检查。
export const both: Props = { icon: Search, lucide: 'search' };
// @ts-expect-error 官方加号名称为 plus，不添加 add 别名。
export const unknownLucide: Props = { lucide: 'add' };
