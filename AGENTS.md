# zerodep-svelte-ui 协作要求

## 目标和边界

- 这是面向生产使用的 Svelte 组件库和文档网站，不是研究探针集合。基础搭建完成不等于组件库已生产可用，交付时明确实现范围与验证边界。
- pnpm 工作区只包含两个子项目：`packages/ui` 负责组件库，`apps/docs` 负责文档网站。文档内容直接写 Svelte 页面和交互示例，不引入 Markdown、MDX、mdsvex 或文档生成框架。
- `packages/ui/src/lib` 是公开 API 目录，所有模块都从 `src/lib/index.ts` 导出；入口由 `pnpm exports:generate` 自动维护，不手写。不公开的实现放在 `src/internal` 等其他目录。Provider 放在 `src/lib/provider`，lang/locale/theme 分别存放语言、地区时区和主题对象。
- Provider 通过 Svelte context 注入 JS 配置对象，主题不依赖 CSS 变量。消费代码在模板或派生表达式中读取配置，保证对象替换与嵌套继承能响应更新。
- theme、locale、lang 使用独立 context 注入，通过 useTheme()、useLocale()、useLang() 返回各自只读对象；不再提供聚合的 UiConfig/useConfig。
- 组件必须在 Provider 后代中使用，缺失时直接报错，不在组件内创建默认作者。Provider 将主题读取函数传给 UiCss；组件优先使用 s.color._primary、s.fontSize._md 等语义属性。每个 Provider 创建独立作者，css prop 接收创建函数，嵌套继承创建函数而不是共享主题作者实例。
- 系统 token 的叶子键、主题声明及组件主题参数统一带下划线；分类名和普通 props 保持原名。主题数据也使用 color._primary、space._2xs，不保留无下划线别名。尺寸键统一使用 _2xs/_xs/_sm/_md/_lg/_xl/_2xl/_3xl，不混用数字开头的字符串键。声明示例如 s.color._primary、s.color.raw('_primary')、color="_primary"、size="_md"；原生 CSS 关键字如 inherit 保持原名。Icon 的外观 props 从 UiCss 对应 raw() 提取输入类型，不自行维护另一套主题标识。
- token 统一通过 CSS 工具生成声明：通用 token 由 UiCss 提供，各组件直接复用；组件专用值和默认样式直接写在组件内部，props 默认值在 Svelte $props() 中就近声明，不建立独立的组件 token 对象、注册表、context、Provider.components、tokens prop 或覆盖合并器。外部样式定制使用 class: CssInput，外部声明在默认声明之后组合；不再为组件 token 覆盖预留基础设施。
- 系统 token 按颜色、排版、控件高度、间距、圆角、边框、透明度、阴影、动效和层级分类。Icon 的 size/color/strokeWidth/verticalAlign 直接使用对应 CSS 属性。普通外观配置不预先使用 bx；只有实际需要高频连续更新时才引入，不由演示方式推断需求。组件交互状态需要的 context 与样式 token 配置分开。
- `C:\Users\lionheart\WebstormProjects\zerodep-css` 同样是持续维护的核心项目，当前通常位于本仓库的相邻目录 `../zerodep-css`。有需要时可以继续完善，不能为了绕开问题而在 UI 内复制一套 CSS 框架。
- 改动应落在真正拥有该职责的仓库和文件：CSS 作者 API、生成器、绑定编译器及框架适配属于 zerodep-css；组件行为、组件 API、可访问性属于本仓库的 packages/ui；展示、示例、站点导航属于 apps/docs。先读目标仓库的 AGENTS.md，再修改并分别验证、提交和推送。
- 跨仓库使用已发布版本或可复现的工作区接入。不要把绝对路径、临时 link 或只在本机存在的补丁留成正式依赖。修复 CSS 包后，发布及升级消费版本需按当次授权范围执行。
- 两个子项目当前均保持 private；没有完成组件和发布验收前不发布 npm。名称 zerodep-svelte-ui 尚不代表已拥有 npm 包名。

## 设计与维护

