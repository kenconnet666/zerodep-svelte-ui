import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { root } from './environment.mjs';

if (process.versions.node.split('.')[0] !== '24') throw new Error('请使用 Node 24。');
const path = resolve(root, '.codex/config.toml');
const template = await readFile(resolve(root, '.codex/config.example.toml'), 'utf8');
// 路径仅写入被忽略的本机配置；换机后重新生成，不需要修改任何源码。
const block = template
  .replace('__NODE__', JSON.stringify(process.execPath.replaceAll('\\', '/')))
  .replace('__ROOT__', JSON.stringify(root.replaceAll('\\', '/')));
const managed = /# BEGIN UI LANGUAGE SERVICES[\s\S]*?# END UI LANGUAGE SERVICES/u;
const existing = await readFile(path, 'utf8').catch((error) => {
  if (error.code === 'ENOENT') return '';
  throw error;
});
if (!managed.test(existing) && /\[mcp_servers\.zerodep_ui_lsp(?:\]|\.)/u.test(existing)) {
  throw new Error('存在手工配置的同名服务，请先处理冲突。');
}
await writeFile(
  path,
  managed.test(existing)
    ? existing.replace(managed, () => block.trimEnd())
    : existing.trimEnd() + (existing ? '\n\n' : '') + block,
);
console.log('已生成本机项目 LSP 配置；信任并打开新项目后重载 Codex。');
