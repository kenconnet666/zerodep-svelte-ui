import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, readFile, writeFile, rm, realpath, copyFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

test(
  '真实 tarball 消费：公共类型、SSR 与浏览器编译，bx 必须经过插件',
  { timeout: 240_000 },
  async () => {
    const packageRoot = fileURLToPath(new URL('../..', import.meta.url));
    const manager = process.env.npm_execpath;
    assert(manager, '通过 pnpm test:consumer 运行此消费端测试');
    const directory = await mkdtemp(join(tmpdir(), 'zerodep-ui-consumer-'));
    const run = (args, cwd = directory) => {
      try {
        return execFileSync(process.execPath, [manager, ...args], {
          cwd,
          encoding: 'utf8',
          timeout: 180_000,
          stdio: 'pipe',
          windowsHide: true,
        });
      } catch (error) {
        throw new Error(
          `消费端命令失败: pnpm ${args.join(' ')}\n${error.stdout ?? ''}\n${error.stderr ?? ''}`,
          { cause: error },
        );
      }
    };
    try {
      const tarball = join(directory, 'ui.tgz');
      run(['pack', '--out', tarball], packageRoot);
      const dependencies = { 'zerodep-svelte-ui': 'file:./ui.tgz' };
      for (const name of [
        'svelte',
        'vite',
        'typescript',
        '@lucide/icons',
        '@sveltejs/vite-plugin-svelte',
        'zerodep-css',
        'zerodep-css-svelte',
      ]) {
        const manifest = JSON.parse(
          await readFile(join(packageRoot, 'node_modules', name, 'package.json'), 'utf8'),
        );
        dependencies[name] = manifest.version;
      }
      // 跨仓修复发布前可用候选 tarball 验证；覆盖仅存在于这个临时消费项目。
      const overrides = {};
      if (process.env.ZERODEP_CSS_TEST_RELEASE) {
        const releaseRoot = process.env.ZERODEP_CSS_TEST_RELEASE;
        const release = JSON.parse(await readFile(join(releaseRoot, 'manifest.json'), 'utf8'));
        for (const name of ['zerodep-css', 'zerodep-css-svelte']) {
          const pkg = release.packages.find((item) => item.name === name);
          assert(pkg && pkg.file === pkg.file.split(/[\\/]/).at(-1));
          await copyFile(join(releaseRoot, pkg.file), join(directory, pkg.file));
          dependencies[name] = overrides[name] = 'file:./' + pkg.file;
        }
      }
      await writeFile(
        join(directory, 'package.json'),
        JSON.stringify({ private: true, type: 'module', dependencies, pnpm: { overrides } }),
      );
      await writeFile(
        join(directory, 'pnpm-workspace.yaml'),
        'packages: []\nautoInstallPeers: false\nstrictPeerDependencies: true\n',
      );
      // 独立消费项目没有工作区源码别名，显式安装 peer；不执行依赖安装脚本。
      run(['install', '--ignore-scripts', '--no-frozen-lockfile', '--prefer-offline']);
      const installed = await realpath(join(directory, 'node_modules/zerodep-svelte-ui'));
      assert(!installed.toLowerCase().startsWith(packageRoot.toLowerCase()));
      const manifest = JSON.parse(await readFile(join(installed, 'package.json'), 'utf8'));
      assert.equal(manifest.peerDependencies['@lucide/icons'], '^1.48.0');
      assert.equal(manifest.peerDependenciesMeta?.['@lucide/icons']?.optional, undefined);
      const iconSource = await readFile(
        join(installed, 'dist/lib/display/gene/Icon.svelte'),
        'utf8',
      );
      assert.match(iconSource, /bx\(effectiveStrokeWidth\)/);

      await writeFile(
        join(directory, 'Consumer.svelte'),
        `<script lang="ts">
      import { Provider, Icon, darkTheme } from 'zerodep-svelte-ui';
      import { Search } from '@lucide/icons';
      </script>
      <Provider theme={darkTheme} components={{Icon:{sizeMd:'20px'}}}><Icon icon={Search} color="_primary" tokens={{colorPrimary:'purple'}} strokeWidth={1.25} aria-label="搜索" /></Provider>`,
      );
      await writeFile(
        join(directory, 'entry.ts'),
        `import {render} from 'svelte/server';
      import {createServerCssHost,withCssHost} from 'zerodep-css-svelte/server';
      import Consumer from './Consumer.svelte';
      export function run(){const host=createServerCssHost();const body=withCssHost(host,()=>render(Consumer).body);return {body,css:host.cssText()};}`,
      );
      await writeFile(
        join(directory, 'client.ts'),
        `import {mount} from 'svelte';import Consumer from './Consumer.svelte';export const start=(target:HTMLElement)=>mount(Consumer,{target});`,
      );
      await writeFile(
        join(directory, 'types.ts'),
        `import type {ComponentProps} from 'svelte';
      import {Provider,Icon,UiCss,darkTheme,enUSLanguage,usLocale} from 'zerodep-svelte-ui';import {Search} from '@lucide/icons';

      export const provider:ComponentProps<typeof Provider>={css:(readTheme)=>new UiCss(readTheme),theme:darkTheme,lang:enUSLanguage,locale:usLocale,components:{Icon:{sizeMd:'20px'}}};
      // @ts-expect-error 内部 context 设置器不进入公共导出。
      import {provideCss} from 'zerodep-svelte-ui';
      // @ts-expect-error 聚合配置入口已移除。
      import {useConfig} from 'zerodep-svelte-ui';
      // @ts-expect-error 聚合配置类型已移除。
      import type {UiConfig} from 'zerodep-svelte-ui';
      export const icon:ComponentProps<typeof Icon>={icon:Search,size:'_sm',color:'_primary'};
      // @ts-expect-error 不接受任意颜色名称
      export const bad:ComponentProps<typeof Icon>={icon:Search,color:'blue'};`,
      );
      await writeFile(
        join(directory, 'tsconfig.json'),
        JSON.stringify({
          compilerOptions: {
            strict: true,
            noEmit: true,
            skipLibCheck: true,
            module: 'ESNext',
            moduleResolution: 'Bundler',
            target: 'ES2022',
            lib: ['ES2022', 'DOM'],
          },
          include: ['types.ts'],
        }),
      );
      run(['exec', 'tsc', '-p', 'tsconfig.json']);
      await writeFile(
        join(directory, 'verify.mjs'),
        `import assert from 'node:assert/strict';
      import {createServer,build} from 'vite';import {svelte} from '@sveltejs/vite-plugin-svelte';import bindings from 'zerodep-css-svelte/vite';
      for(const enabled of [true,false]){
        const server=await createServer({configFile:false,root:process.cwd(),logLevel:'error',plugins:[...(enabled?[bindings()]:[]),svelte({configFile:false})],server:{middlewareMode:true},ssr:{noExternal:['zerodep-svelte-ui','zerodep-css','zerodep-css-svelte']}});
        try{const entry=await server.ssrLoadModule('/entry.ts');
          if(enabled){
            const result=entry.run();assert(result.body.includes('<svg'));assert(result.body.includes('role="img"'));assert(result.body.includes('<circle'));
            assert(result.css.includes('color:purple;'));assert(result.css.includes('font-size:20px;'));
            const variable=result.css.split('stroke-width:var(')[1]?.split(')')[0];assert(variable);
            assert(result.body.includes(variable+': 1.25;')||result.body.includes(variable+': 1.25"')||result.css.includes(variable+':1.25;'));
          }
          else assert.throws(()=>entry.run(),/bx/);
        }finally{await server.close();}
      }
      await build({configFile:false,root:process.cwd(),logLevel:'error',plugins:[bindings(),svelte({configFile:false})],build:{lib:{entry:'client.ts',formats:['es']}}});
      console.log('tarball public types, SSR, required binding plugin and client build passed');`,
      );
      const output = run(['exec', 'node', 'verify.mjs']);
      assert.match(output, /client build passed/);
    } finally {
      // 只删除本次 mkdtemp 创建的独立消费项目，不清理 pnpm 共享 store。
      const within = relative(tmpdir(), directory);
      assert(
        !isAbsolute(within) && dirname(within) === '.' && within.startsWith('zerodep-ui-consumer-'),
      );
      await rm(directory, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
    }
  },
);
