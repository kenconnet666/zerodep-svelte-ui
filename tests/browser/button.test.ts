import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Button 指针触发 Ripple，Loading 保持尺寸，减少动效停止圆环', async ({ page }, testInfo) => {
  await page.goto('/button/');
  await expect(page.locator('html')).toHaveAttribute('data-hydrated', 'true');
  const button = page.locator('[data-button-preview]');
  const ripple = button.locator(':scope > span:last-child');
  const box = (await button.boundingBox())!;
  await page.screenshot({ path: testInfo.outputPath('button-sizes.png'), fullPage: true });
  await page.mouse.move(box.x + 8, box.y + 8);
  await page.mouse.down();
  await expect(ripple.locator(':scope > span')).toHaveCount(1);
  await page.mouse.up();
  await expect(page.getByRole('status', { name: '操作次数' })).toHaveText('1');
  await expect(ripple.locator(':scope > span')).toHaveCount(0);
  await page.getByRole('checkbox', { name: '加载中', exact: true }).check();
  await expect(button).toHaveAttribute('aria-busy', 'true');
  expect((await button.boundingBox())!.width).toBeCloseTo(box.width, 3);
  expect((await button.boundingBox())!.height).toBeCloseTo(box.height, 3);
  await button.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Space');
  await expect(button).toBeFocused();
  await expect(page.getByRole('status', { name: '操作次数' })).toHaveText('1');
  const circle = page.getByRole('status', { name: '加载中' }).locator('span');
  await expect(circle).toHaveCSS('animation-duration', '0.75s');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(circle).toHaveCSS('animation-name', 'none');
});

test('Button 文档窄屏无溢出并通过基础可访问性检查', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto('/button/');
  await expect(page.locator('html')).toHaveAttribute('data-hydrated', 'true');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const loading of [false, true]) {
    await page.getByRole('checkbox', { name: '加载中', exact: true }).setChecked(loading);
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(result.violations).toEqual([]);
  }
});
