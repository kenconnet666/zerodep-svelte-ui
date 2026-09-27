import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';
import docsConfig from './apps/docs/svelte.config.js';
import uiConfig from './packages/ui/svelte.config.js';

export default defineConfig(
  globalIgnores([
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.svelte-kit/**',
    '**/artifacts/**',
    '**/test-results/**',
    '**/playwright-report/**',
    '**/coverage/**',
    '.codex/**',
    '.idea/**',
  ]),
  js.configs.recommended,
  ts.configs.recommended,
  svelte.configs.recommended,
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: { parserOptions: { parser: ts.parser } },
  },
  {
    files: ['packages/ui/src/**/*.{ts,svelte}', 'packages/ui/test/**/*.{ts,svelte}'],
    languageOptions: { globals: globals.browser, parserOptions: { svelteConfig: uiConfig } },
    // 组件可被普通 Svelte 应用消费；应用路由、环境变量和文档站上下文不能进入库。
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '$app/*',
                '$env/*',
                '$lib',
                '$lib/*',
                '@sveltejs/kit',
                '@sveltejs/kit/*',
                '@zerodep-ui/docs',
                '@zerodep-ui/docs/*',
                '**/apps/docs',
                '**/apps/docs/**',
              ],
              message:
                '组件库不得依赖 SvelteKit 应用模块或文档站，请通过 props 或组件库自己的 context 传入。',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['apps/docs/src/**/*.{js,ts,svelte}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { svelteConfig: docsConfig },
    },
    settings: { svelte: { kit: { files: { routes: 'apps/docs/src/routes' } } } },
  },
  {
    files: ['**/*.mjs', '**/*.config.{js,ts}', 'tests/**/*.ts'],
    languageOptions: { globals: globals.node },
  },
  prettier,
  svelte.configs.prettier,
);
