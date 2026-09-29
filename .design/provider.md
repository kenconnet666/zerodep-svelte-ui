# Provider 与公开入口

Provider 使用 Svelte context 注入三个普通 JS 对象；主题、地区、语言使用独立 context 键分别注入，公共消费入口为 useTheme()、useLocale()、useLang() 和 useCss()。

## 目录边界

- src/lib 是公开 API 目录。TS、JS 模块的具名导出、默认导出，以及 Svelte 组件和 module script 导出，递归汇总到 src/lib/index.ts。
- index.ts 由 pnpm exports:generate 生成。构建前自动更新，开发 watch 跟随文件新增、删除和改名更新；pnpm exports:check / pnpm check 验证提交中的入口没有遗漏。
- 默认导出按文件名转为 PascalCase；index 模块使用所在目录名。导出重名、无导出模块和非模块文件会报错，不静默跳过。公开类型写在 .ts 文件中。
- 内部 context 设置器和键放在 src/internal。svelte-package 的输入为 src，产物保留 lib/internal 的相对路径；package.json 只公开 dist/lib/index.js，不开放内部子路径。
- Provider 位于 lib/provider/Provider.svelte；lang、locale、theme 分别放语言、地区时区、主题预设与类型。

## 配置对象与继承

- theme: UiTheme，包含 themeName 及颜色、排版、控件高度、间距、圆角、边框、透明度、阴影、动效、层级 token。themeName 为 light/dark，默认 lightTheme，同时提供 darkTheme；应用可用对象展开创建其他主题。品牌主题的展示名称由应用管理。
- lang: UiLanguage，languageName 明确限定为 'zh-CN' | 'en-US'，另含通用 messages。默认 zhCNLanguage，另有 enUSLanguage。Provider 容器的 lang 来自该对象。
- locale: UiLocale，localeName 明确限定为 'zh-CN' | 'en-US'，另含显式 IANA timeZone。默认 chinaLocale，另有 usLocale。通过 Intl 格式化日期/数值；不读取服务器或浏览器的默认时区。
- 三个维度独立继承。显式对象整体覆盖，不做隐式深合并；undefined 恢复最近父级，根部恢复默认值。
- 三个 context 对象引用分别固定，字段 getter 读取当前 props 和对应父对象；子组件保留 theme、locale、lang 引用，在模板或 $derived 中读取属性，支持替换和 Svelte 响应式对象更新。初始化时解构字段会形成快照。
- 默认预设及其子对象冻结；Provider 不修改用户对象。context 随组件树和 SSR 请求隔离，无全局可变配置。

## 作者与样式

- 每个 Provider 创建独立 UiCss，同一 Provider 内的后代复用。css prop 接收 (readTheme) => new AppCss(readTheme)，创建函数通过 createCss 向下继承，但实例不共享；只用于初始化，更换时用 key 重建 Provider。创建函数必须返回新实例，不能复用单例。
- 主题读取函数传入 UiCss，语义属性通过 getter 生成当前主题声明，例如 css(s.color._primary, s.fontSize._md)。s.theme 保留原始主题类型；UiCss 和各主题属性类复用原生 Css 继承机制，可继续扩展。不生成 --ui-color/--ui-font-size 变量。
- Provider 容器提供 color-scheme、基础字体排版与文字颜色。背景、间距等布局由使用者提供。
- class 使用 CssInput。外部 css() 结果放在默认声明后合成一个类，不使用 @layer，不透传普通类名或条件对象。
- 容器的 class/style 只改变 DOM 样式，不修改后代获取的配置对象。需要整个子树使用新的主题值时，传 theme 对象。
- Icon 的主题 size/color 参数直接使用下划线标识，通过 raw() 消费主题声明；inherit 保持原生 CSS 继承。Icon 四个外观属性均直接使用 raw()，不使用 bx。

## SSR 与验证

- SvelteKit 每请求 CSS 宿主负责规则收集与 hydration，Provider 不另建或销毁整页宿主。
- 浏览器验证三个配置对象的继承、覆盖、替换、恢复和时区格式化，以及作用域作者隔离、创建函数继承、样式组合与规则复用。
- Node SSR 验证并发请求隔离、公开包入口和 Icon 的直接 CSS 声明；真实 tarball 消费验证内部依赖完整且内部设置器没有公开。
- 文档站验证水合后切换、无 JS 首屏和可访问性。完整浏览器与跨平台矩阵由 CI 执行。

## 必须提供上下文

所有消费组件及 useCss()/useTheme()/useLocale()/useLang() 必须位于 Provider 后代中；缺失时统一抛出明确错误，不做默认作者回退。根 Provider 可以没有父级，并提供默认主题、语言与地区；只有 Provider 处理默认值。SSR 与浏览器使用相同约束。

主题声明统一使用下划线：s.color._primary 与 s.color.raw('_primary') 等价；背景色与字号同理。只解析完整的已知主题标识，原生 CSS 值继续由基础 raw() 处理。主题数据对象中的 color._primary、fontSize._md 与声明同名，不再剥离下划线；Icon 的主题参数同样带下划线，如 color="_primary"、size="_md"。

Provider 负责通用主题、语言、地区以及 CSS 作者的作用域，不承担组件 token 配置。通用 token 由 UiCss 提供，各组件直接消费；组件专用值和默认 CSS 声明写在组件内部，外部定制通过 class: CssInput 完成。Icon 的四个外观 props 直接交给对应 raw()，默认值写在 $props()。不建立组件 token 注册表、context、覆盖合并器或 Provider.components。详见 [主题设计](theme-tokens.md)。
