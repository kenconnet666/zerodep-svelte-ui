import { requireProject, root, serviceConfig } from './environment.mjs';
import { spawn, execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { watchDirectory } from './watch-directory.mjs';

const { createMessageConnection, StreamMessageReader, StreamMessageWriter } =
  requireProject('vscode-jsonrpc/node.js');
const services = new Map();
const activeChildren = new Map();
const children = new Set();
let closing = false;

function stop(child) {
  if (child.exitCode !== null || child.killed) return;
  // 只清理自己创建的语言服务进程树，不触碰 IDE 或其他任务的 Node 进程。
  if (process.platform === 'win32') {
    try {
      execFileSync('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], {
        windowsHide: true,
        stdio: 'ignore',
      });
    } catch {
      /* 进程可能已自行退出。 */
    }
  } else child.kill();
}

async function start(kind) {
  const config = serviceConfig(kind);
  const child = spawn(config.bin, config.args, { cwd: root, stdio: 'pipe', windowsHide: true });
  children.add(child);
  activeChildren.set(kind, child);
  child.on('exit', (code, signal) => {
    if (!closing && code !== 0 && signal !== 'SIGTERM')
      process.stderr.write('Language service ' + kind + ' exited: ' + (signal ?? code) + '\n');
    children.delete(child);
    if (activeChildren.get(kind) === child) {
      activeChildren.delete(kind);
      services.delete(kind);
    }
  });
  child.stderr.on('data', (data) => process.stderr.write(data));
  const connection = createMessageConnection(
    new StreamMessageReader(child.stdout),
    new StreamMessageWriter(child.stdin),
  );
  const watchers = new Map();
  const rescan = new Set();
  let disposed = false;
  const changed = new Map();
  let refreshTimer;
  child.on('exit', () => {
    disposed = true;
    clearTimeout(refreshTimer);
    for (const watcher of watchers.values()) watcher.close();
    watchers.clear();
    connection.dispose();
  });
  child.on('error', () => connection.dispose());
  connection.onRequest('workspace/configuration', ({ items }) => items.map(() => ({})));
  connection.onRequest('client/registerCapability', () => null);
  connection.onRequest('client/unregisterCapability', () => null);
  connection.onRequest('window/workDoneProgress/create', () => null);
  connection.onRequest('workspace/diagnostic/refresh', () => null);
  connection.onRequest('workspace/applyEdit', () => ({
    applied: false,
    failureReason: 'Read-only language bridge.',
  }));
  connection.listen();
  async function request(method, params) {
    let timer;
    try {
      return await Promise.race([
        connection.sendRequest(method, params),
        new Promise((_, reject) => {
          timer = setTimeout(() => {
            stop(child);
            reject(new Error('Language service request did not complete: ' + method));
          }, 45000);
        }),
      ]);
    } finally {
      clearTimeout(timer);
    }
  }
  try {
    const initialized = await request('initialize', {
      processId: process.pid,
      clientInfo: { name: 'Codex zerodep-svelte-ui language bridge', version: '1' },
      rootUri: pathToFileURL(root).href,
      workspaceFolders: [{ name: 'zerodep-svelte-ui', uri: pathToFileURL(root).href }],
      capabilities: {
        workspace: { configuration: true },
        textDocument: {
          hover: { contentFormat: ['markdown', 'plaintext'] },
          definition: { linkSupport: true },
          diagnostic: {},
          publishDiagnostics: { versionSupport: true },
          completion: {
            completionItem: {
              snippetSupport: false,
              documentationFormat: ['markdown', 'plaintext'],
              resolveSupport: { properties: ['documentation', 'detail', 'additionalTextEdits'] },
            },
          },
        },
      },
      initializationOptions: config.initializationOptions,
    });
    await connection.sendNotification('initialized', {});
    // 父目录只监听自身；源码/声明目录递归监听，不进入 node_modules。
    const relevant = /\.(?:[cm]?[jt]sx?|svelte|json|yaml)$/u;
    const notifyFile = (path) => {
      const uri = pathToFileURL(path).href;
      changed.set(uri, { uri, type: existsSync(path) ? 2 : 3 });
    };
    const schedule = () => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(async () => {
        try {
          const folders = [...rescan];
          rescan.clear();
          for (const folder of folders) {
            const files = await readdir(folder, { recursive: true }).catch((error) => {
              if (error.code === 'ENOENT') return [];
              throw error;
            });
            for (const file of files) if (relevant.test(file)) notifyFile(resolve(folder, file));
          }
          if (disposed) return;
          const changes = [...changed.values()];
          changed.clear();
          if (changes.length)
            await connection.sendNotification('workspace/didChangeWatchedFiles', { changes });
        } catch (error) {
          if (!disposed) process.stderr.write('Language refresh: ' + error.message + '\n');
        }
      }, 60);
    };
    const installWatcher = (directory) => {
      const folder = resolve(root, directory);
      watchers.get(directory)?.close();
      watchers.delete(directory);
      if (disposed || !existsSync(folder)) return;
      const watcher = watchDirectory(
        folder,
        { recursive: ['src', 'test', 'dist'].some((name) => directory.endsWith('/' + name)) },
        (_event, filename) => {
          if (disposed || !filename) return;
          const name = filename.toString();
          if (
            ['packages/ui', 'apps/docs'].includes(directory) &&
            ['src', 'test', 'dist'].includes(name)
          ) {
            // build 清空并重建 dist 后重新挂接，并补发重建期间可能遗漏的文件变化。
            installWatcher(directory + '/' + name);
            rescan.add(resolve(folder, name));
            schedule();
            return;
          }
          if (!relevant.test(name)) return;
          notifyFile(resolve(folder, name));
          schedule();
        },
        (error) => {
          if (!disposed) process.stderr.write('Language watcher: ' + error.message + '\n');
        },
      );
      if (watcher) watchers.set(directory, watcher);
    };
    for (const directory of [
      '',
      'packages/ui',
      'apps/docs',
      'packages/ui/src',
      'packages/ui/test',
      'packages/ui/dist',
      'apps/docs/src',
    ])
      installWatcher(directory);
    const versions = new Map();
    let queue = Promise.resolve();
    return {
      capabilities: initialized.capabilities,
      request,
      run(doc, action) {
        // 同一服务内串行刷新文档，避免并行查询把不同版本的诊断混在一起。
        const result = queue
          .catch(() => {})
          .then(async () => {
            const version = (versions.get(doc.uri) ?? 0) + 1;
            await connection.sendNotification(
              version === 1 ? 'textDocument/didOpen' : 'textDocument/didChange',
              version === 1
                ? {
                    textDocument: {
                      uri: doc.uri,
                      languageId: doc.languageId,
                      version,
                      text: doc.text,
                    },
                  }
                : { textDocument: { uri: doc.uri, version }, contentChanges: [{ text: doc.text }] },
            );
            versions.set(doc.uri, version);
            try {
              const result = await action(version);
              return result;
            } finally {
              // 只读探针不持有编辑器缓冲区；关闭后让依赖回到磁盘版本，避免覆盖真实编辑。
              await connection.sendNotification('textDocument/didClose', {
                textDocument: { uri: doc.uri },
              });
              versions.delete(doc.uri);
            }
          });
        queue = result;
        return result;
      },
    };
  } catch (error) {
    stop(child);
    throw error;
  }
}

export async function service(kind) {
  let pending = services.get(kind);
  if (!pending) {
    pending = start(kind).catch((error) => {
      if (services.get(kind) === pending) services.delete(kind);
      throw error;
    });
    services.set(kind, pending);
  }
  return pending;
}

export function restart(kind) {
  services.delete(kind);
  const child = activeChildren.get(kind);
  if (child) stop(child);
}

export function stopAll() {
  closing = true;
  for (const child of children) stop(child);
}
