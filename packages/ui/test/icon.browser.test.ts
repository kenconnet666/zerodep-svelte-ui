import { afterEach, expect, test } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { cleanup, render } from 'vitest-browser-svelte';
import { Search, Check } from '@lucide/icons';
import type { LucideIconData } from '@lucide/icons';
import { css, cssStats } from 'zerodep-css-svelte';
import { UiCss, UiFontSizeCss } from '../src/lib/index.js';
import IconHarness from './fixtures/IconHarness.svelte';
import IconButtonHarness from './fixtures/IconButtonHarness.svelte';

afterEach(cleanup);

test('图标真实渲染为 SVG，切换数据和语义外观时更新', async () => {
  const source = JSON.stringify(Search);
  const screen = await render(IconHarness, { iconProps: { icon: Search, color: 'primary' } });
  const icon = screen.getByTestId('icon');
  await expect.element(icon).toHaveStyle({ width: '16px', color: 'rgb(29, 78, 216)' });
  const element = icon.element();
  expect(element.querySelector('circle')?.namespaceURI).toBe('http://www.w3.org/2000/svg');
  expect(element.querySelector('[key]')).toBeNull();
  await expect.element(icon).toHaveAttribute('aria-hidden', 'true');
  await expect.element(icon).toHaveAttribute('focusable', 'false');

  await screen.rerender({
    iconProps: { icon: Check, size: 'lg', color: 'primary' },
    theme: 'dark',
  });
  await expect.element(icon).toHaveStyle({ width: '24px', color: 'rgb(147, 197, 253)' });
  expect(element.querySelector('circle')).toBeNull();
  expect(JSON.stringify(Search)).toBe(source);
});

test('继承作者扩展、外部 class 和文字颜色，不在 Icon 创建作者', async () => {
  class Sizes extends UiFontSizeCss {
    override readonly _md = this.px(21);
  }
  class CustomCss extends UiCss {
    override readonly fontSize = new Sizes();
  }
  const author = new CustomCss();
  const override = css(author.width.px(30), author.height.px(30), author.color.green);
  const screen = await render(IconHarness, {
    css: author,
    iconProps: { icon: Search },
    style: 'color:rgb(128, 0, 128)',
  });
  await expect
    .element(screen.getByTestId('icon'))
    .toHaveStyle({ width: '21px', color: 'rgb(128, 0, 128)' });
  await screen.rerender({ iconProps: { icon: Search, class: override } });
  await expect
    .element(screen.getByTestId('icon'))
    .toHaveStyle({ width: '30px', height: '30px', color: 'rgb(0, 128, 0)' });
  expect(screen.getByTestId('icon').element().classList).toHaveLength(1);
  await screen.rerender({
    iconProps: { icon: Search, size: 'sm', color: 'danger', class: override },
    theme: 'dark',
  });
  await expect
    .element(screen.getByTestId('icon'))
    .toHaveStyle({ width: '30px', color: 'rgb(0, 128, 0)' });
  await screen.rerender({ iconProps: { icon: Search } });
  await expect
    .element(screen.getByTestId('icon'))
    .toHaveStyle({ width: '21px', color: 'rgb(128, 0, 128)' });
});

test('名称和装饰性状态可切换，显式 aria-hidden 保持优先', async () => {
  const screen = await render(IconHarness, { iconProps: { icon: Search, 'aria-label': '查找' } });
  await expect.element(screen.getByRole('img', { name: '查找' })).toBeVisible();
  await screen.rerender({ iconProps: { icon: Search, 'aria-labelledby': 'icon-description' } });
  await expect.element(screen.getByRole('img', { name: '说明图标' })).toBeVisible();
  await screen.rerender({ iconProps: { icon: Search } });
  await expect.element(screen.getByTestId('icon')).toHaveAttribute('aria-hidden', 'true');
  expect(screen.getByTestId('icon').element().getAttribute('role')).toBeNull();
  await screen.rerender({ iconProps: { icon: Search, 'aria-label': '查找', 'aria-hidden': true } });
  await expect.element(screen.getByTestId('icon')).toHaveAttribute('aria-hidden', 'true');
});

test('bx 连续更新保持类和规则稳定，卸载不遗留绑定', async () => {
  const bindingsBefore = cssStats().bindings;
  const screen = await render(IconHarness, { iconProps: { icon: Search } });
  const icon = screen.getByTestId('icon');
  const initial = cssStats();
  const initialClass = icon.element().getAttribute('class');
  for (const strokeWidth of [1, 1.25, 1.5, 2, 2.5]) {
    await screen.rerender({ iconProps: { icon: Search, strokeWidth } });
    await expect
      .poll(() => parseFloat(getComputedStyle(icon.element()).strokeWidth))
      .toBe(strokeWidth);
  }
  expect(cssStats().rules).toBe(initial.rules);
  expect(icon.element().getAttribute('class')).toBe(initialClass);
  await screen.rerender({ show: false });
  await expect.element(icon).not.toBeInTheDocument();
  await expect.poll(() => cssStats().bindings).toBe(bindingsBefore);
});

test('嵌套 SVG 节点和非正方形 viewBox 保持结构', async () => {
  const data: LucideIconData = {
    width: 48,
    height: 24,
    node: [['g', { transform: 'translate(1 0)' }, [['path', { d: 'M0 0L20 20' }]]]],
  };
  const screen = await render(IconHarness, { iconProps: { icon: data } });
  const icon = screen.getByTestId('icon');
  await expect.element(icon).toHaveAttribute('viewBox', '0 0 48 24');
  expect(icon.element().querySelector('g > path')?.namespaceURI).toBe('http://www.w3.org/2000/svg');
});

test('按钮拥有可访问名称和键盘交互，装饰图标不增加 Tab 停靠点', async () => {
  const screen = await render(IconButtonHarness, {});
  await page.getByRole('button', { name: '搜索', exact: true }).click();
  await expect.element(screen.getByRole('status', { name: '点击次数' })).toHaveTextContent('1');
  // 浏览器 provider 发送真实键盘事件。
  await userEvent.keyboard('{Enter}');
  await expect.element(screen.getByRole('status', { name: '点击次数' })).toHaveTextContent('2');
  await userEvent.tab();
  await expect.element(screen.getByRole('button', { name: '下一项' })).toHaveFocus();
});
