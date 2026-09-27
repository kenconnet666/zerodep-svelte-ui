# zerodep-svelte-ui

Svelte 5 组件库。当前完成工程基础，公共组件 API 尚未开始实现，暂不发布 npm。

- `src/lib/`：可打包的组件与公共入口。
- `test/`：组件、SSR 和包入口测试；测试夹具不进入产物。
- `dist/`：`svelte-package` 生成的 Svelte 源组件、JavaScript 和类型声明，不入 Git。

组件不从文档站反向导入，也不依赖 SvelteKit 的应用状态或路由。
新增组件时，先在此处实现并导出，再由 `apps/docs` 通过包名使用。
