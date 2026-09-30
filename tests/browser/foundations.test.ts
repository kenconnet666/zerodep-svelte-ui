import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Ripple 从指针位置覆盖按钮，松开后回收且不重复激活', async ({ page }, testInfo) => {
  await page.goto('/ripple/');
  await expect(page.locator('html')).toHaveAttribute('data-hydrated', 'true');
  const button = page.locator('[data-ripple-button]');
  const layer = page.locator('[data-ripple-layer]');
  await layer.evaluate((element) => {
    element.setAttribute('data-wave-count', '0');
    new MutationObserver((records) => {
      const added = records.reduce((sum, record) => sum + record.addedNodes.length, 0);
      element.setAttribute(
        'data-wave-count',
        String(Number(element.getAttribute('data-wave-count')) + added),
      );
    }).observe(element, { childList: true });
  });
  const box = (await layer.boundingBox())!;
  // WebKit 会把注入的小数指针坐标取整；依据实际事件验证换算，不假定请求坐标原样派发。
  await button.evaluate((element) => {
    element.addEventListener(
      'pointerdown',
      (event) => {
        if (!(event instanceof PointerEvent)) throw new Error('Expected PointerEvent');
        element.setAttribute('data-pointer-x', String(event.clientX));
        element.setAttribute('data-pointer-y', String(event.clientY));
      },
      { once: true },
    );
  });
  await page.mouse.move(box.x + 5, box.y + 7);
  await page.mouse.down();
  await expect(layer.locator(':scope > span')).toHaveCount(1);
  const circle = await layer.evaluate((element) => {
    const wave = element.firstElementChild as HTMLElement;
    const radius = parseFloat(wave.style.width) / 2;
    return {
      x: parseFloat(wave.style.left) + radius,
      y: parseFloat(wave.style.top) + radius,
      radius,
      width: element.clientWidth,
      height: element.clientHeight,
    };
  });
  const pointerX = Number(await button.getAttribute('data-pointer-x'));
  const pointerY = Number(await button.getAttribute('data-pointer-y'));
  expect(circle.x).toBeCloseTo(((pointerX - box.x) * circle.width) / box.width, 3);
  expect(circle.y).toBeCloseTo(((pointerY - box.y) * circle.height) / box.height, 3);
  expect(circle.radius).toBeGreaterThanOrEqual(
    Math.hypot(circle.width - circle.x, circle.height - circle.y) - 0.1,
  );
  await expect(page.getByRole('status', { name: '操作次数' })).toHaveText('0');
  await button.screenshot({ path: testInfo.outputPath('ripple-pressed.png') });
  await page.mouse.up();
  await expect(page.getByRole('status', { name: '操作次数' })).toHaveText('1');
  await expect(layer).toHaveAttribute('data-wave-count', '1');
  await expect(layer.locator(':scope > span')).toHaveCount(0);
  await expect(page.getByRole('status', { name: '提交次数' })).toHaveText('0');
  await page.getByRole('combobox', { name: '按钮类型' }).selectOption('submit');
  await button.click();
  await expect(page.getByRole('status', { name: '提交次数' })).toHaveText('1');
});

test('Ripple 移出取消，减少动效偏好生效且不影响业务点击', async ({ page }) => {
  await page.goto('/ripple/');
  await expect(page.locator('html')).toHaveAttribute('data-hydrated', 'true');
  const layer = page.locator('[data-ripple-layer]');
  const box = (await layer.boundingBox())!;
  await page.mouse.move(box.x + 10, box.y + 10);
  await page.mouse.down();
  await expect(layer.locator(':scope > span')).toHaveCount(1);
  await page.mouse.move(box.x + box.width + 50, box.y + box.height + 50);
  await expect(layer.locator(':scope > span')).toHaveCount(0);
  await page.mouse.up();
  await expect(page.getByRole('status', { name: '操作次数' })).toHaveText('0');
  await page.mouse.move(box.x + 10, box.y + 10);
  await page.mouse.down();
  await expect(layer.locator(':scope > span')).toHaveCount(1);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(layer.locator(':scope > span')).toHaveCount(0);
  await page.mouse.up();
  await page.locator('[data-ripple-button]').click();
  await expect(page.getByRole('status', { name: '操作次数' })).toHaveText('2');
  await expect(layer.locator(':scope > span')).toHaveCount(0);
});

