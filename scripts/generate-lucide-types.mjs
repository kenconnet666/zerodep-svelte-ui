import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { format, resolveConfig } from 'prettier';

const require = createRequire(new URL('../packages/ui/package.json', import.meta.url));
const output = fileURLToPath(
  new URL('../packages/ui/src/lib/display/gene/lucide-names.ts', import.meta.url),
);

/** 输出纯字面量联合，避免编辑器跨依赖分析动态导入表的 keyof。 */
export async function generateLucideTypes({ check = false } = {}) {
  const { lucideIconNames } = await import(
    pathToFileURL(require.resolve('@lucide/icons/dynamic')).href
  );
  const { version } = JSON.parse(
    await readFile(
      new URL('../packages/ui/node_modules/@lucide/icons/package.json', import.meta.url),
      'utf8',
    ),
  );
  const names = [...new Set(lucideIconNames)].sort();
  const source = await format(
    `// 由 pnpm lucide:generate 生成，来源 @lucide/icons ${version}；不要手工编辑。\n` +
      '/** Lucide 官方图标名称及别名；lucide prop 仅接受编译时字面量。 */\n' +
      `export type LucideIconName =\n${names.map((name) => `  | ${JSON.stringify(name)}`).join('\n')};\n`,
    { ...(await resolveConfig(output)), filepath: output },
  );
  let current;
  try {
    current = await readFile(output, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  if (check) {
    if (current?.replaceAll('\r\n', '\n') !== source) {
      throw new Error(
        'Lucide 名称类型未同步，请运行 pnpm lucide:generate 和 pnpm exports:generate。',
      );
    }
  } else if (current !== source) {
    await writeFile(output, source);
  }
  return names.length;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const check = process.argv.includes('--check');
  console.log(
    `Lucide 字面量类型${check ? '检查' : '生成'}完成：${await generateLucideTypes({ check })} 个名称。`,
  );
}
