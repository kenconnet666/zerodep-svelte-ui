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
  UiCss,
} from '../src/lib/index.js';
import ProviderHarness from './fixtures/ProviderHarness.svelte';
import ProviderMutableHarness from './fixtures/ProviderMutableHarness.svelte';

afterEach(cleanup);

test('主题 raw 与下划线属性一致，原生 CSS 值保持原样', () => {
  let theme = lightTheme;
  const s = new UiCss(() => theme);
  expect(s.color.raw('_primary')).toBe(s.color._primary);
  expect(s.backgroundColor.raw('_surface')).toBe(s.backgroundColor._surface);
  expect(s.fontSize.raw('_md')).toBe(s.fontSize._md);
  theme = darkTheme;
  expect(s.color.raw('_primary')).toBe('color:#93c5fd;');
  expect(s.color._primary).toBe('color:#93c5fd;');
  expect(s.backgroundColor.raw('_surface')).toBe('background-color:#1f2937;');
  expect(s.color.raw('red')).toBe('color:red;');
  expect(s.color.inherit).toBe('color:inherit;');
  expect(s.color.raw('var(--_primary)')).toBe('color:var(--_primary);');
  expect(s.fontSize.raw('16px')).toBe('font-size:16px;');
  expect(s.fontSize.raw(0)).toBe('font-size:0;');
  expect(s.fontSize.raw('calc(1rem + 2px)')).toBe('font-size:calc(1rem + 2px);');
});

test('调用方的 Svelte 响应式对象字段更新传递到嵌套后代', async () => {
  const screen = await render(ProviderMutableHarness, {});
  await screen.getByRole('button', { name: '更新对象字段' }).click();
  await expect.element(screen.getByTestId('value')).toHaveStyle({ color: 'rgb(128, 0, 128)' });
  await expect.element(screen.getByTestId('value-raw')).toHaveStyle({ color: 'rgb(128, 0, 128)' });
  await expect.element(screen.getByTestId('value')).toHaveAttribute('data-primary', 'purple');
  await expect.element(screen.getByTestId('value-message')).toHaveTextContent('处理中');
  await expect.element(screen.getByTestId('value-time')).toHaveTextContent('07:00');
  expect(lightTheme.color.primary).toBe('#1d4ed8');
  expect(zhCNLanguage.messages.loading).toBe('加载中');
  expect(chinaLocale.timeZone).toBe('Asia/Shanghai');
});

test('同一 Provider 后代共享作者，嵌套作用域独立，配置响应父级更新', async () => {
  const authors: Css[] = [];
  const screen = await render(ProviderHarness, { onRead: (s) => authors.push(s) });
  expect(authors).toHaveLength(4);
  expect(new Set(authors).size).toBe(3);
  expect(authors[0]).toBe(authors[3]);
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
  await expect.element(screen.getByTestId('nested-value-raw')).toHaveStyle({
    color: 'rgb(147, 197, 253)',
    backgroundColor: 'rgb(31, 41, 55)',
    fontSize: '16px',
  });
  await expect.element(screen.getByTestId('nested-value-time')).toHaveTextContent('07:00');
  expect(authors).toHaveLength(4);
  expect(new Set(authors).size).toBe(3);
});

test('子级独立覆盖，父级替换不越界，undefined 恢复继承', async () => {
  const customLanguage = {
    ...zhCNLanguage,
    messages: { ...zhCNLanguage.messages, loading: '子级加载中' },
  };
  const screen = await render(ProviderHarness, {
    theme: darkTheme,
    lang: enUSLanguage,
    locale: usLocale,
    nestedTheme: lightTheme,
    nestedLang: customLanguage,
    nestedLocale: chinaLocale,
  });
  await expect.element(screen.getByTestId('nested')).toHaveAttribute('lang', 'zh-CN');
  await expect.element(screen.getByTestId('nested-value-message')).toHaveTextContent('子级加载中');
  await expect
    .element(screen.getByTestId('nested-value'))
    .toHaveTextContent('light / zh-CN / Asia/Shanghai');
  await expect
    .element(screen.getByTestId('sibling-value'))
    .toHaveTextContent('dark / en-US / America/New_York');
  await screen.rerender({ theme: lightTheme, lang: zhCNLanguage });
  await expect
    .element(screen.getByTestId('nested-value'))
    .toHaveTextContent('light / zh-CN / Asia/Shanghai');
  await expect.element(screen.getByTestId('nested-value-message')).toHaveTextContent('子级加载中');
  await screen.rerender({ nestedTheme: undefined, nestedLang: undefined, nestedLocale: undefined });
  await expect.element(screen.getByTestId('nested-value-message')).toHaveTextContent('加载中');
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
  class AppCss extends UiCss {}
  const authors: Css[] = [];
  const screen = await render(ProviderHarness, {
    theme,
    localCss: (readTheme) => new AppCss(readTheme),
    nestedLang: enUSLanguage,
    onRead: (s) => authors.push(s),
  });
  expect(authors.filter((s) => s instanceof AppCss)).toHaveLength(1);
  await expect
    .element(screen.getByTestId('nested-value-raw'))
    .toHaveStyle({ color: 'rgb(128, 0, 128)', fontSize: '21px' });
  await expect
    .element(screen.getByTestId('nested-value'))
    .toHaveStyle({ color: 'rgb(128, 0, 128)', fontSize: '21px' });
  await expect
    .element(screen.getByTestId('nested-value'))
    .toHaveAttribute('data-primary', 'purple');
  await expect
    .element(screen.getByTestId('nested-value'))
    .toHaveAttribute('data-font-size', '21px');
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
      .toHaveTextContent(theme.themeName + ' / zh-CN / Asia/Shanghai');
  }
  expect(cssStats().rules).toBe(rules);
  await screen.rerender({ showNested: false });
  await expect.element(screen.getByTestId('nested-value')).not.toBeInTheDocument();
  await expect
    .element(screen.getByTestId('sibling-value'))
    .toHaveStyle({ color: 'rgb(29, 78, 216)' });
});

test('主题传给自定义作者，创建函数向下继承，替换主题不重建作者', async () => {
  class AppCss extends UiCss {
    get brandBackground() {
      return this.backgroundColor._primary;
    }
  }
  const instances: AppCss[] = [];
  const screen = await render(ProviderHarness, {
    css: (readTheme) => {
      const s = new AppCss(readTheme);
      instances.push(s);
      return s;
    },
    nestedTheme: darkTheme,
  });
  expect(instances).toHaveLength(3);
  expect(instances[0].brandBackground).toBe('background-color:#1d4ed8;');
  expect(instances[1].brandBackground).toBe('background-color:#93c5fd;');
  const theme = { ...lightTheme, color: { ...lightTheme.color, primary: 'purple' } };
  await screen.rerender({ theme });
  expect(instances[0].theme).toBe(theme);
  expect(instances[0].brandBackground).toBe('background-color:purple;');
  expect(instances[1].brandBackground).toBe('background-color:#93c5fd;');
  expect(instances[2].brandBackground).toBe('background-color:purple;');
  await screen.rerender({ nestedTheme: undefined });
  expect(instances[1].brandBackground).toBe('background-color:purple;');
  expect(instances).toHaveLength(3);
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
