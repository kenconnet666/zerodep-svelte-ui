import { watch, realpathSync } from 'node:fs';

const transient = new Set(['ENOENT', 'EPERM']);

/** 探针或目录重建期间路径可能消失；不能让同步 watch 异常终止 MCP。 */
export function watchDirectory(folder, options, listener, report) {
  let watcher;
  try {
    // Windows 的短文件名或非原生分隔符会触发 libuv 原生断言，try/catch 无法拦截。
    watcher = watch(realpathSync.native(folder), options, listener);
  } catch (error) {
    if (!transient.has(error.code)) report(error);
    return undefined;
  }
  watcher.on('error', (error) => {
    watcher.close();
    if (!transient.has(error.code)) report(error);
  });
  return watcher;
}
