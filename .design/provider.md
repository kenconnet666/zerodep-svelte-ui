# Provider 与组件作者模型

Provider、UiCss、注入协议和 Icon 已实现。本文记录采用的契约。

## 作者与配置

- Provider 渲染 div 主题容器，支持 css、theme、locale、children 及适用的原生属性。没有 dir 配置，lang 由 locale 控制。
- 根部省略 css 时创建一次 UiCss；嵌套省略时直接复用父实例。普通组件只调用 useCss，不自行 new 或退回全局实例。
- UiCss 通过属性子类定义语义颜色、背景和字号。应用可继承 UiCss、UiColorCss、UiBackgroundColorCss、UiFontSizeCss；覆盖 theme(mode) 时可在 super.theme(mode) 后追加 token。
- css 是作用域初始化值，挂载后保持身份稳定。更换作者需用 Svelte key 块重建 Provider；直接更换会明确报错。
- useConfig 返回身份稳定的只读视图，theme/locale 逐字段响应式继承，undefined 恢复继承。消费者读取 config.theme/config.locale，不解构成一次性快照。
- 根默认 theme='light'、locale='zh-CN'，不提供语言包加载或翻译系统。

## 主题容器

- 主题只支持 light/dark，切换容器类而不更换作者对象。
- 根部、显式 css 或显式 theme 建立主题边界。仅覆盖 locale 的内层容器不重置父级变量或文字颜色。
- 容器提供 token、color-scheme 和文字颜色；背景通过 class/style 或 UiCss.backgroundColor 选择，不设置页面高度、布局、间距和滚动策略。
- 默认规则使用原生 @layer zerodep-ui，未分层的用户规则可覆盖，不依赖 class 属性的排列顺序。
- 原生 class 支持字符串、数组和条件对象；css(...) 的声明输入与外部 class 分别处理。
- Portal 移出容器会改变变量的物理继承，后续浮层需确定挂载或桥接策略。

## 普通组件

- 默认值留在组件 $props() 中，不增加组件默认值注册表。
- size/color 接收语义名称，映射到注入的作者属性，例如 s.fontSize._md、s.color._primary。
- 组件专用状态、Props、样式和分支放在 .svelte 文件，真正共享后再拆分。
- 动态结构用模板或 $derived；连续值需要变量传输时使用 bx，不承诺自定义作者方法都进入编译器快路径。

## 编译与 SSR

- 所有消费者必须启用 zerodep-css-svelte/vite，放在 Svelte/SvelteKit 插件前。
- svelte-package 保留 bx，消费端必须转换包内 .svelte；包含 bx 的组件要经过真实 tarball 消费验证。
- 编译器、作者 API 和适配器问题归 zerodep-css；Provider 和 UiCss 属于本库。
- SvelteKit hooks 创建每请求 CSS 宿主并恢复水合清单。Provider 复用该宿主，不重新创建或在卸载时 dispose 整页宿主。
- 作者和配置按请求/Provider 隔离。模块级只保留类、上下文键和纯声明。
- 暂不提供 system 主题、存储持久化或运行时更换作者实例。

## 文件职责与验证

- css.ts：共享语义属性、类型和主题声明。
- context.ts：只读配置和作者注入，CSS 适配器绑定所有者使用同一实例。
- Provider.svelte：Props、继承、生命周期和主题容器。
- 文档站从正式产物导入，用 Provider 提供作者，不创建第二套文档专属上下文键。

浏览器用例覆盖共享实例、父级更新、覆盖及撤销、自定义属性类、变量继承、规则数量与卸载隔离。正式包产物的 Node SSR 用例覆盖并发请求及缺少上下文/宿主的错误；文档站用例覆盖水合、无 JavaScript 首屏和可访问性。类型用例覆盖语义值、只读配置和不支持的 dir/lang 属性。

本地只执行相关焦点验证；完整浏览器与跨平台矩阵交 CI。后续组件仍需自己的行为验收。
