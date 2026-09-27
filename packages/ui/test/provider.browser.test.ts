import { afterEach, expect, test } from 'vitest';
import { cleanup, render } from 'vitest-browser-svelte';
import { cssStats } from 'zerodep-css-svelte';
import { UiCss, UiColorCss } from '../src/lib/index.js';
import ProviderHarness from './fixtures/ProviderHarness.svelte';

afterEach(cleanup);

test('后代共享作者，配置随父级更新，覆盖撤销后恢复继承', async () => {
  const authors: UiCss[] = [];
  const screen = await render(ProviderHarness, { onRead: (s) => authors.push(s) });
  expect(authors).toHaveLength(4);
  expect(new Set(authors).size).toBe(1);
  await expect.element(screen.getByTestId('root')).toHaveAttribute('lang', 'zh-CN');
  await expect.element(screen.getByTestId('root')).toHaveClass('custom', 'active');
  await expect.element(screen.getByTestId('nested-value')).toHaveTextContent('light / zh-CN');

  await screen.rerender({ theme: 'dark', locale: 'en-US' });
  await expect.element(screen.getByTestId('nested-value')).toHaveTextContent('dark / en-US');
  await expect.element(screen.getByTestId('nested')).toHaveAttribute('lang', 'en-US');
  await expect
    .element(screen.getByTestId('root-value'))
    .toHaveStyle({ color: 'rgb(147, 197, 253)' });

  await screen.rerender({ nestedTheme: 'light', nestedLocale: 'ja-JP' });
  await expect.element(screen.getByTestId('nested-value')).toHaveTextContent('light / ja-JP');
  await expect.element(screen.getByTestId('sibling-value')).toHaveTextContent('dark / en-US');
  await expect
    .element(screen.getByTestId('nested-value'))
    .toHaveStyle({ color: 'rgb(29, 78, 216)' });

  await screen.rerender({ nestedTheme: undefined, nestedLocale: undefined });
  await expect.element(screen.getByTestId('nested-value')).toHaveTextContent('dark / en-US');
  expect(new Set(authors).size).toBe(1);
});

test('仅覆盖语言保留父变量，主题覆盖及自定义作者只影响对应子树', async () => {
  class CustomColor extends UiColorCss {
    override readonly _primary = this.raw('purple');
  }
  class CustomCss extends UiCss {
    override readonly color = new CustomColor();
  }
  const custom = new CustomCss();
  const authors: UiCss[] = [];
  const screen = await render(ProviderHarness, {
    style: '--ui-color-primary:rgb(0, 128, 0)',
    nestedLocale: 'en-US',
    localCss: custom,
    onRead: (s) => authors.push(s),
  });
  expect(authors.filter((s) => s === custom)).toHaveLength(1);
  await expect.element(screen.getByTestId('nested-value')).toHaveStyle({ color: 'rgb(0, 128, 0)' });
  await expect
    .element(screen.getByTestId('local-value'))
    .toHaveStyle({ color: 'rgb(128, 0, 128)' });
  await screen.rerender({ nestedTheme: 'dark' });
  await expect
    .element(screen.getByTestId('nested-value'))
    .toHaveStyle({ color: 'rgb(147, 197, 253)' });
  await expect
    .element(screen.getByTestId('sibling-value'))
    .toHaveStyle({ color: 'rgb(0, 128, 0)' });
});

test('主题反复切换不累加规则，内层卸载保留兄弟样式', async () => {
  const screen = await render(ProviderHarness, {});
  const rules = cssStats().rules;
  for (const theme of ['dark', 'light', 'dark', 'light'] as const) {
    await screen.rerender({ theme });
    await expect.element(screen.getByTestId('root-value')).toHaveTextContent(`${theme} / zh-CN`);
  }
  expect(cssStats().rules).toBe(rules);
  await screen.rerender({ showNested: false });
  await expect.element(screen.getByTestId('nested-value')).not.toBeInTheDocument();
  await expect
    .element(screen.getByTestId('sibling-value'))
    .toHaveStyle({ color: 'rgb(29, 78, 216)' });
});
