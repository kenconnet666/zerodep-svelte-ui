import { resolve } from 'node:path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';
import cssBindings from 'zerodep-css-svelte/vite';

export default defineConfig({
  root: import.meta.dirname,
  // 与消费端保持一致：先处理显式 CSS 绑定，再编译 Svelte。
  plugins: [cssBindings(), svelte()],
  test: {
    include: ['test/**/*.browser.test.ts'],
    setupFiles: ['vitest-browser-svelte'],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      screenshotDirectory: resolve(import.meta.dirname, '../../test-results/components'),
      instances: [
        { browser: 'chromium', name: 'chromium' },
        { browser: 'firefox', name: 'firefox' },
        { browser: 'webkit', name: 'webkit' },
      ],
    },
  },
});
