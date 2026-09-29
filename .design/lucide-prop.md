# Icon 的 lucide 字面量入口

`<Icon lucide="search" />` 是编译时语法，插件将其替换成单个 Lucide 数据导入和 `icon={数据}`。SSR 与客户端使用同一转换，图形同步渲染。已有 `icon={Search}` 保留，动态选择通过 icon 完成。

- 名称类型由 scripts/generate-lucide-types.mjs 读取已安装的 @lucide/icons/dynamic 名称列表，生成本地 lucide-names.ts 中的显式字符串字面量联合 LucideIconName。Icon 不再跨包引用官方的 keyof 动态导入表类型。生成文件纳入 Git，不手工维护；pnpm lucide:check 检查与依赖版本同步。使用官方小写连字符名称；加号是 `plus`，没有自定义 `add` 别名。
- `icon` 与 `lucide` 必须二选一。未经过插件的 lucide 使用明确报错，不在运行时加载全量图标。
- 新增 `zerodep-svelte-ui/vite`，放在 Svelte/SvelteKit 插件之前。CSS 绑定插件仍须启用。
- 支持从包入口导入的 Icon、具名导入别名和命名空间成员。插件使用 Svelte AST，避免修改 HTML、同名本地组件、注释、脚本文本或被模板局部变量遮蔽的组件。
- 支持引号属性和字符串字面量表达式；动态表达式、同时传 icon、带属性 spread 的 lucide 用法在编译时失败。spread 或动态数据使用 icon。
- 为同一文件中的同名图标复用导入，使用无冲突的内部标识符，返回 source map。
- 插件及其依赖只由 /vite 入口加载，组件运行时只导入 Lucide 类型。组件库消费者仍需安装 @lucide/icons。

构建与开发启动会生成类型；pnpm check 先检查已提交类型同步状态，再构建。这样依赖升级遗漏可直接发现。该简化用于减少 WebStorm 的类型解析层次；官方 Svelte LSP 已验证，但不能据此保证 WebStorm 的实际弹窗。

验证覆盖：静态转换与错误定位、别名和局部作用域、单图标构建结果、公开类型、编辑器补全、客户端渲染、SSR、真实 tarball 消费以及缺少插件时的错误。
