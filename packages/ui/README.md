# zerodep-svelte-ui

Svelte 5 组件库。已提供 Provider、Icon、UiCss、useCss 与 useConfig，暂不发布 npm。

- `src/lib/`：可打包的组件与公共入口。
- `test/`：浏览器组件、SSR 和包入口测试；测试夹具不进入产物。
- `test/types/`：随类型检查执行的正反类型用例；公共组件出现后扩展其 API 用例。
- `vitest.config.ts`：真实浏览器组件测试；本地用 `pnpm test:component --project=chromium` 聚焦验证。
- `dist/`：`svelte-package` 生成的 Svelte 源组件、JavaScript 和类型声明，不入 Git。

组件不从文档站反向导入，也不依赖 SvelteKit 的应用状态或路由。
新增组件时，先在此处实现并导出，再由 `apps/docs` 通过包名使用。

已安装 `@floating-ui/dom`、`zod`、`decimal.js`、`@internationalized/date`，版本由根目录 catalog 统一固定。目前仅准备依赖，尚未确定对应组件 API，也没有从公共入口重新导出这些包。

`Provider` 注入自定义 CSS 作者与公共配置，同时提供真实主题容器。普通组件读取同一作用域实例，语义外观属性映射到注入的 CSS 属性，默认值直接写在 `$props()` 中。消费项目必须启用 `zerodep-css-svelte/vite`。完整边界见根目录 `.design/provider.md`。

Provider 支持 css、theme（light/dark）、locale 与原生容器属性。css 为初始化值；theme/locale 可动态继承和覆盖。根默认值为新 UiCss、light、zh-CN；没有 dir 属性。默认容器只提供主题变量、文字颜色和 color-scheme，背景与布局交给调用方。

`Icon` 使用 `<Icon icon={Search} />`。size 为 sm/md/lg，color 为 inherit/text/muted/primary/success/warning/danger，strokeWidth 默认 2。语义属性来自注入的作者，连续描边值使用 bx；消费端必须启用编译插件。默认装饰图标隐藏，提供 aria-label/aria-labelledby 时生成 img 角色。`@lucide/icons` 是必需 peer，Lucide 仅提供 SVG 结构数据。

根目录的 `pnpm check:package` 会构建并检查实际 tarball，`pnpm test:consumer` 会创建独立安装的消费项目。当前维持 private，不发布 npm。测试覆盖实际 Provider/Icon 的行为、类型、SSR、键盘与可访问性；这些结果不代表后续组件已完成。
