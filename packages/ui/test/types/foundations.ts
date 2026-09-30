import type { ComponentProps } from 'svelte';
import { Ripple, Text, rippleButton, type RippleHandle } from '../../src/lib/index.js';

export const text: ComponentProps<typeof Text> = {
  as: 'h2',
  size: '_xl',
  fontWeight: '_semibold',
  lineHeight: 1.5,
  color: 'purple',
};
export const ripple: ComponentProps<typeof Ripple> = {
  color: '_primary',
  opacity: '_pressed',
  disabled: true,
};
// @ts-expect-error Text 不提供任意交互根元素。
export const badTag: ComponentProps<typeof Text> = { as: 'button' };
// @ts-expect-error 不为非零数字字号自动补 px。
export const badSize: ComponentProps<typeof Text> = { size: 18 };
// @ts-expect-error 波纹永远是装饰层。
export const visibleRipple: ComponentProps<typeof Ripple> = { 'aria-hidden': false };
export function connect(handle: RippleHandle) {
  const id = handle.start({ clientX: 10, clientY: 20 });
  handle.stop(id);
  handle.cancel();
  return rippleButton(() => handle);
}
