/** 同时识别显式状态、fieldset 原生禁用和 ARIA 禁用；ARIA 本身不会阻止点击。 */
export function isButtonBlocked(button: HTMLButtonElement, blocked = false): boolean {
  return blocked || button.matches(':disabled') || button.getAttribute('aria-disabled') === 'true';
}
