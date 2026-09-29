import type { ComponentProps, Snippet } from 'svelte';
import { Search } from '@lucide/icons';
import { Icon } from '../../src/lib/index.js';

type Props = ComponentProps<typeof Icon>;
export const valid: Props = {
  icon: Search,
  size: '_sm',
  color: '_primary',
  strokeWidth: 1.5,
  tokens: { _sizeMd: '20px', _colorPrimary: 'purple' },
  'aria-label': '搜索',
  class: ['width:24px;', [false, null, 'color:red;']],
};
// @ts-expect-error class 使用 CssInput，不接受原生 class 条件对象。
export const badClass: Props = { icon: Search, class: { active: true } };
// @ts-expect-error 必须传入图标数据。
export const missing: Props = {};
// @ts-expect-error 图标名字符串不是 SVG 资源。
export const badIcon: Props = { icon: 'Search' };
// @ts-expect-error 尺寸是语义名称，精确样式通过 class 设置。
export const badSize: Props = { icon: Search, size: 24 };
// @ts-expect-error 颜色是语义名称。
export const badColor: Props = { icon: Search, color: '#fff' };
// @ts-expect-error 主题颜色必须带下划线。
export const oldColor: Props = { icon: Search, color: 'primary' };
// @ts-expect-error 主题字号必须带下划线。
export const oldSize: Props = { icon: Search, size: 'md' };
// @ts-expect-error 组件 token 拒绝拼写错误。
export const badToken: Props = { icon: Search, tokens: { sizeMD: '20px' } };
// @ts-expect-error 描边 token 为数字。
export const badTokenValue: Props = { icon: Search, tokens: { _strokeWidth: '2px' } };
// @ts-expect-error viewBox 由图标数据决定。
export const badGeometry: Props = { icon: Search, viewBox: '0 0 1 1' };
declare const children: Snippet;
// @ts-expect-error 图形只通过 icon 数据传入，不接受 children snippet。
export const badChildren: Props = { icon: Search, children };
// @ts-expect-error icon 接收 SVG 数据，不接受 Svelte 组件。
export const badComponent: Props = { icon: Icon };

// @ts-expect-error 组件 token 统一带下划线，普通 strokeWidth prop 不受影响。
export const oldComponentToken: Props = { icon: Search, tokens: { strokeWidth: 2 } };
