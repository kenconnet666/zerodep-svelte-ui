import { afterEach, expect, test } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { cleanup, render } from 'vitest-browser-svelte';
import { Search, Check } from '@lucide/icons';
import type { LucideIconData } from '@lucide/icons';
import { Css, css, cssStats } from 'zerodep-css-svelte';
import { lightTheme, darkTheme, UiCss } from '../src/lib/index.js';
import IconHarness from './fixtures/IconHarness.svelte';
import IconButtonHarness from './fixtures/IconButtonHarness.svelte';
import IconThemeHarness from './fixtures/IconThemeHarness.svelte';
import IconTokensMutable from './fixtures/IconTokensMutable.svelte';

afterEach(cleanup);

test('组件 token 按外层、内层和实例覆盖，undefined 恢复继承且不影响兄弟', async () => {
  const screen = await render(IconThemeHarness, {
    components: { Icon: { _sizeMd: '20px', _colorPrimary: 'purple', _strokeWidth: 3 } },
    nestedComponents: { Icon: { _sizeMd: '24px', _verticalAlign: '0px' } },
    tokens: { _sizeMd: '28px', _colorPrimary: undefined, _strokeWidth: 0 },
  });
  await expect
    .element(screen.getByTestId('root-icon'))
    .toHaveStyle({ width: '20px', color: 'rgb(128, 0, 128)' });
  const nested = screen.getByTestId('nested-icon');
  await expect.element(nested).toHaveStyle({
    width: '28px',
    color: 'rgb(128, 0, 128)',
    verticalAlign: '0px',
    strokeWidth: '0px',
  });
  await screen.rerender({ strokeWidth: 1.5 });
  await expect.element(nested).toHaveStyle({ strokeWidth: '1.5px' });
  await screen.rerender({ tokens: undefined, strokeWidth: undefined });
  await expect.element(nested).toHaveStyle({ width: '24px', strokeWidth: '3px' });
  await screen.rerender({ nestedComponents: { Icon: { _sizeMd: undefined } } });
  await expect.element(nested).toHaveStyle({ width: '20px' });
  await expect.element(screen.getByTestId('sibling-icon')).toHaveStyle({ width: '20px' });
  await screen.rerender({ components: undefined });
  await expect.element(nested).toHaveStyle({ width: '16px', color: 'rgb(29, 78, 216)' });
});

test('内层系统主题重新派生默认 token，只继承父级显式覆盖', async () => {
  const screen = await render(IconThemeHarness, {
    theme: lightTheme,
    nestedTheme: darkTheme,
    components: { Icon: { _sizeMd: '20px' } },
  });
  await expect.element(screen.getByTestId('root-icon')).toHaveStyle({ color: 'rgb(29, 78, 216)' });
  const nested = screen.getByTestId('nested-icon');
  await expect.element(nested).toHaveStyle({ width: '20px', color: 'rgb(147, 197, 253)' });
  await screen.rerender({
    theme: { ...lightTheme, color: { ...lightTheme.color, _primary: 'purple' } },
  });
  await expect.element(nested).toHaveStyle({ color: 'rgb(147, 197, 253)' });
  await screen.rerender({ nestedTheme: undefined });
  await expect.element(nested).toHaveStyle({ color: 'rgb(128, 0, 128)' });
});

test('响应式组件覆盖和实例 token 的字段修改更新图标', async () => {
  const screen = await render(IconTokensMutable, {});
  await screen.getByRole('button', { name: '更新图标 token' }).click();
  await expect
    .element(screen.getByTestId('mutable-icon'))
    .toHaveStyle({ width: '26px', color: 'rgb(0, 128, 0)' });
});

test('图标真实渲染为 SVG，切换数据和语义外观时更新', async () => {
  const source = JSON.stringify(Search);
  const screen = await render(IconHarness, { iconProps: { icon: Search, color: '_primary' } });
  const icon = screen.getByTestId('icon');
  await expect.element(icon).toHaveStyle({ width: '16px', color: 'rgb(29, 78, 216)' });
  const element = icon.element();
  expect(element.querySelector('circle')?.namespaceURI).toBe('http://www.w3.org/2000/svg');
  expect(element.querySelector('[key]')).toBeNull();
  await expect.element(icon).toHaveAttribute('aria-hidden', 'true');
  await expect.element(icon).toHaveAttribute('focusable', 'false');

  await screen.rerender({
    iconProps: { icon: Check, size: '_lg', color: '_primary' },
    theme: darkTheme,
  });
  await expect.element(icon).toHaveStyle({ width: '24px', color: 'rgb(147, 197, 253)' });
  expect(element.querySelector('circle')).toBeNull();
  expect(JSON.stringify(Search)).toBe(source);
});

test('继承主题对象、外部 class 和文字颜色，不在 Icon 创建作者', async () => {
  const author = new Css();
  const theme = { ...lightTheme, fontSize: { ...lightTheme.fontSize, _md: '21px' } };
  const override = css(author.width.px(30), author.height.px(30), author.color.green);
  const screen = await render(IconHarness, {
    css: (readTheme) => new UiCss(readTheme),
    theme,
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
    iconProps: { icon: Search, size: '_sm', color: '_danger', class: override },
    theme: darkTheme,
  });
  await expect
    .element(screen.getByTestId('icon'))
    .toHaveStyle({ width: '30px', color: 'rgb(0, 128, 0)' });
  await screen.rerender({ iconProps: { icon: Search }, theme });
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
  // 由 Playwright 在同一命令内聚焦 iframe 中的目标并发送真实按键，避免只设置 DOM 焦点。
  await userEvent.type(screen.getByRole('button', { name: '搜索', exact: true }), '{Enter}');
  await expect.element(screen.getByRole('status', { name: '点击次数' })).toHaveTextContent('2');
  await userEvent.tab();
  await expect.element(screen.getByRole('button', { name: '下一项' })).toHaveFocus();
});
