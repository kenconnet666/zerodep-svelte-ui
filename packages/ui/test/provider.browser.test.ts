import { afterEach, expect, test } from 'vitest';
import { cleanup, render } from 'vitest-browser-svelte';
import { Css, css, cssStats } from 'zerodep-css-svelte';
import {
  lightTheme,
  darkTheme,
  zhCNLanguage,
  enUSLanguage,
  chinaLocale,
  usLocale,
  type UiTheme,
} from '../src/lib/index.js';
import ProviderHarness from './fixtures/ProviderHarness.svelte';
import ProviderMutableHarness from './fixtures/ProviderMutableHarness.svelte';

afterEach(cleanup);

test('调用方的 Svelte 响应式对象字段更新传递到嵌套后代', async () => {
  const screen = await render(ProviderMutableHarness, {});
  await screen.getByRole('button', { name: '更新对象字段' }).click();
  await expect.element(screen.getByTestId('value')).toHaveStyle({ color: 'rgb(128, 0, 128)' });
  await expect.element(screen.getByTestId('value-message')).toHaveTextContent('处理中');
  await expect.element(screen.getByTestId('value-time')).toHaveTextContent('07:00');
  expect(lightTheme.color.primary).toBe('#1d4ed8');
  expect(zhCNLanguage.messages.loading).toBe('加载中');
  expect(chinaLocale.timeZone).toBe('Asia/Shanghai');
});

test('后代共享作者，主题、语言和地区对象分别响应父级更新', async () => {
  const authors: Css[] = [];
  const screen = await render(ProviderHarness, { onRead: (s) => authors.push(s) });
  expect(authors).toHaveLength(4);
  expect(new Set(authors).size).toBe(1);
  await expect.element(screen.getByTestId('root')).toHaveAttribute('lang', 'zh-CN');
  await expect
    .element(screen.getByTestId('nested-value'))
    .toHaveTextContent('light / zh-CN / Asia/Shanghai');
  await expect.element(screen.getByTestId('nested-value-message')).toHaveTextContent('加载中');
  await expect.element(screen.getByTestId('nested-value-time')).toHaveTextContent('20:00');

  await screen.rerender({ theme: darkTheme, lang: enUSLanguage });
  await expect
    .element(screen.getByTestId('nested-value'))
    .toHaveTextContent('dark / en-US / Asia/Shanghai');
  await expect.element(screen.getByTestId('nested-value-message')).toHaveTextContent('Loading');
  await expect
    .element(screen.getByTestId('nested-value'))
    .toHaveStyle({ color: 'rgb(147, 197, 253)' });
  await screen.rerender({ locale: usLocale });
  await expect.element(screen.getByTestId('nested-value-time')).toHaveTextContent('07:00');
  expect(new Set(authors).size).toBe(1);
});

test('子级独立覆盖，父级替换不越界，undefined 恢复继承', async () => {
  const customLanguage = { ...enUSLanguage, code: 'en-GB' };
  const screen = await render(ProviderHarness, {
    theme: darkTheme,
    lang: enUSLanguage,
    locale: usLocale,
    nestedTheme: lightTheme,
    nestedLang: customLanguage,
    nestedLocale: chinaLocale,
  });
  await expect.element(screen.getByTestId('nested')).toHaveAttribute('lang', 'en-GB');
  await expect
    .element(screen.getByTestId('nested-value'))
    .toHaveTextContent('light / en-GB / Asia/Shanghai');
  await expect
    .element(screen.getByTestId('sibling-value'))
    .toHaveTextContent('dark / en-US / America/New_York');
  await screen.rerender({ theme: lightTheme, lang: zhCNLanguage });
  await expect
    .element(screen.getByTestId('nested-value'))
    .toHaveTextContent('light / en-GB / Asia/Shanghai');
  await screen.rerender({ nestedTheme: undefined, nestedLang: undefined, nestedLocale: undefined });
  await expect
    .element(screen.getByTestId('nested-value'))
    .toHaveTextContent('light / zh-CN / America/New_York');
});

test('自定义主题对象直接驱动后代，切换语言和作者不丢失主题', async () => {
  const theme: UiTheme = {
    ...lightTheme,
    color: { ...lightTheme.color, primary: 'purple' },
    fontSize: { ...lightTheme.fontSize, md: '21px' },
  };
  const author = new Css();
  const authors: Css[] = [];
  const screen = await render(ProviderHarness, {
    theme,
    localCss: author,
    nestedLang: enUSLanguage,
    onRead: (s) => authors.push(s),
  });
  expect(authors.filter((s) => s === author)).toHaveLength(1);
  await expect
    .element(screen.getByTestId('nested-value'))
    .toHaveStyle({ color: 'rgb(128, 0, 128)', fontSize: '21px' });
  await expect
    .element(screen.getByTestId('local-value'))
    .toHaveStyle({ color: 'rgb(128, 0, 128)' });
  expect(
    getComputedStyle(screen.getByTestId('root').element()).getPropertyValue('--ui-color-primary'),
  ).toBe('');
  await screen.rerender({ nestedTheme: darkTheme });
  await expect
    .element(screen.getByTestId('nested-value'))
    .toHaveStyle({ color: 'rgb(147, 197, 253)' });
  await expect
    .element(screen.getByTestId('sibling-value'))
    .toHaveStyle({ color: 'rgb(128, 0, 128)' });
  expect(lightTheme.color.primary).toBe('#1d4ed8');
});

test('已使用过的主题组合复用规则，卸载子树不影响兄弟', async () => {
  const screen = await render(ProviderHarness, {});
  await screen.rerender({ theme: darkTheme });
  await screen.rerender({ theme: lightTheme });
  const rules = cssStats().rules;
  for (const theme of [darkTheme, lightTheme, darkTheme, lightTheme]) {
    await screen.rerender({ theme });
    await expect
      .element(screen.getByTestId('root-value'))
      .toHaveTextContent(theme.colorScheme + ' / zh-CN / Asia/Shanghai');
  }
  expect(cssStats().rules).toBe(rules);
  await screen.rerender({ showNested: false });
  await expect.element(screen.getByTestId('nested-value')).not.toBeInTheDocument();
  await expect
    .element(screen.getByTestId('sibling-value'))
    .toHaveStyle({ color: 'rgb(29, 78, 216)' });
});

test('外部 css 先登记也能覆盖容器默认声明，合成一个类并支持撤销', async () => {
  const s = new Css();
  const override = css(s.color.green);
  const screen = await render(ProviderHarness, { className: override });
  const root = screen.getByTestId('root');
  expect(root.element().classList).toHaveLength(1);
  await expect.element(root).toHaveStyle({ color: 'rgb(0, 128, 0)' });
  await screen.rerender({ theme: darkTheme });
  await expect.element(root).toHaveStyle({ color: 'rgb(0, 128, 0)' });
  expect(root.element().classList).toHaveLength(1);
  await screen.rerender({ className: undefined });
  await expect.element(root).toHaveStyle({ color: 'rgb(249, 250, 251)' });
});
