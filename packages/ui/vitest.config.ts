import { resolve } from 'node:path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';
import cssBindings from 'zerodep-css-svelte/vite';
import uiIcons from 'zerodep-svelte-ui/vite';

export default defineConfig({
  root: import.meta.dirname,
  // 与消费端保持一致：先处理显式 CSS 绑定，再编译 Svelte。
  plugins: [uiIcons(), cssBindings(), svelte()],
  // 图标数据提前优化；编译器注入的绑定运行时由 CSS 插件声明。
  optimizeDeps: { include: ['@lucide/icons'] },
  test: {
    attachmentsDir: resolve(import.meta.dirname, '../../test-results/components'),
    include: ['test/**/*.browser.test.ts'],
    setupFiles: ['vitest-browser-svelte'],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      screenshotDirectory: resolve(import.meta.dirname, '../../test-results/components'),
      instances: [
        { browser: 'chromium', name: 'chromium' },
        // Firefox 多页面并行存在输入焦点干扰，保持真实键盘测试并串行执行文件。
        // 上游跟踪：https://github.com/vitest-dev/vitest/issues/7916
        { browser: 'firefox', name: 'firefox', fileParallelism: false },
        { browser: 'webkit', name: 'webkit' },
      ],
    },
  },
});
