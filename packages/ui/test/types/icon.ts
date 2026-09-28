import type { ComponentProps, Snippet } from 'svelte';
import { Search } from '@lucide/icons';
import { Icon } from '../../src/lib/index.js';

type Props = ComponentProps<typeof Icon>;
export const valid: Props = {
  icon: Search,
  size: 'sm',
  color: 'primary',
  strokeWidth: 1.5,
  'aria-label': '搜索',
};
// @ts-expect-error 必须传入图标数据。
export const missing: Props = {};
// @ts-expect-error 图标名字符串不是 SVG 资源。
export const badIcon: Props = { icon: 'Search' };
// @ts-expect-error 尺寸是语义名称，精确样式通过 class 设置。
export const badSize: Props = { icon: Search, size: 24 };
// @ts-expect-error 颜色是语义名称。
export const badColor: Props = { icon: Search, color: '#fff' };
// @ts-expect-error viewBox 由图标数据决定。
export const badGeometry: Props = { icon: Search, viewBox: '0 0 1 1' };
declare const children: Snippet;
// @ts-expect-error 图形只通过 icon 数据传入，不接受 children snippet。
export const badChildren: Props = { icon: Search, children };
// @ts-expect-error icon 接收 SVG 数据，不接受 Svelte 组件。
export const badComponent: Props = { icon: Icon };
