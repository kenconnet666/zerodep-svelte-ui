import assert from 'node:assert/strict';
import { readFile, writeFile, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { directory, requireProject, root } from './environment.mjs';

const { Client } = requireProject('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = requireProject('@modelcontextprotocol/sdk/client/stdio.js');
const client = new Client({ name: 'ui-language-verification', version: '1' });
const transport = new StdioClientTransport({
  command: process.execPath,
  args: [resolve(directory, 'server.mjs'), root],
  cwd: root,
  stderr: 'pipe',
});
let log = '';
transport.stderr?.on('data', (data) => {
  log = (log + data).slice(-8000);
});
const created = new Set();
const shared = 'packages/ui/src/__lsp_shared__.ts';
const files = [
  'packages/ui/src/__lsp_probe__.ts',
  'packages/ui/src/__LspProbe.svelte',
  'apps/docs/src/__LspProbe.svelte',
];

async function save(file, text) {
  await writeFile(resolve(root, file), text, {
    encoding: 'utf8',
    flag: created.has(file) ? 'w' : 'wx',
  });
  created.add(file);
}
async function call(name, args) {
  const response = await client.callTool({ name, arguments: args }, undefined, { timeout: 90000 });
  assert(!response.isError, response.content?.[0]?.text);
  return JSON.parse(response.content[0].text);
}
async function position(filePath, needle, offset = 0) {
  const text = await readFile(resolve(root, filePath), 'utf8');
  const index = text.indexOf(needle);
  assert(index >= 0, '缺少探针文本：' + needle);
  const before = text.slice(0, index + offset);
  return {
    filePath,
    line: before.split('\n').length,
    column: before.length - before.lastIndexOf('\n'),
  };
}
function fixture(file, valid) {
  const importPath = file.startsWith('packages/')
    ? './__lsp_shared__.js'
    : '../../../packages/ui/src/__lsp_shared__.js';
  const code =
    "import { tokens, pixels } from '" +
    importPath +
    "';\n" +
    'const count: number = ' +
    (valid ? '1' : "'wrong'") +
    ';\n' +
    'const tone = tokens.' +
    (valid ? 'primary' : 'missing') +
    ';\n' +
    'const width = pixels(' +
    (valid ? '12' : "'bad'") +
    ');\n' +
    'const output = count.toFixed() + tone + width;\n';
  return file.endsWith('.ts')
    ? code + 'export { output };\n'
    : '<script lang="ts">\n' +
        code +
        '</script>\n<span>{' +
        (valid ? 'output' : 'count.notAMethod()') +
        '}</span>\n';
}
try {
  await save(
    shared,
    'export const tokens = { primary: "red" } as const;\nexport function pixels(value: number): string { return value + "px"; }\n',
  );
  await client.connect(transport, { timeout: 60000 });
  assert.deepEqual((await client.listTools()).tools.map((t) => t.name).sort(), [
    'completions',
    'definitions',
    'diagnostics',
    'hover',
    'references',
  ]);
  for (const filePath of files) {
    // 同一进程内往返修改，防止把启动成功或过期空诊断误认为 LSP 可用。
    for (const valid of [false, true, false, true]) {
      await save(filePath, fixture(filePath, valid));
      const report = await call('diagnostics', { filePath });
      assert(report.complete, JSON.stringify(report));
      if (valid) assert.equal(report.errors, 0, JSON.stringify(report));
      else
        for (const code of [2322, 2339, 2345]) {
          assert(
            report.diagnostics.some((d) => Number(d.code) === code),
            JSON.stringify(report),
          );
        }
    }
    const point = await position(filePath, 'pixels(12)');
    assert(JSON.stringify((await call('hover', point)).contents).includes('number'));
    assert(
      (await call('definitions', point)).items.some((d) => d.filePath.includes('__lsp_shared__')),
    );
    assert((await call('references', await position(filePath, 'count.toFixed'))).total >= 2);
    assert(
      (
        await call('completions', {
          ...(await position(filePath, 'tokens.primary', 'tokens.'.length)),
          prefix: 'pri',
        })
      ).items.some((c) => c.label === 'primary'),
    );
    console.log('诊断更新与五种语义工具通过：' + filePath);
  }
  for (const filePath of [
    'packages/ui/src/lib/index.ts',
    'apps/docs/src/routes/+layout.svelte',
    'apps/docs/src/routes/+page.svelte',
  ]) {
    const report = await call('diagnostics', { filePath });
    assert(report.complete && report.errors === 0, JSON.stringify(report));
  }
  console.log('LSP 验证完成；当前 Codex 会话是否已加载仍需重载后实测。');
} catch (error) {
  console.error(log);
  console.error(error);
  process.exitCode = 1;
} finally {
  await client.close();
  await transport.close();
  for (const file of created) await unlink(resolve(root, file));
}
