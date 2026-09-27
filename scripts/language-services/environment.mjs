import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { realpathSync } from 'node:fs';

export const directory = dirname(fileURLToPath(import.meta.url));
export const root = realpathSync.native(resolve(process.argv[2] ?? resolve(directory, '../..')));
export const requireProject = createRequire(resolve(root, 'package.json'));

export function serviceConfig(kind) {
  const modules = resolve(root, 'node_modules');
  if (kind === 'svelte')
    return {
      bin: process.execPath,
      args: [resolve(modules, 'svelte-language-server/bin/server.js'), '--stdio'],
    };
  return {
    bin: process.execPath,
    args: [resolve(modules, 'typescript-language-server/lib/cli.mjs'), '--stdio'],
    initializationOptions: {
      hostInfo: 'Codex zerodep-svelte-ui',
      disableAutomaticTypingAcquisition: true,
      // 避免尚未就绪的 syntax server 把语义类型降为 any。
      tsserver: { path: resolve(modules, 'typescript/lib'), useSyntaxServer: 'never' },
      plugins: [{ name: 'typescript-svelte-plugin', location: root, languages: ['svelte'] }],
    },
  };
}
