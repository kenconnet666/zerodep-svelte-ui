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
  assert.throws(() => entry.renderWithoutProvider(), /inside a Provider/);
  assert.throws(() => entry.renderIconWithoutProvider(), /inside a Provider/);
  for (const kind of ['theme', 'locale', 'lang', 'css']) {
    assert.throws(() => entry.readWithoutProvider(kind), /inside a Provider/);
  }
  assert.throws(() => entry.renderWithoutHost(), /CSS server host is unavailable/);
});

test('组件覆盖与实例 token 在并发 SSR 中按层解析且请求隔离', async () => {
  const [a, b] = await Promise.all([
    entry.renderIconTokens(
      { Icon: { _sizeLg: '21px', _colorPrimary: 'purple' } },
      { _colorPrimary: 'teal' },
    ),
    entry.renderIconTokens({ Icon: { _sizeLg: '27px', _colorPrimary: 'orange' } }),
  ]);
  assert.match(a.css, /font-size:21px/);
  assert.match(a.css, /color:teal/);
  assert.doesNotMatch(a.css, /color:purple|color:orange|font-size:27px/);
  assert.match(b.css, /font-size:27px/);
  assert.match(b.css, /color:orange/);
  assert.doesNotMatch(b.css, /color:teal|font-size:21px/);
});

test('正式包产物的 Icon 在 SSR 输出 SVG、名称和 bx 初始样式', () => {
  const result = entry.renderIcon('查找 <内容>');
  assert.match(result.body, /<svg[^>]*role="img"/);
  assert.match(result.body, /aria-label="查找 &lt;内容(?:>|&gt;)"/);
  assert.match(result.body, /<path/);
  assert.match(result.body, /<circle/);
  assert.doesNotMatch(result.body, /\skey=/);
  const variable = result.css.match(/stroke-width:var\((--[\w-]+)\)/)?.[1];
  assert.ok(variable);
  const svg = result.body.match(/<svg\b(?:[^>"']|"[^"]*"|'[^']*')*>/)?.[0];
  const name = svg.match(/\bclass="([^"]+)"/)?.[1];
  assert.match(name, /^z-[a-z0-9]+$/);
  // bx 可绑定在元素或私有规则上；两种编译路径都必须为当前 SVG 提供正确初值。
  const inlineValue = new RegExp(`${variable}:\\s*1\\.5(?:;|")`).test(svg);
  const boundValue = result.rules.some(
    (rule) =>
      rule.kind === 'bindings' &&
      rule.targets.includes(name) &&
      rule.body.includes(`${variable}:1.5;`),
  );
  assert.ok(inlineValue || boundValue, 'SVG 的描边变量缺少 SSR 初值');
  const body = result.rules.find((rule) => rule.className === name).body;
  assert.match(body, /width:1em;/);
  assert.match(body, /width:30px;$/);
  assert.doesNotMatch(body, /@layer/);
  assert.doesNotMatch(result.css, /--ui-color|--ui-font-size/);
});