test('键盘中心反馈、焦点环和 loading 的焦点保留', async ({ page }) => {
  await page.goto('/ripple/');
  await expect(page.locator('html')).toHaveAttribute('data-hydrated', 'true');
  const button = page.locator('[data-ripple-button]');
  const layer = page.locator('[data-ripple-layer]');
  await page.locator('[data-focus-before]').focus();
  await page.keyboard.press('Tab');
  await expect(button).toBeFocused();
  await expect(button).toHaveCSS('outline-style', 'solid');
  await expect(button).toHaveCSS('outline-width', '2px');
  await expect(layer.locator(':scope > span')).toHaveCount(0);
  await layer.evaluate((element) => {
    const observer = new MutationObserver((records) => {
      const wave = records
        .flatMap((record) => [...record.addedNodes])
        .find((node) => node instanceof HTMLElement) as HTMLElement | undefined;
      if (!wave) return;
      observer.disconnect();
      element.setAttribute(
        'data-origin-x',
        String(parseFloat(wave.style.left) + parseFloat(wave.style.width) / 2),
      );
    });
    observer.observe(element, { childList: true });
  });
  await page.keyboard.press('Enter');
  await expect(layer).toHaveAttribute('data-origin-x', /\d/);
  const point = await layer.evaluate((element) => ({
    x: Number(element.getAttribute('data-origin-x')),
    width: element.clientWidth,
  }));
  expect(point.x).toBeCloseTo(point.width / 2, 0);
  await expect(page.getByRole('status', { name: '操作次数' })).toHaveText('1');
  await page.keyboard.press('Space');
  await expect(page.getByRole('status', { name: '操作次数' })).toHaveText('2');
  await page.getByRole('checkbox', { name: '加载中', exact: true }).check();
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(button).toBeFocused();
  await expect(page.getByRole('status', { name: '操作次数' })).toHaveText('2');
  await expect(layer.locator(':scope > span')).toHaveCount(0);
  await page.keyboard.press('Tab');
  await expect(page.locator('[data-focus-after]')).toBeFocused();
});

test('触摸点击只有一组波纹和一次操作', async ({ browser }) => {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  try {
    const page = await context.newPage();
    await page.goto('/ripple/');
    await expect(page.locator('html')).toHaveAttribute('data-hydrated', 'true');
    const layer = page.locator('[data-ripple-layer]');
    await layer.evaluate((element) => {
      element.setAttribute('data-added', '0');
      new MutationObserver((records) =>
        element.setAttribute(
          'data-added',
          String(
            Number(element.getAttribute('data-added')) +
              records.reduce((n, record) => n + record.addedNodes.length, 0),
          ),
        ),
      ).observe(element, { childList: true });
    });
    await page.locator('[data-ripple-button]').tap();
    await expect(page.getByRole('status', { name: '操作次数' })).toHaveText('1');
    await expect(layer).toHaveAttribute('data-added', '1');
    await expect(layer.locator(':scope > span')).toHaveCount(0);
  } finally {
    await context.close();
  }
});

test('Text 主题更新与基础设施页面的窄屏、可访问性', async ({ page }) => {
  await page.goto('/text/');
  await expect(page.locator('html')).toHaveAttribute('data-hydrated', 'true');
  const text = page.locator('[data-text-preview]');
  await expect(text).toHaveText('主题文字 <内容>');
  await page.getByRole('checkbox', { name: '深色主题' }).check();
  await expect(text).toHaveCSS('color', 'rgb(147, 197, 253)');
  await page.getByRole('combobox', { name: '文字大小' }).selectOption('18px');
  await expect(text).toHaveCSS('font-size', '18px');
  for (const path of ['/text/', '/ripple/']) {
    await page.goto(path);
    await page.setViewportSize({ width: 360, height: 780 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  }
});
