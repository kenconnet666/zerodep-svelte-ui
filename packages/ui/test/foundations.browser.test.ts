import { afterEach, expect, test } from 'vitest';
import { cleanup, render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { css, Css, cssStats } from 'zerodep-css-svelte';
import { darkTheme, type RippleHandle } from '../src/lib/index.js';
import ButtonFoundationHarness from './fixtures/ButtonFoundationHarness.svelte';
import TextHarness from './fixtures/TextHarness.svelte';

afterEach(cleanup);

test('Text 保留文本转义、原生语义和默认样式，支持主题与 class 覆盖', async () => {
  const s = new Css();
  const screen = await render(TextHarness, {
    appearance: { as: 'h2', color: '_primary', size: '_lg' },
  });
  await expect.element(screen.getByRole('heading', { level: 2 })).toHaveTextContent('文字 <内容>');
  expect(screen.getByTestId('text').element().querySelector('内容')).toBeNull();
  await expect.element(screen.getByTestId('strong')).toHaveStyle({ fontWeight: '700' });
  expect(getComputedStyle(screen.getByTestId('code').element()).fontFamily).toContain('monospace');
  await screen.rerender({ theme: darkTheme });
  await expect
    .element(screen.getByTestId('text'))
    .toHaveStyle({ color: 'rgb(147, 197, 253)', fontSize: '20px' });
  await screen.rerender({
    appearance: { color: '_primary', size: 0, class: css(s.color.raw('purple')) },
  });
  await expect
    .element(screen.getByTestId('text'))
    .toHaveStyle({ color: 'rgb(128, 0, 128)', fontSize: '0px' });
  expect(screen.getByTestId('text').element().classList).toHaveLength(1);
});

test('原生鼠标、Enter、Space 只激活一次，普通按钮不意外提交表单', async () => {
  const screen = await render(ButtonFoundationHarness, {});
  const button = screen.getByRole('button', { name: '执行操作' });
  await button.click();
  await expect.element(screen.getByRole('status', { name: '操作次数' })).toHaveTextContent('1');
  await userEvent.type(button, '{Enter}');
  await expect.element(screen.getByRole('status', { name: '操作次数' })).toHaveTextContent('2');
  await userEvent.type(button, ' ');
  await expect.element(screen.getByRole('status', { name: '操作次数' })).toHaveTextContent('3');
  await expect.element(screen.getByRole('status', { name: '提交次数' })).toHaveTextContent('0');
  await screen.rerender({ type: 'submit' });
  await button.click();
  await expect.element(screen.getByRole('status', { name: '提交次数' })).toHaveTextContent('1');
});

test('Ripple 有界重叠，快速释放后清理，几何数据不增加 CSS 规则', async () => {
  let handle: RippleHandle | undefined;
  const screen = await render(ButtonFoundationHarness, {
    onRipple: (value) => {
      handle = value;
    },
  });
  const layer = screen.getByTestId('ripple-layer').element();
  const rules = cssStats().rules;
  for (let i = 0; i < 12; i++) handle!.start();
  expect(layer.children.length).toBe(4);
  expect(cssStats().rules).toBe(rules);
  handle!.stop();
  await expect.poll(() => layer.children.length).toBe(0);
  handle!.start();
  await screen.rerender({ disabled: true });
  await expect.poll(() => layer.children.length).toBe(0);
  expect(handle!.start()).toBeUndefined();
  await screen.rerender({ disabled: false });
  const retained = handle!;
  retained.start();
  await screen.rerender({ show: false });
  expect(layer.children.length).toBe(0);
  expect(retained.start()).toBeUndefined();
});

test('loading 保留焦点但阻止激活，fieldset 的原生禁用也不产生波纹', async () => {
  const screen = await render(ButtonFoundationHarness, { loading: true, type: 'submit' });
  const button = screen.getByRole('button', { name: '执行操作' });
  await userEvent.type(button, '{Enter}');
  await expect.element(button).toHaveFocus();
  await expect.element(screen.getByRole('status', { name: '操作次数' })).toHaveTextContent('0');
  await expect.element(screen.getByRole('status', { name: '提交次数' })).toHaveTextContent('0');
  expect(screen.getByTestId('ripple-layer').element().children.length).toBe(0);
  await screen.rerender({ loading: false, fieldsetDisabled: true });
  await expect.element(button).toBeDisabled();
  button
    .element()
    .dispatchEvent(new PointerEvent('pointerdown', { isPrimary: true, button: 0, bubbles: true }));
  expect(screen.getByTestId('ripple-layer').element().children.length).toBe(0);
});
