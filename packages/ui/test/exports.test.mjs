import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, writeFile, readFile, rename, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative, isAbsolute, dirname } from 'node:path';
import { generatePublicIndex, publicIndex } from '../../../scripts/generate-ui-exports.mjs';

async function workspace(run) {
  const directory = await mkdtemp(join(tmpdir(), 'zerodep-ui-exports-'));
  const lib = join(directory, 'src/lib');
  await mkdir(lib, { recursive: true });
  async function file(path, content) {
    const target = join(directory, 'src', path);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, content);
  }
  try {
    await run({ lib, file });
  } finally {
    const path = relative(tmpdir(), directory);
    assert(!isAbsolute(path) && dirname(path) === '.' && path.startsWith('zerodep-ui-exports-'));
    await rm(directory, { recursive: true, force: true });
  }
}

test('递归导出组件、module script、类型和默认模块，不暴露 src/internal', () =>
  workspace(async ({ lib, file }) => {
    await file(
      'lib/provider/Provider.svelte',
      '<script module lang="ts">export interface ProviderOptions { enabled: boolean }</script><div></div>',
    );
    await file(
      'lib/theme/light.ts',
      'export const lightTheme = {}; export type Theme = { name: string };',
    );
    await file('lib/provider/Provider.svelte.ts', 'export const providerState = 1;');
    await file('lib/tool/value.ts', 'export default function value() {}');
    await file('internal/context.ts', 'export const secretSetter = 1;');
    const output = await publicIndex(lib);
    assert.match(output, /default as Provider.*provider\/Provider\.svelte/);
    assert.match(output, /export \* from '.\/provider\/Provider\.svelte'/);
    assert.match(output, /export \* from '.\/theme\/light\.js'/);
    assert.match(output, /default as Value/);
    assert.match(output, /provider\/Provider\.svelte\.js/);
    assert.doesNotMatch(output, /secretSetter|internal/);
    assert.equal(await generatePublicIndex({ directory: lib }), true);
    assert.equal(await generatePublicIndex({ directory: lib }), false);
    assert.equal(await generatePublicIndex({ directory: lib, check: true }), false);
  }));

test('新增、改名和删除模块同步入口，check 模式不写文件', () =>
  workspace(async ({ lib, file }) => {
    await file('lib/a.ts', 'export const first = 1;');
    await generatePublicIndex({ directory: lib });
    const before = await readFile(join(lib, 'index.ts'), 'utf8');
    await file('lib/nested/b.ts', 'export const second = 2;');
    await assert.rejects(generatePublicIndex({ directory: lib, check: true }), /未同步/);
    assert.equal(await readFile(join(lib, 'index.ts'), 'utf8'), before);
    await generatePublicIndex({ directory: lib });
    await rename(join(lib, 'nested/b.ts'), join(lib, 'nested/c.ts'));
    await rm(join(lib, 'a.ts'));
    await generatePublicIndex({ directory: lib });
    const after = await readFile(join(lib, 'index.ts'), 'utf8');
    assert.match(after, /nested\/c\.js/);
    assert.doesNotMatch(after, /a\.js|b\.js/);
  }));

test('具名导出与组件重名时失败，旧入口保持完整', () =>
  workspace(async ({ lib, file }) => {
    await file('lib/Provider.svelte', '<div></div>');
    await generatePublicIndex({ directory: lib });
    const before = await readFile(join(lib, 'index.ts'), 'utf8');
    await file('lib/conflict.ts', 'export const Provider = 1;');
    await assert.rejects(generatePublicIndex({ directory: lib }), /重名 Provider/);
    assert.equal(await readFile(join(lib, 'index.ts'), 'utf8'), before);
  }));

test('公开目录的无导出模块不能静默遗漏', () =>
  workspace(async ({ lib, file }) => {
    await file('lib/private.ts', 'const internalOnly = 1;');
    await assert.rejects(publicIndex(lib), /没有导出/);
  }));
