import assert from 'node:assert/strict';
import { before, after, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import cssBindings from 'zerodep-css-svelte/vite';

let server;
let entry;
before(async () => {
  server = await createServer({
    configFile: false,
    root: fileURLToPath(new URL('..', import.meta.url)),
    plugins: [cssBindings(), svelte()],
    server: { middlewareMode: true },
    ssr: { noExternal: ['zerodep-svelte-ui', 'zerodep-css', 'zerodep-css-svelte'] },
    logLevel: 'error',
  });
  entry = await server.ssrLoadModule('/test/fixtures/ssr-entry.ts');
});
after(async () => {
  await server?.close();
});

test('正式包产物的 Provider 隔离并发 SSR，嵌套作用域共享请求作者', async () => {
  const [a, b] = await Promise.all([
    entry.renderProvider('light', 'zh-CN', '#123456'),
    entry.renderProvider('dark', 'en-US', '#abcdef'),
  ]);
  assert.match(a.body, /light\/zh-CN/);
  assert.match(a.body, /light\/ja-JP/);
  assert.match(b.body, /dark\/en-US/);
  assert.match(b.body, /dark\/ja-JP/);
  assert.match(a.css, /#123456/);
  assert.doesNotMatch(a.css, /#abcdef/);
  assert.match(b.css, /#abcdef/);
  assert.doesNotMatch(b.css, /#123456/);
  assert.equal(a.authors.length, 2);
  assert.equal(a.authors[0], a.authors[1]);
  assert.notEqual(a.authors[0], b.authors[0]);
});

test('缺少 Provider 或 SSR 宿主时明确失败', () => {
  assert.throws(() => entry.renderWithoutProvider(), /inside a Provider/);
  assert.throws(() => entry.renderWithoutHost(), /CSS server host is unavailable/);
});
