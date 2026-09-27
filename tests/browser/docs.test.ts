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
