import { readdir, readFile, writeFile } from 'node:fs/promises';
import { watch } from 'node:fs';
import { basename, dirname, resolve, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';
import { parse } from 'svelte/compiler';
import { format, resolveConfig } from 'prettier';

export const publicDirectory = fileURLToPath(new URL('../packages/ui/src/lib/', import.meta.url));

/** lib 是公开边界：不使用排除名单隐藏实现文件，内部代码应放到 src 的其他目录。 */
export async function publicIndex(directory = publicDirectory) {
  const files = [];
  async function scan(folder) {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      const file = resolve(folder, entry.name);
      if (file === resolve(directory, 'index.ts')) continue;
      if (entry.isDirectory()) await scan(file);
      else if (
        entry.isFile() &&
        /\.(?:ts|js|svelte)$/.test(entry.name) &&
        !entry.name.endsWith('.d.ts')
      )
        files.push(file);
      else throw new Error(`公共目录仅放 TS、JS 或 Svelte 模块，请移动其他文件：${file}`);
    }
  }
  await scan(directory);
  files.sort((a, b) => {
    const left = relative(directory, a).replaceAll('\\', '/');
    const right = relative(directory, b).replaceAll('\\', '/');
    return left < right ? -1 : left > right ? 1 : 0;
  });

  // Svelte 的 module script 也属于公开 API，用虚拟 TS 源文件统一检查具名导出。
  const sources = new Map();
  const virtualComponents = new Map();
  for (const file of files) {
    let source = await readFile(file, 'utf8');
    if (file.endsWith('.svelte')) {
      const module = parse(source, { modern: true }).module;
      source = module ? source.slice(module.content.start, module.content.end) : '';
      const virtual = file + '.__exports__.ts';
      if (files.includes(virtual)) throw new Error(`文件名与导出分析器冲突：${virtual}`);
      virtualComponents.set(file, virtual);
      sources.set(virtual, source + '\nexport default {};');
    } else sources.set(file, source);
  }
  const options = {
    allowJs: true,
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    noEmit: true,
  };
  const host = ts.createCompilerHost(options);
  const read = host.readFile;
  host.readFile = (file) => sources.get(resolve(file)) ?? read(file);
  const exists = host.fileExists;
  host.fileExists = (file) => sources.has(resolve(file)) || exists(file);
  host.resolveModuleNames = (names, containingFile) =>
    names.map((name) => {
      const component = virtualComponents.get(resolve(dirname(containingFile), name));
      if (component) return { resolvedFileName: component, extension: ts.Extension.Ts };
      return ts.resolveModuleName(name, containingFile, options, host).resolvedModule;
    });
  const program = ts.createProgram([...sources.keys()], options, host);
  const checker = program.getTypeChecker();
  const exported = new Map();
  const lines = ['// 此文件由 pnpm exports:generate 自动维护，请将公开模块放在 src/lib。'];
  function claim(name, identity, file) {
    const previous = exported.get(name);
    if (previous && previous.identity !== identity)
      throw new Error(`公开导出重名 ${name}：${previous.file} / ${file}`);
    exported.set(name, { identity, file });
  }
  for (const file of files) {
    const source = program.getSourceFile(virtualComponents.get(file) ?? file);
    const module = source && checker.getSymbolAtLocation(source);
    const symbols = module ? checker.getExportsOfModule(module) : [];
    if (!symbols.length) throw new Error(`公开模块没有导出，请移到 src 的内部目录：${file}`);
    const path = './' + relative(directory, file).replaceAll('\\', '/').replace(/\.ts$/, '.js');
    let named = false;
    for (const symbol of symbols) {
      if (symbol.name === 'default') {
        const stem = basename(file).replace(/\.(?:svelte|ts|js)$/, '');
        const name = (stem === 'index' ? basename(dirname(file)) : stem).replace(
          /(^|[-_.])(\w)/g,
          (_, _separator, letter) => letter.toUpperCase(),
        );
        if (!/^[A-Za-z_$][\w$]*$/.test(name)) throw new Error(`无法生成默认导出名称：${file}`);
        claim(name, symbol, file);
        lines.push(`export { default as ${name} } from '${path}';`);
      } else {
        const identity =
          symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
        claim(symbol.name, identity, file);
        named = true;
      }
    }
    if (named) lines.push(`export * from '${path}';`);
  }
  return format(lines.join('\n') + '\n', {
    ...(await resolveConfig(fileURLToPath(import.meta.url))),
    filepath: resolve(directory, 'index.ts'),
  });
}

export async function generatePublicIndex({ directory = publicDirectory, check = false } = {}) {
  const content = await publicIndex(directory);
  const target = resolve(directory, 'index.ts');
  const previous = await readFile(target, 'utf8').catch((error) => {
    if (error.code === 'ENOENT') return '';
    throw error;
  });
  if (previous === content) return false;
  if (check) throw new Error('公共入口未同步，请执行 pnpm exports:generate。');
  await writeFile(target, content, 'utf8');
  return true;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const check = process.argv.includes('--check');
  await generatePublicIndex({ check });
  if (process.argv.includes('--watch')) {
    let pending = Promise.resolve();
    const watcher = watch(publicDirectory, { recursive: true }, (_event, file) => {
      if (file === 'index.ts') return;
      pending = pending
        .then(() => generatePublicIndex())
        .catch((error) => console.error(error.message));
    });
    console.log('正在监听 src/lib 的公开导出。');
    for (const signal of ['SIGINT', 'SIGTERM'])
      process.on(signal, () => {
        watcher.close();
      });
  }
}
