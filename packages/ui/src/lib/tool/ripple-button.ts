import type { Attachment } from 'svelte/attachments';
import type { RippleHandle } from '../feedback/gene/Ripple.svelte';

/** 原生按钮的视觉反馈接入；不合成 click、不拦截键盘、不管理业务回调。 */
export function rippleButton(
  readRipple: () => RippleHandle | undefined,
  readDisabled: () => boolean = () => false,
): Attachment<HTMLButtonElement> {
  return (button) => {
    const ripple = readRipple();
    // attachment 跟踪读取，禁用或实例替换时会先清理旧监听和动画。
    if (readDisabled() || !ripple) {
      ripple?.cancel();
      return;
    }
    const document = button.ownerDocument;
    const view = document.defaultView;
    let active: { pointer: number; wave: number } | undefined;
    const blocked = () =>
      readDisabled() ||
      button.matches(':disabled') ||
      button.getAttribute('aria-disabled') === 'true';
    const unlisten = () => {
      document.removeEventListener('pointerup', release, true);
      document.removeEventListener('pointercancel', abort, true);
      view?.removeEventListener('blur', cancel);
    };
    function cancel() {
      active = undefined;
      unlisten();
      ripple!.cancel();
    }
    function release(event: PointerEvent) {
      if (!active || active.pointer !== event.pointerId) return;
      if (blocked()) {
        cancel();
        return;
      }
      ripple!.stop(active.wave);
      active = undefined;
      unlisten();
    }
    function abort(event: PointerEvent) {
      if (active?.pointer === event.pointerId) cancel();
    }
    function down(event: PointerEvent) {
      if (!event.isPrimary || event.button !== 0 || event.defaultPrevented || blocked()) return;
      if (active) cancel();
      const wave = ripple!.start(event);
      if (wave === undefined) return;
      active = { pointer: event.pointerId, wave };
      // 仅按压期间监听释放；不抢 pointer capture，不妨碍触摸滚动和原生点击。
      document.addEventListener('pointerup', release, true);
      document.addEventListener('pointercancel', abort, true);
      view?.addEventListener('blur', cancel);
    }
    function click(event: MouseEvent) {
      // 键盘及无指针的程序化激活使用中心反馈；指针路径已经在 pointerdown 开始。
      if (event.detail !== 0 || event.defaultPrevented || blocked()) return;
      const id = ripple!.start();
      if (id !== undefined) ripple!.stop(id);
    }
    function leave() {
      // 触摸松开后通常立即发生 pointerleave；已释放的波纹仍应完成正常淡出。
      if (active) cancel();
    }
    button.addEventListener('pointerdown', down);
    button.addEventListener('click', click);
    button.addEventListener('pointerleave', leave);
    button.addEventListener('blur', cancel);
    return () => {
      button.removeEventListener('pointerdown', down);
      button.removeEventListener('click', click);
      button.removeEventListener('pointerleave', leave);
      button.removeEventListener('blur', cancel);
      cancel();
    };
  };
}
