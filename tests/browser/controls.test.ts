import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('表单控件水合后支持指针、键盘、重置和禁用字段组', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/controls/');
  await expect(page.locator('html')).toHaveAttribute('data-hydrated', 'true');
  const checkbox = page.getByRole('checkbox', { name: '接受条款' });
  const select = page.getByRole('combobox', { name: '选项', exact: true });
  const slider = page.getByRole('slider', { name: '时长' });
  await expect(checkbox).toBeChecked();
  await expect(select).toHaveValue('b');
  await expect(slider).toHaveValue('3');
  await page.getByRole('button', { name: '设为半选' }).click();
  await expect(checkbox).toHaveJSProperty('indeterminate', true);
  // 先进入真实键盘导航；鼠标点击后程序化 focus 不应强制出现 :focus-visible。
  await page.getByRole('combobox', { name: '尺寸', exact: true }).focus();
  await page.keyboard.press('Tab');
  await expect(checkbox).toBeFocused();
  await expect(checkbox).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press('Space');
  await expect(checkbox).toHaveJSProperty('indeterminate', false);
  await page.keyboard.press('Tab');
  await expect(select).toBeFocused();
  await select.selectOption('d');
  await page.keyboard.press('Tab');
  await expect(slider).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(slider).toHaveValue('3.5');
  const bounds = (await slider.boundingBox())!;
  await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await expect(slider).toHaveValue('5');
  await page.getByRole('button', { name: '重置表单' }).click();
  await expect(checkbox).toBeChecked();
  await expect(select).toHaveValue('b');
  await expect(slider).toHaveValue('3');
  await expect(page.getByRole('status', { name: '绑定状态' })).toHaveText(
    '已勾选 / 非半选 / b / 3',
  );
  await page.getByRole('button', { name: '读取表单' }).click();
  await expect(page.getByRole('status', { name: '表单数据' })).toHaveText(
    '[["accepted","yes"],["choice","b"],["duration","3"]]',
  );
  await page.getByRole('checkbox', { name: '禁用字段组' }).check();
  await expect(checkbox).toBeDisabled();
  await expect(select).toBeDisabled();
  await expect(slider).toBeDisabled();
  await page.getByRole('button', { name: '读取表单' }).click();
  await expect(page.getByRole('status', { name: '表单数据' })).toHaveText('[]');
  await page.getByRole('checkbox', { name: '禁用字段组' }).uncheck();
  await page.screenshot({ path: testInfo.outputPath('controls-light.png'), fullPage: true });
  expect(errors).toEqual([]);
});

test('控件主题、尺寸、高对比度和窄屏可访问性', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/controls/');
  await expect(page.locator('html')).toHaveAttribute('data-hydrated', 'true');
  await page.getByRole('checkbox', { name: '深色主题' }).check();
  await page.getByRole('combobox', { name: '尺寸', exact: true }).selectOption('_lg');
  await expect(page.getByRole('checkbox', { name: '接受条款' })).toHaveCSS('width', '20px');
  await expect(page.getByRole('slider', { name: '时长' })).toHaveCSS('color', 'rgb(147, 197, 253)');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(result.violations).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath('controls-dark-mobile.png'), fullPage: true });
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(page.getByRole('combobox', { name: '选项', exact: true })).toHaveCSS(
    'appearance',
    'auto',
  );
});

test('禁用 JavaScript 的首屏保留正确表单值和原生交互', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto('/controls/');
    const checkbox = page.getByRole('checkbox', { name: '接受条款' });
    const select = page.getByRole('combobox', { name: '选项', exact: true });
    const slider = page.getByRole('slider', { name: '时长' });
    await expect(checkbox).toBeChecked();
    await expect(select).toHaveValue('b');
    await expect(slider).toHaveValue('3');
    await checkbox.uncheck();
    await select.selectOption('d');
    await slider.focus();
    await page.keyboard.press('End');
    await expect(slider).toHaveValue('10');
  } finally {
    await context.close();
  }
});

test('触摸可切换复选框和改变滑块数值', async ({ browser }) => {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  try {
    const page = await context.newPage();
    await page.goto('/controls/');
    await expect(page.locator('html')).toHaveAttribute('data-hydrated', 'true');
    const checkbox = page.getByRole('checkbox', { name: '接受条款' });
    await checkbox.tap();
    await expect(checkbox).not.toBeChecked();
    const slider = page.getByRole('slider', { name: '时长' });
    await slider.scrollIntoViewIfNeeded();
    const bounds = (await slider.boundingBox())!;
    await page.touchscreen.tap(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    await expect(slider).toHaveValue('5');
  } finally {
    await context.close();
  }
});
