import { afterEach, expect, test } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { cleanup, render } from 'vitest-browser-svelte';
import { Search, Check } from '@lucide/icons';
import type { LucideIconData } from '@lucide/icons';
import { Css, css } from 'zerodep-css-svelte';
import { lightTheme, darkTheme, UiCss } from '../src/lib/index.js';
import IconHarness from './fixtures/IconHarness.svelte';
import LucideHarness from './fixtures/LucideHarness.svelte';
import IconButtonHarness from './fixtures/IconButtonHarness.svelte';
import IconThemeHarness from './fixtures/IconThemeHarness.svelte';
import IconPropsMutable from './fixtures/IconPropsMutable.svelte';

afterEach(cleanup);

test('lucide 字面量按需渲染并随条件切换，名称不透传到 SVG', async () => {
  const screen = await render(LucideHarness, {});
  const icon = screen.getByTestId('lucide-icon');
  await expect.element(screen.getByRole('img', { name: '搜索' })).toBeVisible();
  expect(icon.element().querySelector('circle')).not.toBeNull();
  expect(icon.element().hasAttribute('lucide')).toBe(false);
  await screen.rerender({ plus: true });
  await expect.element(screen.getByRole('img', { name: '添加' })).toBeVisible();
  expect(icon.element().querySelector('circle')).toBeNull();
});

test('原始 CSS 输入直接生效，undefined 恢复 Svelte 默认值', async () => {
  const screen = await render(IconHarness, {
    iconProps: {
      icon: Search,
      size: '28px',
      color: '#7e22ce',
      strokeWidth: '3px',
      verticalAlign: 'middle',
    },
    style: 'color:rgb(0, 128, 0)',
  });
  const icon = screen.getByTestId('icon');
  await expect.element(icon).toHaveStyle({
    width: '28px',
    height: '28px',
    color: 'rgb(126, 34, 206)',
    strokeWidth: '3px',
    verticalAlign: 'middle',
  });
  await screen.rerender({
    iconProps: {
      icon: Search,
      size: '_xl',
      color: '_onPrimary',
      strokeWidth: 0,
      verticalAlign: '0px',
    },
  });
  await expect.element(icon).toHaveStyle({
    width: '24px',
    color: 'rgb(255, 255, 255)',
    strokeWidth: '0px',
    verticalAlign: '0px',
  });
  await screen.rerender({
    iconProps: {
      icon: Search,
      size: undefined,
      color: undefined,
      strokeWidth: undefined,
      verticalAlign: undefined,
    },
  });
  await expect.element(icon).toHaveStyle({
    width: '16px',
    color: 'rgb(0, 128, 0)',
    strokeWidth: '2px',
    verticalAlign: '-2px',
  });
});

test('CSS 继承关键字直接作用于图标属性，描边可在关键字和普通值之间切换', async () => {
  const screen = await render(IconHarness, {
    style: 'font-size:30px;color:purple;stroke-width:5px;vertical-align:middle',
    iconProps: {
      icon: Search,
      size: 'inherit',
      color: 'currentColor',
      strokeWidth: 'inherit',
      verticalAlign: 'inherit',
    },
  });
  const icon = screen.getByTestId('icon');
  await expect.element(icon).toHaveStyle({
    width: '30px',
    color: 'rgb(128, 0, 128)',
    strokeWidth: '5px',
    verticalAlign: 'middle',
  });
  for (const [strokeWidth, expected] of [
    ['2.5px', '2.5px'],
    ['initial', '1px'],
    ['unset', '5px'],
    [0, '0px'],
    ['inherit', '5px'],
  ] as const) {
    await screen.rerender({ iconProps: { icon: Search, strokeWidth } });
    await expect.element(icon).toHaveStyle({ strokeWidth: expected });
  }
});

test('嵌套图标直接使用本级系统主题，撤销内层主题后恢复继承', async () => {
  const screen = await render(IconThemeHarness, { theme: lightTheme, nestedTheme: darkTheme });
  await expect.element(screen.getByTestId('root-icon')).toHaveStyle({ color: 'rgb(29, 78, 216)' });
  const nested = screen.getByTestId('nested-icon');
  await expect.element(nested).toHaveStyle({ width: '16px', color: 'rgb(147, 197, 253)' });
  await screen.rerender({
    theme: {
      ...lightTheme,
      color: { ...lightTheme.color, _primary: 'purple' },
      fontSize: { ...lightTheme.fontSize, _md: '22px' },
    },
  });
  await expect.element(nested).toHaveStyle({ width: '16px', color: 'rgb(147, 197, 253)' });
  await expect
    .element(screen.getByTestId('sibling-icon'))
    .toHaveStyle({ width: '22px', color: 'rgb(128, 0, 128)' });
  await screen.rerender({ nestedTheme: undefined });
  await expect.element(nested).toHaveStyle({ width: '22px', color: 'rgb(128, 0, 128)' });
});

test('系统主题和直接 props 的响应式字段修改更新图标', async () => {
  const screen = await render(IconPropsMutable, {});
  await screen.getByRole('button', { name: '更新图标外观' }).click();
  await expect.element(screen.getByTestId('mutable-icon')).toHaveStyle({
    width: '26px',
    color: 'rgb(0, 128, 0)',
    strokeWidth: '3px',
    verticalAlign: '0px',
  });
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
  await expect.element(icon).toHaveStyle({ width: '20px', color: 'rgb(147, 197, 253)' });
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
