import type { RippleHandle, RippleOrigin } from '../lib/feedback/gene/Ripple.svelte';
import type { UiCss } from '../lib/provider/css.js';

/** Svelte 管理空覆盖层；本控制器独占其子节点，attachment 清理时一并销毁。 */
export function createRippleController(
  layer: HTMLSpanElement,
  s: UiCss,
  circleClass: string,
  disabled: () => boolean,
): RippleHandle & { destroy(): void } {
  const view = layer.ownerDocument.defaultView!;
  const media = view.matchMedia('(prefers-reduced-motion: reduce)');
  let reducedMotion = media.matches;
  let disposed = false;
  let sequence = 0;
  type Wave = {
    id: number;
    node: HTMLSpanElement;
    enter: Animation;
    exit?: Animation;
    timer?: number;
    started: number;
  };
  // 记录浏览器动画资源，不是模板状态，不需要响应式 Map。
  const waves = new Map<number, Wave>();

  function remove(wave: Wave): void {
    waves.delete(wave.id);
    if (wave.timer !== undefined) view.clearTimeout(wave.timer);
    wave.enter.cancel();
    if (wave.exit) {
      wave.exit.onfinish = null;
      wave.exit.cancel();
    }
    wave.node.remove();
  }
  function cancel(): void {
    for (const wave of [...waves.values()]) remove(wave);
  }
  const update = () => {
    reducedMotion = media.matches;
    if (reducedMotion) cancel();
  };
  media.addEventListener('change', update);

  function start(origin?: RippleOrigin): number | undefined {
    if (disposed || disabled() || reducedMotion) return;
    const rect = layer.getBoundingClientRect();
    const width = layer.clientWidth,
      height = layer.clientHeight;
    if (!rect.width || !rect.height || !width || !height) return;
    // 视口坐标换算为本地 CSS 尺寸，兼容普通缩放；不在动画每帧测量。
    const x = origin
      ? Math.max(0, Math.min(width, ((origin.clientX - rect.left) * width) / rect.width))
      : width / 2;
    const y = origin
      ? Math.max(0, Math.min(height, ((origin.clientY - rect.top) * height) / rect.height))
      : height / 2;
    const radius = Math.hypot(Math.max(x, width - x), Math.max(y, height - y));
    if (!Number.isFinite(radius)) return;
    if (waves.size >= 4) {
      const oldest = waves.values().next().value;
      if (oldest) remove(oldest);
    }
    const node = layer.ownerDocument.createElement('span');
    node.className = circleClass;
    // 坐标是一次点击的瞬时数据，写入内联声明，不登记无限增长的 CSS 类。
    node.style.cssText =
      s.width.px(radius * 2) +
      s.height.px(radius * 2) +
      s.left.px(x - radius) +
      s.top.px(y - radius) +
      s.transform.raw('scale(0)');
    layer.append(node);
    const enter = node.animate([{ transform: 'scale(0)' }, { transform: 'scale(1)' }], {
      duration: 250,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      fill: 'forwards',
    });
    const id = ++sequence;
    waves.set(id, { id, node, enter, started: view.performance.now() });
    return id;
  }

  function stop(id?: number): void {
    const targets = id === undefined ? [...waves.values()] : [waves.get(id)];
    for (const wave of targets) {
      if (!wave || wave.exit || wave.timer !== undefined) continue;
      const fade = () => {
        wave.timer = undefined;
        if (!waves.has(wave.id)) return;
        wave.exit = wave.node.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 150,
          fill: 'forwards',
        });
        wave.exit.onfinish = () => remove(wave);
      };
      // 快速点击也保留可见反馈；重复 stop 不延长动画。
      const remaining = Math.max(0, 80 - (view.performance.now() - wave.started));
      if (remaining) wave.timer = view.setTimeout(fade, remaining);
      else fade();
    }
  }

  return {
    start,
    stop,
    cancel,
    destroy() {
      disposed = true;
      media.removeEventListener('change', update);
      cancel();
    },
  };
}
