import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('首页水合后可导航，页面没有未捕获异常', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page).toHaveTitle(/zerodep svelte ui/);
  await expect(page.locator('html')).toHaveAttribute('data-hydrated', 'true');
  await expect(page.getByRole('link', { name: '了解项目 →' })).toHaveCSS(
    'background-color',
    'rgb(37, 85, 199)',
  );
  // 文档标记应在客户端导航后保留，防止只验证到静态 HTML 的整页跳转。
  await page.evaluate(() =>
    document.documentElement.setAttribute('data-navigation-probe', 'ready'),
  );
  await page.getByRole('navigation').getByRole('link', { name: '开始使用' }).click();
  await expect(page).toHaveURL(/\/guide\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('先把基础做好。');
  await expect(page.locator('html')).toHaveAttribute('data-navigation-probe', 'ready');
  await expect(
    page.getByRole('navigation').getByRole('link', { name: '开始使用' }),
  ).toHaveAttribute('aria-current', 'page');
  expect(errors).toEqual([]);
});

test('直接访问指南和窄屏布局没有横向溢出', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto('/guide/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('首页与指南满足基础无障碍规则', async ({ page }) => {
  for (const path of ['/', '/guide/']) {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  }
});

test('键盘可跳过导航进入正文', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: '跳到正文' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
});

test('Provider 文档的配置继承、主题覆盖和恢复', async ({ page }) => {
  await page.goto('/provider/');
  await expect(page.locator('html')).toHaveAttribute('data-hydrated', 'true');
  await page.getByRole('combobox', { name: '父主题', exact: true }).selectOption('dark');
  await page.getByRole('combobox', { name: '语言', exact: true }).selectOption('en-US');
  await expect(page.locator('[data-provider-value="子级"]')).toHaveText('子级：dark / en-US');
  await expect(page.locator('[data-provider-keyword="子级"]')).toHaveText('主色实际值：#93c5fd');
  await expect(page.locator('[data-provider-language="子级"]')).toHaveText('Loading');
  await expect(page.locator('[data-provider-time="子级"]')).toHaveText('20:00');
  await page.getByRole('combobox', { name: '地区与时区', exact: true }).selectOption('us');
  await expect(page.locator('[data-provider-time="子级"]')).toHaveText('07:00');
  await expect(page.locator('[data-provider-value="子级"]')).toHaveCSS(
    'color',
    'rgb(147, 197, 253)',
  );
  await page.getByRole('combobox', { name: '子主题', exact: true }).selectOption('light');
  await expect(page.locator('[data-provider-value="子级"]')).toHaveText('子级：light / en-US');
  await expect(page.locator('[data-provider-keyword="子级"]')).toHaveText('主色实际值：#1d4ed8');
  await expect(page.locator('[data-provider-keyword="兄弟"]')).toHaveText('主色实际值：#93c5fd');
  await expect(page.locator('[data-provider-value="兄弟"]')).toHaveText('兄弟：dark / en-US');
  await page.getByRole('combobox', { name: '子主题', exact: true }).selectOption('inherit');
  await expect(page.locator('[data-provider-value="子级"]')).toHaveText('子级：dark / en-US');
  await page.getByRole('combobox', { name: '父主题', exact: true }).selectOption('brand');
  await expect(page.locator('[data-provider-value="子级"]')).toHaveCSS(
    'color',
    'rgb(126, 34, 206)',
  );
  await page.setViewportSize({ width: 360, height: 780 });
  await expect
    .poll(() =>
      page
        .locator('.prose pre')
        .evaluateAll((blocks) => blocks.every((block) => block.scrollWidth <= block.clientWidth)),
    )
    .toBe(true);
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});

test('Provider 的配置与主题在禁用 JavaScript 的首屏可用', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto('/provider/');
    await expect(page.locator('[data-provider-value="子级"]')).toHaveText('子级：light / zh-CN');
    await expect(page.locator('[data-provider-value="子级"]')).toHaveCSS(
      'color',
      'rgb(29, 78, 216)',
    );
  } finally {
    await context.close();
  }
});

test('Icon 文档通过真实组件演示语义外观、主题、描边与键盘行为', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/icon/');
  await expect(page.locator('html')).toHaveAttribute('data-hydrated', 'true');
  const custom = page.locator('[data-icon-custom]');
  await expect(custom).toHaveCSS('width', '16px');
  await page.getByRole('checkbox', { name: '使用自定义外观' }).check();
  await expect(custom).toHaveCSS('width', '28px');
  await expect(custom).toHaveCSS('color', 'rgb(126, 34, 206)');
  await expect(custom).toHaveCSS('stroke-width', '3px');
  await expect(custom).toHaveCSS('vertical-align', 'middle');
  await page.getByRole('checkbox', { name: '使用自定义外观' }).uncheck();
  await expect(custom).toHaveCSS('width', '16px');
  await expect(custom).toHaveCSS('stroke-width', '2px');
  const icon = page.getByRole('img', { name: '预览图标' });
  await expect(icon).toHaveCSS('width', '16px');
  expect(await icon.locator('circle').evaluate((el) => el.namespaceURI)).toBe(
    'http://www.w3.org/2000/svg',
  );
  await page.getByRole('combobox', { name: '尺寸', exact: true }).selectOption('_lg');
  await page.getByRole('combobox', { name: '颜色', exact: true }).selectOption('_success');
  await page.getByRole('combobox', { name: '主题', exact: true }).selectOption('dark');
  await expect(icon).toHaveCSS('width', '20px');
  await expect(icon).toHaveCSS('color', 'rgb(134, 239, 172)');
  await page.getByRole('slider', { name: '描边', exact: true }).press('ArrowRight');
  await expect
    .poll(() => icon.evaluate((el) => parseFloat(getComputedStyle(el).strokeWidth)))
    .toBe(2.25);
  await page.getByRole('combobox', { name: '图标', exact: true }).selectOption('Check');
  await expect(icon.locator('circle')).toHaveCount(0);
  await page.getByRole('button', { name: '搜索', exact: true }).press('Enter');
  await expect(page.getByRole('status', { name: '搜索次数' })).toHaveText('1');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
  await page.setViewportSize({ width: 360, height: 780 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('Icon 无 JavaScript 首屏包含可访问 SVG 和正确初始样式', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto('/icon/');
    const icon = page.getByRole('img', { name: '预览图标' });
    await expect(icon).toBeVisible();
    await expect(icon).toHaveCSS('width', '16px');
    await expect(icon).toHaveCSS('color', 'rgb(29, 78, 216)');
    expect(await icon.locator('path').evaluate((el) => el.namespaceURI)).toBe(
      'http://www.w3.org/2000/svg',
    );
  } finally {
    await context.close();
  }
});
