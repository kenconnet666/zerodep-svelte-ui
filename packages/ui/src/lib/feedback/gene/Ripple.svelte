<script module lang="ts">
  /** 指针相对浏览器视口的坐标，与 PointerEvent.clientX/clientY 一致。 */
  export interface RippleOrigin {
    clientX: number;
    clientY: number;
  }
  export interface RippleHandle {
    start(origin?: RippleOrigin): number | undefined;
    stop(id?: number): void;
    cancel(): void;
  }
</script>

<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { css, type CssInput } from 'zerodep-css-svelte';
  import { useCss } from '../../provider/context.js';
  import type { UiCss } from '../../provider/css.js';
  import { createRippleController } from '../../../internal/ripple-controller.js';

  let {
    color = '_primary',
    opacity = '_pressed',
    disabled = false,
    class: className,
    ...rest
  }: Omit<
    HTMLAttributes<HTMLSpanElement>,
    'children' | 'class' | 'color' | 'aria-hidden' | 'role' | 'tabindex'
  > & {
    color?: Parameters<UiCss['color']['raw']>[0];
    opacity?: Parameters<UiCss['opacity']['raw']>[0];
    disabled?: boolean;
    class?: CssInput;
  } = $props();
  const s = useCss();
  const circleClass = css(
    s.position.absolute,
    s.borderRadius.raw('50%'),
    s.backgroundColor.currentColor,
    s.pointerEvents.none,
  );
  let controller: ReturnType<typeof createRippleController> | undefined;

  function attach(layer: HTMLSpanElement) {
    const instance = createRippleController(layer, s, circleClass, () => disabled);
    controller = instance;
    return () => {
      instance.destroy();
      if (controller === instance) controller = undefined;
    };
  }

  /** 无坐标时从中心扩散；未挂载、禁用或减少动效时不创建节点。 */
  export function start(origin?: RippleOrigin): number | undefined {
    return controller?.start(origin);
  }
  /** 松开后淡出指定波纹；省略编号则全部淡出。 */
  export function stop(id?: number): void {
    controller?.stop(id);
  }
  /** 取消时立即回收；卸载由 attachment 自动清理。 */
  export function cancel(): void {
    controller?.cancel();
  }
  $effect(() => {
    if (disabled) cancel();
  });
</script>

<span
  {@attach attach}
  {...rest}
  aria-hidden="true"
  class={css(
    s.position.absolute,
    s.inset.px(0),
    s.borderRadius.inherit,
    s.overflow.hidden,
    s.pointerEvents.none,
    s.color.raw(color),
    s.opacity.raw(opacity),
    className,
  )}
></span>
