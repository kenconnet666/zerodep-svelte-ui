import { directory, requireProject, root } from './environment.mjs';
import { resolve } from 'node:path';

const { Client } = requireProject('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = requireProject('@modelcontextprotocol/sdk/client/stdio.js');
const files = process.argv.slice(3);
if (!files.length) throw new Error('Usage: node inspect.mjs <repository> <file> [file...]');
const client = new Client({ name: 'zerodep-file-inspection', version: '1' });
const transport = new StdioClientTransport({
  command: process.execPath,
  args: [resolve(directory, 'server.mjs'), root],
  cwd: root,
  stderr: 'pipe',
});
// 只在失败时输出最近服务日志；不把启动日志当作诊断结论。
let log = '';
transport.stderr?.on('data', (data) => {
  log = (log + data).slice(-8000);
});
try {
  await client.connect(transport);
  for (const filePath of files) {
    const result = await client.callTool(
      { name: 'diagnostics', arguments: { filePath } },
      undefined,
      { timeout: 90000 },
    );
    if (result.isError) throw new Error(result.content?.[0]?.text ?? 'Diagnostic request failed');
    const report = JSON.parse(result.content[0].text);
    if (!report.complete) throw new Error('Incomplete diagnostic result: ' + filePath);
    console.log(JSON.stringify(report));
    if (report.errors) process.exitCode = 2;
  }
} catch (error) {
  console.error(log);
  console.error(error);
  process.exitCode = 1;
} finally {
  await client.close();
  await transport.close();
}
