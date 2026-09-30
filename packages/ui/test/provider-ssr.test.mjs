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

test('正式包产物的 Provider 隔离并发 SSR 和嵌套主题作者', async () => {
  const [a, b] = await Promise.all([
    entry.renderProvider(false, '#123456'),
    entry.renderProvider(true, '#abcdef'),
  ]);
  assert.match(a.body, /light\/zh-CN/);
  assert.match(a.body, /Asia\/Shanghai\/加载中/);
  assert.match(b.body, /dark\/en-US/);
  assert.match(b.body, /dark\/zh-CN\/America\/New_York\/加载中/);
  assert.match(b.body, /America\/New_York\/Loading/);
  assert.match(a.css, /#123456/);
  assert.doesNotMatch(a.css, /#abcdef/);
  assert.match(b.css, /#abcdef/);
  assert.doesNotMatch(b.css, /#123456/);
  assert.equal(a.authors.length, 2);
  assert.notEqual(a.authors[0], a.authors[1]);
  assert.notEqual(a.authors[0], b.authors[0]);
  for (const result of [a, b]) {
    const name = result.body.match(/<div[^>]*class="([^"]+)"/)?.[1];
    assert.match(name, /^z-[a-z0-9]+$/);
    const body = result.rules.find((rule) => rule.className === name).body;
    assert.match(body, /color:#[a-f0-9]+;color:green;$/);
    assert.doesNotMatch(body, /@layer/);
    assert.doesNotMatch(result.css, /--ui-color|--ui-font-size/);
  }
});

test('缺少 Provider 或 SSR 宿主时明确失败', () => {
  assert.throws(() => entry.renderWithoutProvider(), /CSS author was not provided/);
  assert.throws(() => entry.renderIconWithoutProvider(), /CSS author was not provided/);
  assert.throws(() => entry.renderFoundationWithoutProvider('text'), /CSS author was not provided/);
  assert.throws(
    () => entry.renderFoundationWithoutProvider('ripple'),
    /CSS author was not provided/,
  );
  assert.throws(
    () => entry.renderFoundationWithoutProvider('button'),
    /CSS author was not provided/,
  );
  assert.throws(
    () => entry.renderFoundationWithoutProvider('loading'),
    /CSS author was not provided/,
  );
  for (const kind of ['theme', 'locale', 'lang', 'css']) {
    assert.throws(
      () => entry.readWithoutProvider(kind),
      kind === 'css' ? /CSS author was not provided/ : /Required context was not provided/,
    );
  }
  assert.throws(() => entry.renderWithoutHost(), /CSS server host is unavailable/);
});

test('Text 与 Ripple 的正式产物可 SSR，文本转义且没有运行时波纹节点', () => {
  const result = entry.renderFoundations('<script>unsafe</script>');
  assert.match(result.body, /<h2/);
  assert.match(result.body, /&lt;script>/);
  assert.doesNotMatch(result.body, /<script>unsafe/);
  assert.match(result.body, /aria-hidden="true"/);
  assert.match(result.body, /<button type="button"/);
  assert.doesNotMatch(result.body, /scale\(0\)/);
  assert.match(result.css, /pointer-events:none/);
});

test('Button 与 Loading 产物输出首屏语义、转义内容及减少动效样式，无需浏览器 API', () => {
  const result = entry.renderButton();
  assert.match(result.body, /<button[^>]*type="button"/);
  assert.match(result.body, /aria-busy="true"/);
  assert.match(result.body, /aria-disabled="true"/);
  assert.match(result.body, /&lt;内容/);
  assert.equal((result.body.match(/role="status"/g) ?? []).length, 1);
  assert.match(result.body, /aria-label="加载中"/);
  assert.match(result.css, /height:2.125em/);
  assert.match(result.css, /prefers-reduced-motion:\s*reduce/);
});

test('直接 CSS props 在并发 SSR 中正确输出且请求隔离', async () => {
  const [a, b] = await Promise.all([
    entry.renderIconAppearance({
      size: '21px',
      color: 'teal',
      strokeWidth: '3px',
      verticalAlign: 'middle',
    }),
    entry.renderIconAppearance({
      size: '27px',
      color: 'orange',
      strokeWidth: 'inherit',
      verticalAlign: 'baseline',
    }),
  ]);
  assert.match(a.css, /font-size:21px/);
  assert.match(a.css, /color:teal/);
  assert.doesNotMatch(a.css, /color:purple|color:orange|font-size:27px/);
  assert.match(b.css, /font-size:27px/);
  assert.match(b.css, /color:orange/);
  assert.match(a.css, /vertical-align:middle/);
  assert.match(b.css, /vertical-align:baseline/);
  assert.match(b.css, /stroke-width:inherit/);
  assert.doesNotMatch(b.css, /color:teal|font-size:21px/);
});

test('正式包产物的 Icon 在 SSR 输出 SVG、名称和直接 CSS 声明', () => {
  const result = entry.renderIcon('查找 <内容>');
  assert.match(result.body, /<svg[^>]*role="img"/);
  assert.match(result.body, /aria-label="查找 &lt;内容(?:>|&gt;)"/);
  assert.match(result.body, /<path/);
  assert.match(result.body, /<circle/);
  assert.doesNotMatch(result.body, /\skey=/);
  const svg = result.body.match(/<svg\b(?:[^>"']|"[^"]*"|'[^']*')*>/)?.[0];
  const name = svg.match(/\bclass="([^"]+)"/)?.[1];
  assert.match(name, /^z-[a-z0-9]+$/);
  const body = result.rules.find((rule) => rule.className === name).body;
  assert.match(body, /stroke-width:1.5;/);
  assert.match(body, /vertical-align:-0.125em;/);
  assert.match(body, /width:1em;/);
  assert.match(body, /width:30px;$/);
  assert.doesNotMatch(body, /@layer/);
  assert.doesNotMatch(result.css, /--ui-color|--ui-font-size/);
});
