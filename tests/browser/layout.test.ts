import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Grid 自适应列与 Card 内容在桌面和窄屏均不溢出', async ({ page }, testInfo) => {
  await page.goto('/layout/');
  await expect(page.locator('html')).toHaveAttribute('data-hydrated', 'true');
  const cards = page.locator('[data-layout-card]');
  const first = (await cards.nth(0).boundingBox())!;
  const second = (await cards.nth(1).boundingBox())!;
  expect(second.y).toBeCloseTo(first.y, 1);
  expect(second.x).toBeGreaterThan(first.x);
  await page.screenshot({ path: testInfo.outputPath('layout-desktop.png'), fullPage: true });
  await page.setViewportSize({ width: 360, height: 780 });
  await expect
    .poll(async () => (await cards.nth(1).boundingBox())!.y)
    .toBeGreaterThan((await cards.nth(0).boundingBox())!.y);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('combobox', { name: '列布局' }).selectOption('repeat(2, minmax(0, 1fr))');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('combobox', { name: '列布局' }).selectOption('minmax(0, 1fr)');
  await page.getByRole('checkbox', { name: '深色主题' }).check();
  await expect(cards.first()).toHaveCSS('background-color', 'rgb(17, 24, 39)');
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(axe.violations).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath('layout-dark-mobile.png'), fullPage: true });
});

test('Card 内部操作保持键盘顺序，分隔符和区域随内容切换', async ({ page }) => {
  await page.goto('/layout/');
  await expect(page.locator('html')).toHaveAttribute('data-hydrated', 'true');
  const card = page.locator('[data-layout-card]').first();
  await expect(card.locator(':scope > [aria-hidden="true"]')).toHaveCount(2);
  await expect(page.getByRole('separator')).toHaveCount(2);
  await page.getByRole('combobox', { name: '列布局' }).focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: '重置计数' })).toBeFocused();
  await page.keyboard.press('Tab');
  const action = page.locator('[data-card-action]');
  await expect(action).toBeFocused();
  await expect(action).toHaveCSS('outline-style', 'solid');
  await expect(card).toHaveCSS('overflow', 'visible');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status', { name: '卡片操作次数' })).toHaveText('1');
  await page.getByRole('button', { name: '重置计数' }).click();
  await expect(page.getByRole('status', { name: '卡片操作次数' })).toHaveText('0');
  await page.getByRole('checkbox', { name: '卡片分隔线' }).uncheck();
  await expect(card.locator(':scope > [aria-hidden="true"]')).toHaveCount(0);
});

test('布局无 JavaScript 首屏保留内容和标题语义', async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 360, height: 780 },
  });
  try {
    const page = await context.newPage();
    await page.goto('/layout/');
    await expect(page.getByRole('heading', { level: 2, name: '交互预览' })).toBeVisible();
    await expect(page.locator('[data-layout-card]')).toHaveCount(3);
    await expect(page.getByRole('separator', { name: '竖向分隔' })).toHaveAttribute(
      'aria-orientation',
      'vertical',
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  } finally {
    await context.close();
  }
});
