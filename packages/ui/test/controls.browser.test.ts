import { afterEach, expect, test } from 'vitest';
import { cleanup, render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { css, Css, cssStats } from 'zerodep-css-svelte';
import { darkTheme } from '../src/lib/index.js';
import ControlsHarness from './fixtures/ControlsHarness.svelte';

afterEach(cleanup);

test('省略初值从 min 开始，重置沿用原生绑定行为，可提前取消按钮操作', async () => {
  const screen = await render(ControlsHarness, {
    cancelReset: true,
    nativeResetProbe: true,
    slider: { defaultValue: undefined, min: 0, max: 10, step: 3 },
  });
  const slider = screen.getByRole('slider', { name: '数值' });
  await expect.element(slider).toHaveValue('0');
  await expect
    .poll(() => screen.getByRole('status', { name: '绑定值' }).element().textContent)
    .toMatch(/\/0$/);
  await userEvent.type(slider, '{ArrowRight}');
  await expect.element(slider).toHaveValue('3');
  let resetPrevented = false;
  (slider.element() as HTMLInputElement).form!.addEventListener(
    'reset',
    (event) => {
      queueMicrotask(() => {
        resetPrevented = event.defaultPrevented;
      });
    },
    { once: true },
  );
  await screen.getByRole('button', { name: '重置' }).click();
  expect(resetPrevented).toBe(true);
  // 当前 Svelte 的 reset 捕获监听使用微任务，部分浏览器可能在表单 preventDefault 前同步绑定。
  // 用原生 bind:value 对照验证，而不是在 UI 内复制一份绑定/重置框架。
  expect((slider.element() as HTMLInputElement).value).toBe(
    (screen.getByRole('slider', { name: '原生对照' }).element() as HTMLInputElement).value,
  );
  await userEvent.type(slider, '{Home}{ArrowRight}');
  // 需要取消重置时，在触发按钮的 click 阶段阻止默认行为，reset 事件不会产生。
  screen
    .getByRole('button', { name: '重置' })
    .element()
    .addEventListener('click', (event) => event.preventDefault(), { once: true });
  await screen.getByRole('button', { name: '重置' }).click();
  await expect.element(slider).toHaveValue('3');
  await expect
    .poll(() => screen.getByRole('status', { name: '绑定值' }).element().textContent)
    .toMatch(/\/3$/);
});

test('Checkbox 标签、Space、半选和父级更新保持原生双向绑定', async () => {
  const screen = await render(ControlsHarness, { checked: false, mixed: true });
  const checkbox = screen.getByRole('checkbox', { name: '接受条款' });
  await expect.element(checkbox).toHaveAttribute('aria-checked', 'mixed');
  expect((checkbox.element() as HTMLInputElement).indeterminate).toBe(true);
  await screen.getByText('接受条款', { exact: true }).click();
  await expect.element(checkbox).toBeChecked();
  expect((checkbox.element() as HTMLInputElement).indeterminate).toBe(false);
  await userEvent.type(checkbox, ' ');
  await expect.element(checkbox).not.toBeChecked();
  await screen.rerender({ checked: true, mixed: true });
  expect((checkbox.element() as HTMLInputElement).checked).toBe(true);
  await expect.element(checkbox).toHaveAttribute('aria-checked', 'mixed');
});

test('Select 支持默认选项、数字值、选项组及父级替换', async () => {
  const screen = await render(ControlsHarness);
  const select = screen.getByRole('combobox', { name: '选项', exact: true });
  await expect.element(select).toHaveValue('b');
  await select.selectOptions('d');
  await expect
    .poll(() => screen.getByRole('status', { name: '绑定值' }).element().textContent)
    .toContain('/d/');
  await screen.rerender({ selected: 'a' });
  await expect.element(select).toHaveValue('a');
  await screen.getByRole('combobox', { name: '数字选项' }).selectOptions('1');
  await expect
    .element(screen.getByRole('status', { name: '数字类型' }))
    .toHaveTextContent('number:1');
});

test('Slider 支持小数步长、Home/End、原生事件，连续输入不增长 CSS 规则', async () => {
  const screen = await render(ControlsHarness, { amount: 3 });
  const slider = screen.getByRole('slider', { name: '数值' });
  await userEvent.type(slider, '{ArrowRight}');
  await expect.element(slider).toHaveValue('3.5');
  await userEvent.type(slider, '{End}');
  await expect.element(slider).toHaveValue('10');
  await userEvent.type(slider, '{ArrowRight}');
  await expect.element(slider).toHaveValue('10');
  await userEvent.type(slider, '{Home}');
  await expect.element(slider).toHaveValue('0');
  const count = cssStats().rules;
  for (let i = 0; i < 10; i++) await userEvent.type(slider, '{ArrowRight}');
  expect(cssStats().rules).toBe(count);
  await expect
    .poll(() => screen.getByRole('status', { name: '绑定值' }).element().textContent)
    .toMatch(/\/5$/);
  await expect.element(screen.getByRole('status', { name: '事件' })).not.toHaveTextContent('0/0');
});

test('默认值在 form.reset 后恢复并同步绑定，禁用控件不进入 FormData', async () => {
  const screen = await render(ControlsHarness);
  const checkbox = screen.getByRole('checkbox', { name: '接受条款' });
  const select = screen.getByRole('combobox', { name: '选项', exact: true });
  const slider = screen.getByRole('slider', { name: '数值' });
  await checkbox.click();
  await select.selectOptions('d');
  await userEvent.type(slider, '{End}');
  await screen.getByRole('button', { name: '重置' }).click();
  await expect.element(checkbox).toBeChecked();
  await expect.element(select).toHaveValue('b');
  await expect.element(slider).toHaveValue('3');
  await expect
    .element(screen.getByRole('status', { name: '绑定值' }))
    .toHaveTextContent('true/false/b/3');
  await screen.getByRole('button', { name: '提交' }).click();
  await expect
    .element(screen.getByRole('status', { name: '表单值' }))
    .toHaveTextContent('[["accepted","yes"],["choice","b"],["amount","3"]]');
  for (const state of [{ disabled: true }, { disabled: false, fieldsetDisabled: true }]) {
    await screen.rerender(state);
    await expect.element(checkbox).toBeDisabled();
    await expect.element(select).toBeDisabled();
    await expect.element(slider).toBeDisabled();
    await screen.getByRole('button', { name: '提交' }).click();
    await expect.element(screen.getByRole('status', { name: '表单值' })).toHaveTextContent('[]');
  }
});

test('尺寸、主题和 slotProps 覆盖正确，顶层原生属性落在实际控件', async () => {
  const s = new Css();
  const screen = await render(ControlsHarness, {
    theme: darkTheme,
    checkbox: {
      size: '20px',
      id: 'agreement',
      slotProps: {
        label: { size: '12px', 'data-testid': 'label' },
        input: { class: css(s.width.px(22)) },
      },
    },
    select: {
      size: '20px',
      class: css(s.width.px(250)),
      slotProps: { select: { class: css(s.fontSize.px(18)) }, icon: { size: '12px' } },
    },
    slider: {
      size: '20px',
      formatValue: (value) => `${value}秒`,
      slotProps: { input: { style: 'color: purple' }, value: { size: '12px' } },
    },
  });
  const checkbox = screen.getByRole('checkbox', { name: '接受条款' });
  await expect.element(checkbox).toHaveAttribute('id', 'agreement');
  await expect
    .element(checkbox)
    .toHaveStyle({ width: '22px', height: '20px', color: 'rgb(147, 197, 253)' });
  await expect.element(screen.getByTestId('label')).toHaveStyle({ fontSize: '12px' });
  const select = screen.getByRole('combobox', { name: '选项', exact: true });
  await expect.element(select).toHaveStyle({ fontSize: '18px' });
  expect(select.element().parentElement!.getBoundingClientRect().height).toBe(42.5);
  expect(select.element().parentElement!.getBoundingClientRect().width).toBe(250);
  const slider = screen.getByRole('slider', { name: '数值' });
  await expect.element(slider).toHaveAttribute('aria-valuetext', '3秒');
  await expect.element(slider).toHaveStyle({ color: 'rgb(128, 0, 128)', height: '30px' });
});
