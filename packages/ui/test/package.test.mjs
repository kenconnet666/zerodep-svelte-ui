import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { compile } from 'svelte/compiler';
import { render } from 'svelte/server';
import { createServerCssHost, withCssHost } from 'zerodep-css-svelte/server';

test('包入口和声明来自正式构建产物', async () => {
  const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  const entry = manifest.exports['.'];
  for (const file of new Set(Object.values(entry))) {
    await readFile(new URL('../' + file, import.meta.url));
  }
  await import('zerodep-svelte-ui');
});

test('Svelte 服务端编译链保留文本转义并收集 npm CSS 包的样式', async () => {
  const file = new URL('./fixtures/RenderProbe.svelte', import.meta.url);
  const { js } = compile(await readFile(file, 'utf8'), {
    filename: fileURLToPath(file),
    generate: 'server',
  });
  // 临时模块放在包内以解析本工作区的 Svelte；finally 只清理本次创建的目录。
  const directory = await mkdtemp(new URL('./.render-', import.meta.url));
  try {
    const modulePath = join(directory, 'probe.mjs');
    await writeFile(modulePath, js.code);
    const { default: Probe } = await import(pathToFileURL(modulePath).href);
    const host = createServerCssHost();
    // Svelte 延迟到读取 body 才执行渲染，因此读取也必须位于请求宿主内。
    const body = withCssHost(
      host,
      () => render(Probe, { props: { label: '<script>test</script>' } }).body,
    );
    assert.match(body, /&lt;script>/);
    assert.doesNotMatch(body, /<script>/);
    assert.match(host.cssText(), /color:red/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
