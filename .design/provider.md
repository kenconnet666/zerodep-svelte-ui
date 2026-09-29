# Provider 与公开入口

Provider 使用 Svelte context 注入三个普通 JS 对象；公共消费入口为 useConfig() 和 useCss()。

## 目录边界

- src/lib 是公开 API 目录。TS、JS 模块的具名导出、默认导出，以及 Svelte 组件和 module script 导出，递归汇总到 src/lib/index.ts。
- index.ts 由 pnpm exports:generate 生成。构建前自动更新，开发 watch 跟随文件新增、删除和改名更新；pnpm exports:check / pnpm check 验证提交中的入口没有遗漏。
- 默认导出按文件名转为 PascalCase；index 模块使用所在目录名。导出重名、无导出模块和非模块文件会报错，不静默跳过。公开类型写在 .ts 文件中。
- 内部 context 设置器和键放在 src/internal。svelte-package 的输入为 src，产物保留 lib/internal 的相对路径；package.json 只公开 dist/lib/index.js，不开放内部子路径。
- Provider 位于 lib/provider/Provider.svelte；lang、locale、theme 分别放语言、地区时区、主题预设与类型。

## 配置对象与继承

- theme: UiTheme，包含 colorScheme、color、fontSize。默认 lightTheme，同时提供 darkTheme；应用可用对象展开创建其他主题。主题展示名称由应用管理，不放入主题对象。
- lang: UiLanguage，包含 code 和通用 messages。默认 zhCNLanguage，另有 enUSLanguage。Provider 容器的 lang 来自该对象。
- locale: UiLocale，包含 code 和显式 IANA timeZone。默认 chinaLocale，另有 usLocale。通过 Intl 格式化日期/数值；不读取服务器或浏览器的默认时区。
- 三个维度独立继承。显式对象整体覆盖，不做隐式深合并；undefined 恢复最近父级，根部恢复默认值。
- context 外层对象固定，getter 读取当前 props 和父配置；子组件保留 config 引用，在模板或 $derived 中读取，支持替换和 Svelte 响应式对象更新。
- 默认预设及其子对象冻结；Provider 不修改用户对象。context 随组件树和 SSR 请求隔离，无全局可变配置。

## 作者与样式

- 根部创建一次 zerodep-css 的 Css 作者，后代复用。css prop 可传入自定义作者，只用于初始化；更换时用 key 重建 Provider。
- 主题直接作为 JS 数据读取，例如 css(s.color.raw(config.theme.color.primary))。不生成 --ui-color/--ui-font-size 变量，不再导出 UiCss、UiColorCss 等旧语义作者。
- Provider 容器提供 color-scheme 与文字颜色。背景、间距等布局由使用者提供。
- class 使用 CssInput。外部 css() 结果放在默认声明后合成一个类，不使用 @layer，不透传普通类名或条件对象。
- 容器的 class/style 只改变 DOM 样式，不修改后代获取的配置对象。需要整个子树使用新的主题值时，传 theme 对象。
- Icon 仍接收语义 size/color，但从主题对象读取实际值。bx 仍由 CSS 适配器管理动态变量，它与主题的数据传递分开。

## SSR 与验证

- SvelteKit 每请求 CSS 宿主负责规则收集与 hydration，Provider 不另建或销毁整页宿主。
- 浏览器验证三个配置对象的继承、覆盖、替换、恢复和时区格式化，以及共享作者、样式组合与规则复用。
- Node SSR 验证并发请求隔离、公开包入口和 bx 初值；真实 tarball 消费验证内部依赖完整且内部设置器没有公开。
- 文档站验证水合后切换、无 JS 首屏和可访问性。完整浏览器与跨平台矩阵由 CI 执行。
