import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generatePublicIndex } from './generate-ui-exports.mjs';
import { generateLucideTypes, generateLucideIcons } from './generate-lucide-types.mjs';

const root = fileURLToPath(new URL('../packages/ui/', import.meta.url));
const require = createRequire(join(root, 'package.json'));
await generateLucideTypes();
await generateLucideIcons();
await generatePublicIndex();
const commands = [
  [fileURLToPath(new URL('./generate-ui-exports.mjs', import.meta.url)), '--watch'],
  [
    join(dirname(require.resolve('@sveltejs/package/package.json')), 'svelte-package.js'),
    '-i',
    'src',
    '--watch',
  ],
];
const children = commands.map((args) =>
  spawn(process.execPath, args, { cwd: root, stdio: 'inherit', windowsHide: true }),
);
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  process.exitCode = code;
  for (const child of children) if (child.exitCode === null) child.kill();
}
for (const child of children) {
  child.on('error', (error) => {
    console.error(error.message);
    stop(1);
  });
  child.on('exit', (code) => stop(code ?? 0));
}
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => stop());