- 追求简洁、灵活、自然的体验。每次实现前先想：是否能更简单、更易懂、更易用？性能、抽象层次和功能数量都不能替代可读性。
- 代码应能由人直接理解和修改。使用明确的状态、所有权和生命周期；不用隐藏副作用或复杂类型技巧维持表面简洁。
- 保留适当中文注释，重点解释不明显的原因、取舍、兼容边界和清理责任，不逐行复述代码。
- 遇到问题先定位或复现，再搜索官方资料和成熟方案。参考之后判断是否适合本项目的 Svelte、SSR、构建与依赖环境，不能未经分析直接照搬。
- 新增能力前先检查已有依赖、工具、组件和原生 API 是否能复用。不要为了一个小需求引入整套体系，也不要重复实现已经合适的能力。
- 主动整理文件职责、目录归属、命名和重复代码。组件专用状态、类型和样式优先就近；确实共享后再拆分，不机械拆成大量小文件。
- 公共 API 命名一致，避免含糊缩写、同义入口和无必要的包装。优先 Svelte 5 原生能力与 HTML 语义；默认值就近声明。
- Icon 支持 icon={数据} 与 lucide="官方名称" 二选一；lucide 通过 zerodep-svelte-ui/vite 编译为按需导入，动态选择继续使用 icon。名称类型直接复用 LucideIconName，不在浏览器加载全量图标表。编译插件从 /vite 子路径导出，不进入 src/lib 根入口。
- 通用组件不得反向依赖文档站，也不得依赖 SvelteKit 的应用路由和状态。文档站通过包名使用组件库，不能用源码别名掩盖产物问题。
- 临时方案必须在代码就近说明原因和限制，并在 README 的待完善项记录退出条件。下一阶段主动检查和替换，不能以“以后优化”掩盖未完成的生产行为。
- 样式复用已发布的 zerodep-css / zerodep-css-svelte，文档站额外使用 zerodep-css-sveltekit；版本统一在 catalog 固定。基础阶段不提前确定复杂组件、主题或表单 API；有重要取舍时给出使用示例再讨论。

## 工具与验证

- 使用 Node 24、package.json 指定的 pnpm 和 pnpm-lock.yaml。共享版本集中在 pnpm-workspace.yaml catalog；包间依赖使用 workspace:*，不混用 npm/yarn 锁文件。
- 不升级全局工具，不修改全局 Codex 配置。项目 LSP 使用本仓库开发依赖，执行 pnpm lsp:setup 生成被 Git 忽略的本机 .codex/config.toml。
- 新机器运行 pnpm install --frozen-lockfile、pnpm sync、pnpm lsp:setup。信任并重新打开此项目后核对 MCP 直连；配置存在不等于工具已经可用。
- MCP、插件和工具以当前会话实际暴露的能力为准。优先使用适合任务且已验证可用的工具；凭据只经环境变量传递，不输出、不提交。
- 本地只做改动相关的诊断和焦点测试。基础配置变更运行 pnpm check，LSP 修改运行 pnpm lsp:verify。完整浏览器矩阵、跨平台、性能及长期压力由远程 CI 执行。
- 组件新增后补充对应交互、键盘/可访问性、类型和必要 SSR 测试；测试应验证行为与用户场景，避免只重复实现。不要以空测试、跳过失败或固定等待伪造通过。
- pnpm build 先生成组件库产物，再生成文档静态站。dist、build、.svelte-kit 不入 Git。只清理本次创建且确认无用的测试文件、进程和报告，使用 finally 保证回收，不碰其他项目的服务。

## Git 与交付

- Git 提交、PR 标题及说明使用中文，按可审阅的小阶段提交。通常从 main 创建 codex/ 前缀分支，基础初始化可直接建立 main。
- 每次完成提交后推送当前远程分支。不要强推或覆盖他人的改动；不同仓库分开提交并记录关联。
- 推送后不空等、不轮询 CI；下次提交前检查前一次运行，优先修复失败。交付明确区分本地已验证、远程待运行和未实现能力。
- 使用最小权限的 CI。测试不需要发布令牌；构建产物可作为后续部署输入，未经用户指定不擅自发布包或部署站点。
