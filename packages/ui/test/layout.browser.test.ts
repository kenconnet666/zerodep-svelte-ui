import { afterEach, expect, test } from 'vitest';
import { cleanup, render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { css, Css } from 'zerodep-css-svelte';
import { darkTheme, lightTheme } from '../src/lib/index.js';
import LayoutHarness from './fixtures/LayoutHarness.svelte';

afterEach(cleanup);

test('Container 宽度包含内边距并居中，Grid 分列且长标题不撑宽', async () => {
  const screen = await render(LayoutHarness);
  const container = screen.getByTestId('container').element();
  const grid = screen.getByTestId('grid').element();
  const rect = container.getBoundingClientRect();
  expect(rect.width).toBe(400);
  const parent = container.parentElement!.getBoundingClientRect();
  expect(rect.left - parent.left).toBeCloseTo((parent.width - rect.width) / 2);
  expect(grid.getBoundingClientRect().width).toBe(368);
  expect(screen.getByTestId('long-card').element().getBoundingClientRect().width).toBe(176);
  expect(grid.scrollWidth).toBe(grid.clientWidth);
  await screen.rerender({
    container: { maxWidth: '250px', paddingInline: 0 },
    grid: { columns: 'minmax(0, 1fr)' },
  });
  expect(container.getBoundingClientRect().width).toBe(250);
  expect(grid.getBoundingClientRect().width).toBe(250);
  expect(grid.scrollWidth).toBe(grid.clientWidth);
});

test('Flex 改方向、间距和换行，外部 class 最后组合且不额外修改子项字号', async () => {
  const screen = await render(LayoutHarness);
  const first = screen.getByTestId('first').element();
  const second = screen.getByTestId('second').element();
  expect(second.getBoundingClientRect().left - first.getBoundingClientRect().right).toBeCloseTo(12);
  const fontSize = getComputedStyle(first).fontSize;
  await screen.rerender({
    flex: { direction: 'column', gap: 0, align: 'flex-start', wrap: 'wrap' },
  });
  expect(second.getBoundingClientRect().top).toBe(first.getBoundingClientRect().bottom);
  expect(getComputedStyle(first).fontSize).toBe(fontSize);
  const s = new Css();
  await screen.rerender({ flex: { gap: '_md', class: css(s.gap.px(7)) } });
  await expect.element(screen.getByTestId('flex')).toHaveStyle({ gap: '7px' });
  expect(screen.getByTestId('flex').element().classList.length).toBe(1);
});

test('Card 按需渲染区域，操作保留键盘行为，装饰分隔线不增加语义噪声', async () => {
  const screen = await render(LayoutHarness);
  const card = screen.getByTestId('card').element();
  expect(card.children.length).toBe(5);
  expect(screen.getByTestId('header-only').element().children.length).toBe(1);
  expect(getComputedStyle(card).overflow).toBe('visible');
  expect(card.hasAttribute('tabindex')).toBe(false);
  expect(card.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThanOrEqual(2);
  expect(card.querySelectorAll('[role="separator"]').length).toBe(0);
  await screen.getByRole('button', { name: '头部操作' }).click();
  await userEvent.type(screen.getByRole('button', { name: '正文操作' }), '{Enter}');
  await userEvent.type(screen.getByRole('button', { name: '底部操作' }), ' ');
  await expect.element(screen.getByRole('status', { name: '操作次数' })).toHaveTextContent('3');
});

test('Card 主题响应及区域定制优先，内边距不在外框重复叠加', async () => {
  const s = new Css();
  const screen = await render(LayoutHarness, {
    card: {
      padding: '_xl',
      shadow: '_sm',
      radius: '_sm',
      slotProps: {
        title: { as: 'h2', size: '18px' },
        body: { class: css(s.padding.px(9)), style: 'width:100%', 'data-testid': 'body' },
        footer: { justify: 'flex-end', 'data-testid': 'footer' },
      },
    },
  });
  const card = screen.getByTestId('card');
  await expect.element(card).toHaveStyle({ padding: '0px', borderRadius: '4px' });
  await expect.element(screen.getByTestId('body')).toHaveStyle({ padding: '9px' });
  expect(screen.getByTestId('body').element().getBoundingClientRect().width).toBe(
    card.element().clientWidth,
  );
  await expect
    .element(screen.getByTestId('footer'))
    .toHaveStyle({ justifyContent: 'flex-end', padding: '24px' });
  await expect
    .element(screen.getByRole('heading', { name: '预览' }))
    .toHaveStyle({ fontSize: '18px', margin: '0px' });
  await screen.rerender({ theme: darkTheme });
  await expect
    .element(card)
    .toHaveStyle({ backgroundColor: 'rgb(17, 24, 39)', color: 'rgb(249, 250, 251)' });
  await screen.rerender({ theme: { ...lightTheme, space: { ...lightTheme.space, _xl: '30px' } } });
  await expect.element(screen.getByTestId('footer')).toHaveStyle({ padding: '30px' });
  await expect.element(screen.getByTestId('body')).toHaveStyle({ padding: '9px' });
});

test('Divider 水平/垂直尺寸与语义正确，支持粗细覆盖和纯装饰模式', async () => {
  const screen = await render(LayoutHarness);
  const horizontal = screen.getByTestId('horizontal');
  const vertical = screen.getByTestId('vertical');
  await expect.element(horizontal).toHaveAttribute('aria-orientation', 'horizontal');
  await expect.element(vertical).toHaveAttribute('aria-orientation', 'vertical');
  expect(horizontal.element().getBoundingClientRect().height).toBe(1);
  expect(vertical.element().getBoundingClientRect().width).toBe(1);
  expect(vertical.element().getBoundingClientRect().height).toBe(40);
  await screen.rerender({ divider: { thickness: '3px', decorative: true } });
  expect(horizontal.element().getBoundingClientRect().height).toBe(3);
  await expect.element(horizontal).toHaveAttribute('aria-hidden', 'true');
  expect(horizontal.element().hasAttribute('role')).toBe(false);
});
