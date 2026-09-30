import { afterEach, expect, test } from 'vitest';
import { cleanup, render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { css, Css } from 'zerodep-css-svelte';
import { Search } from '@lucide/icons';
import { lightTheme } from '../src/lib/index.js';
import ButtonHarness from './fixtures/ButtonHarness.svelte';

afterEach(cleanup);

test('Button 鼠标和键盘各激活一次，默认不提交，显式 submit/reset 保持原生行为', async () => {
  const screen = await render(ButtonHarness);
  const button = screen.getByRole('button', { name: '保存' });
  await button.click();
  await userEvent.type(button, '{Enter}');
  await userEvent.type(button, ' ');
  await expect.element(screen.getByRole('status', { name: '点击' })).toHaveTextContent('3');
  await expect.element(screen.getByRole('status', { name: '提交' })).toHaveTextContent('0');
  await screen.rerender({ appearance: { type: 'submit' } });
  await button.click();
  await expect.element(screen.getByRole('status', { name: '提交' })).toHaveTextContent('1');
  await screen.rerender({ appearance: { type: 'reset' } });
  await button.click();
  await expect.element(screen.getByRole('status', { name: '重置' })).toHaveTextContent('1');
});

test('Loading 保留焦点、名称和尺寸，并阻止鼠标、键盘和程序化提交', async () => {
  const screen = await render(ButtonHarness, { appearance: { type: 'submit' } });
  const button = screen.getByRole('button', { name: '保存' });
  await userEvent.type(button, '{Enter}');
  const rect = button.element().getBoundingClientRect();
  await screen.rerender({ appearance: { loading: true, type: 'submit' } });
  await expect.element(button).toHaveFocus();
  await expect.element(button).toHaveAttribute('aria-busy', 'true');
  expect((button.element() as HTMLButtonElement).disabled).toBe(false);
  expect(button.element().getBoundingClientRect().width).toBe(rect.width);
  expect(button.element().getBoundingClientRect().height).toBe(rect.height);
  // ARIA 禁用会被自动化 click 的可操作性检查拦截，直接派发事件验证组件自身的守卫。
  const click = new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 });
  button.element().dispatchEvent(click);
  expect(click.defaultPrevented).toBe(true);
  (button.element() as HTMLButtonElement).click();
  await userEvent.type(button, '{Enter}');
  await userEvent.type(button, ' ');
  await expect.element(screen.getByRole('status', { name: '点击' })).toHaveTextContent('1');
  await expect.element(screen.getByRole('status', { name: '提交' })).toHaveTextContent('1');
  expect(button.element().querySelector('[role="status"]')).toBeNull();
  await screen.rerender({ appearance: { loading: false } });
  await button.click();
  await expect.element(screen.getByRole('status', { name: '点击' })).toHaveTextContent('2');
});

test('原生 disabled 和 fieldset 禁用不会激活或产生 Ripple', async () => {
  const screen = await render(ButtonHarness, { appearance: { disabled: true } });
  const button = screen.getByRole('button', { name: '保存' });
  await expect.element(button).toBeDisabled();
  (button.element() as HTMLButtonElement).click();
  await screen.rerender({ appearance: {}, fieldsetDisabled: true });
  await expect.element(button).toBeDisabled();
  button.element().dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  button
    .element()
    .dispatchEvent(new PointerEvent('pointerdown', { isPrimary: true, button: 0, bubbles: true }));
  expect(button.element().lastElementChild?.children.length).toBe(0);
  await expect.element(screen.getByRole('status', { name: '点击' })).toHaveTextContent('0');
});

test('size 等比联动，slotProps 和 class/style 优先，Loading 文案响应语言', async () => {
  const screen = await render(ButtonHarness, { appearance: { icon: Search } });
  const button = screen.getByRole('button', { name: '保存' });
  await expect.element(button).toHaveStyle({
    height: '34px',
    paddingInline: '12px',
    boxSizing: 'border-box',
    fontSize: '16px',
  });
  expect(getComputedStyle(button.element().querySelector('svg')!).width).toBe('16px');
  expect(getComputedStyle(button.element().querySelector('span > span')!).fontSize).toBe('14px');
  await screen.rerender({ appearance: { size: '20px', icon: Search, loading: true } });
  await expect
    .element(button)
    .toHaveStyle({ height: '42.5px', paddingInline: '15px', fontSize: '20px' });
  expect(getComputedStyle(button.element().querySelector('svg')!).width).toBe('20px');
  expect(getComputedStyle(button.element().querySelector('span > span')!).fontSize).toBe('17.5px');
  const loading = button.element().querySelector(':scope > span:nth-child(2) > span')!;
  expect(getComputedStyle(loading).width).toBe('20px');
  const s = new Css();
  await screen.rerender({
    english: true,
    appearance: {
      icon: Search,
      size: '24px',
      loading: true,
      class: css(s.height.px(40), s.width.px(120)),
      slotProps: {
        label: {
          size: '18px',
          class: css(s.color.raw('purple')),
          style: 'letter-spacing: 1px',
          'data-testid': 'label',
        },
        icon: { size: '20px' },
        loading: { size: '10px', class: css(s.color.raw('red')), 'data-testid': 'inner-loading' },
        ripple: { opacity: 0.2, style: 'color: purple', 'data-testid': 'inner-ripple' },
      },
    },
  });
  await expect.element(button).toHaveStyle({ height: '40px', width: '120px' });
  await expect
    .element(screen.getByTestId('label'))
    .toHaveStyle({ fontSize: '18px', color: 'rgb(128, 0, 128)', letterSpacing: '1px' });
  expect(getComputedStyle(button.element().querySelector('svg')!).width).toBe('20px');
  await expect
    .element(screen.getByTestId('inner-loading'))
    .toHaveStyle({ width: '10px', color: 'rgb(255, 0, 0)' });
  await expect
    .element(screen.getByTestId('inner-ripple'))
    .toHaveStyle({ opacity: '0.2', color: 'rgb(128, 0, 128)' });
  await expect.element(screen.getByTestId('standalone-loading')).toHaveAccessibleName('Loading');
  expect(button.element().classList.length).toBe(1);
});

test('Provider 替换字号 token 后联动更新，undefined 转发值仍使用比例默认值', async () => {
  const screen = await render(ButtonHarness, {
    appearance: {
      icon: Search,
      slotProps: { label: { size: undefined }, icon: { size: undefined } },
    },
  });
  const button = screen.getByRole('button', { name: '保存' });
  await screen.rerender({
    theme: { ...lightTheme, fontSize: { ...lightTheme.fontSize, _md: '20px' } },
  });
  await expect.element(button).toHaveStyle({ height: '42.5px' });
  expect(getComputedStyle(button.element().querySelector('svg')!).width).toBe('20px');
  expect(getComputedStyle(button.element().querySelector('span > span')!).fontSize).toBe('17.5px');
});
