import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { compile } from 'svelte/compiler';
import { build } from 'vite';
import { transformLucide } from '../dist/internal/lucide-transform.js';
import uiIcons from '../dist/vite.js';

const source = (template, script = '') =>
  `<script lang="ts">import { Icon } from 'zerodep-svelte-ui';${script}</script>\n${template}`;
const transform = (code) => transformLucide(code, '/project/Example.svelte');

test('静态名称、表达式字面量与官方别名转换，重复名称复用导入', async () => {
  const input = source(
    '<Icon lucide="search"/><Icon lucide={"search"}/><Icon lucide="alarm-check"/>',
  );
  const result = await transform(input);
  assert.equal((result.code.match(/import __zerodepLucide/g) ?? []).length, 2);
  assert.match(result.code, /@lucide\/icons\/icons\/search/);
  assert.match(result.code, /@lucide\/icons\/icons\/alarm-clock-check/);
  assert.equal((result.code.match(/icon=\{__zerodepLucide0\}/g) ?? []).length, 2);
  assert.deepEqual(result.map.sourcesContent, [input]);
  assert.ok(result.map.mappings.length);
  assert.doesNotThrow(() =>
    compile(result.code, { filename: 'Example.svelte', generate: 'server' }),
  );
});

test('成员回调转换为按需导入，连字符图标使用 camelCase', async () => {
  const result = await transform(
    source('<Icon lucide={i => i.search}/><Icon lucide={icons => icons.circlePlus}/>'),
  );
  assert.match(result.code, /@lucide\/icons\/icons\/search/);
  assert.match(result.code, /@lucide\/icons\/icons\/circle-plus/);
  assert.doesNotMatch(result.code, /i =>|icons =>/);
  assert.doesNotThrow(() =>
    compile(result.code, { filename: 'Example.svelte', generate: 'server' }),
  );
});

test('选择器不执行代码，不接受计算属性、语句块或外部对象', async () => {
  for (const selector of [
    'i => i[name]',
    'i => i.search()',
    'i => { return i.search; }',
    'i => other.search',
    'async i => i.search',
    'i => i.notAnIcon',
  ]) {
    await assert.rejects(
      transform(source('<Icon lucide={' + selector + '}/>')),
      /zerodep-ui-lucide/,
    );
  }
});

test('具名别名、命名空间与注入名称冲突', async () => {
  const result = await transform(
    `<script>import {Icon as Glyph} from 'zerodep-svelte-ui';import * as UI from 'zerodep-svelte-ui';const __zerodepLucide0 = 1;</script><Glyph lucide="search"/><UI.Icon lucide="plus"/>`,
  );
  assert.match(result.code, /icon=\{__zerodepLucide1\}/);
  assert.match(result.code, /icon=\{__zerodepLucide2\}/);
});

test('不改写其他组件、HTML、脚本字符串与注释', async () => {
  assert.equal(
    await transform(
      `<script>import Icon from './Other.svelte';const text='<Icon lucide="search" />';</script><!-- <Icon lucide="search"/> --><Icon lucide="search"/><div lucide="plus"/>`,
    ),
    undefined,
  );
  assert.equal(await transform(source('<Icon icon={data}/>', 'const data={node:[]};')), undefined);
});

test('each、snippet、const、await 和 slot 局部变量遮蔽不影响本地组件', async () => {
  for (const template of [
    '{#each items as Icon}<Icon lucide="not-a-lucide"/>{/each}',
    '{#snippet demo(Icon)}<Icon lucide="not-a-lucide"/>{/snippet}',
    '{#if ok}{@const Icon = Other}<Icon lucide="not-a-lucide"/>{/if}',
    '{#await promise then Icon}<Icon lucide="not-a-lucide"/>{/await}',
    '<Other let:Icon><Icon lucide="not-a-lucide"/></Other>',
  ])
    assert.equal(await transform(source(template)), undefined);
  const result = await transform(
    source('{#each items as Icon}<Icon lucide="local"/>{:else}<Icon lucide="search"/>{/each}'),
  );
  assert.match(result.code, /lucide="local"/);
  assert.match(result.code, /icon=\{__zerodepLucide0\}/);
});

test('动态、冲突、spread 和未知名称给出文件位置及处理建议', async () => {
  for (const [template, message] of [
    ['<Icon lucide={name}/>', /字符串字面量.*icon/],
    ['<Icon lucide="search" icon={data}/>', /二选一/],
    ['<Icon lucide="search" {...props}/>', /spread/],
    ['<Icon lucide="add"/>', /未知 Lucide.*plus/],
    ['<Icon lucide="../search"/>', /未知 Lucide/],
  ])
    await assert.rejects(transform(source(template)), (error) => {
      assert.match(error.message, /Example.svelte:2:/);
      assert.match(error.message, message);
      return true;
    });
});

test('插件跳过非 Svelte 与 style/raw 子请求', async () => {
  const plugin = uiIcons();
  for (const id of ['a.ts', 'a.svelte?raw', 'a.svelte?svelte&type=style']) {
    assert.equal(await plugin.transform(source('<Icon lucide="search"/>'), id), undefined);
  }
});

test('单名称构建只包含所选图标数据，不引入全量或动态加载器', async () => {
  const transformed = await transform(source('<Icon lucide={i => i.search}/>'));
  const declaration = transformed.code.match(/import (__zerodepLucide\d+) from ([^;]+);/);
  assert.ok(declaration);
  const result = await build({
    root: fileURLToPath(new URL('..', import.meta.url)),
    configFile: false,
    logLevel: 'silent',
    plugins: [
      {
        name: 'lucide-probe',
        resolveId(id) {
          if (id.replaceAll('\\', '/').endsWith('lucide-probe')) return '\0lucide-probe';
        },
        load(id) {
          if (id === '\0lucide-probe') return `${declaration[0]}export default ${declaration[1]};`;
        },
      },
    ],
    build: { write: false, minify: true, lib: { entry: 'lucide-probe', formats: ['es'] } },
  });
  const chunks = (Array.isArray(result) ? result[0] : result).output.filter(
    (item) => item.type === 'chunk',
  );
  assert.equal(chunks.length, 1);
  assert.deepEqual(chunks[0].dynamicImports, []);
  assert.ok(chunks[0].code.length < 4000);
  assert.match(chunks[0].code, /search/);
});
