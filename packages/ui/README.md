# zerodep-svelte-ui

Svelte 5 组件库。当前完成工程基础，公共组件 API 尚未开始实现，暂不发布 npm。

- `src/lib/`：可打包的组件与公共入口。
- `test/`：浏览器组件、SSR 和包入口测试；测试夹具不进入产物。
- `test/types/`：随类型检查执行的正反类型用例；公共组件出现后扩展其 API 用例。
- `vitest.config.ts`：真实浏览器组件测试；本地用 `pnpm test:component --project=chromium` 聚焦验证。
- `dist/`：`svelte-package` 生成的 Svelte 源组件、JavaScript 和类型声明，不入 Git。

组件不从文档站反向导入，也不依赖 SvelteKit 的应用状态或路由。
新增组件时，先在此处实现并导出，再由 `apps/docs` 通过包名使用。

已安装 `@floating-ui/dom`、`zod`、`decimal.js`、`@internationalized/date`，版本由根目录 catalog 统一固定。目前仅准备依赖，尚未确定对应组件 API，也没有从公共入口重新导出这些包。

根目录的 `pnpm check:package` 会构建并检查实际 tarball；当前维持 private，不发布 npm。浏览器与类型用例仍使用测试夹具，不能替代正式组件的行为、SSR 和可访问性验收。
