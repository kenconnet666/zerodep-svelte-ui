# zerodep-svelte-ui

Svelte 5 组件库与直接编写网页的文档站。已实现 Provider、Icon、共享 CSS 作者和配置注入，并具备打包、语言服务与 CI 基础。项目仍保持 private，尚未发布 npm。

## 目录

```text
packages/ui/               组件库（Svelte 源组件、JS 与类型声明）
  src/lib/                 正式源码和公共入口
  test/                    包入口、SSR、浏览器组件与类型测试
apps/docs/                 SvelteKit 静态文档网站
  src/routes/              Svelte 页面与路由
  src/app.css              站点基础样式
scripts/language-services/ 项目内 TypeScript/Svelte MCP 桥
tests/browser/             网站与后续交互示例的浏览器验收
.github/                   CI 和共享安装步骤
.codex/                    可移植配置模板；本机配置不入 Git
```

工作区只包含两个子项目。文档站使用 Svelte 页面，不使用 Markdown 内容管线。组件库按 [Svelte 官方打包方案](https://svelte.dev/docs/kit/packaging)输出 dist；文档站采用 [adapter-static](https://svelte.dev/docs/kit/adapter-static) 预渲染，可放到普通静态服务器。

## 开发

需要 Node 24。pnpm 版本由 packageManager 固定为 10.34.5；依赖版本集中在 pnpm-workspace.yaml。

```sh
pnpm install --frozen-lockfile
pnpm sync
pnpm dev
```

pnpm dev 先构建组件库，再并行监听组件库与启动网站；访问终端打印的本机地址。文档站通过 workspace:* 依赖组件库，正式组件从 packages/ui/src/lib/index.ts 导出后再由页面按包名导入，不配置绕过产物的源码别名。

常用命令：

| 命令                                   | 用途                                        |
| -------------------------------------- | ------------------------------------------- |
| pnpm check                             | Svelte、TypeScript 和测试配置类型检查       |
| pnpm lint                              | ESLint 规则与组件库导入边界检查             |
| pnpm check:package                     | 构建组件库、打包并用 publint 检查 tarball   |
| pnpm build                             | 组件库打包 + 文档静态站构建                 |
| pnpm test                              | 构建后的包入口与 SSR 焦点测试               |
| pnpm test:consumer                     | 独立安装 tarball，检查类型及客户端/SSR 编译 |
| pnpm test:component --project=chromium | 单浏览器组件测试；首次需安装 Chromium       |
| pnpm format / pnpm format:check        | 格式整理 / 只检查                           |
| pnpm pack:ui                           | 构建后打包到 artifacts；不会发布            |
| pnpm test:browser                      | 构建后执行 Playwright；浏览器矩阵通常交 CI  |
| pnpm lsp:setup                         | 生成当前机器的 Codex 配置                   |
| pnpm lsp:verify                        | 验证 TS/Svelte 诊断、补全、悬停、定义和引用 |
| pnpm lsp:inspect <相对文件路径>        | 独立进程内检查指定文件                      |

TypeScript 固定在 6.0.3，因为当前 Svelte 检查器/语言服务的 peer 范围尚未包含 7；不跟随 latest 跨主版本升级。

ESLint 使用 Flat Config，按组件库、文档站和 Node 脚本分别配置环境。组件库禁止导入 SvelteKit 应用模块、文档站或文档站别名；格式仍交给 Prettier。所有新增依赖继续使用 catalog 固定版本，不修改全局工具。

## 组件测试与包检查

组件浏览器测试使用 Vitest Browser Mode、Playwright provider 和 vitest-browser-svelte，配置在 packages/ui/vitest.config.ts。测试使用与消费端一致的 CSS 绑定插件顺序，不依赖文档站路由。

```sh
pnpm exec playwright install chromium
pnpm test:component --project=chromium
```

不传 --project 会运行 Chromium、Firefox、WebKit 三个项目，完整矩阵通常交 CI。组件测试关注独立挂载与交互；现有 Playwright 测试关注文档站导航、水合和消费端集成；Node 测试继续负责包入口和 SSR。

RenderProbe 验证测试基础设施。Provider 和 Icon 另有实例共享、嵌套配置、语义外观、主题切换、键盘/可访问性、规则回收、类型、正式包产物 SSR 和文档站水合用例；test/types 中的正反类型用例随 pnpm check 执行。

pnpm test:consumer 会创建临时项目，从实际 tarball 安装组件库和显式 peer，检查公共类型、SSR、客户端构建，以及缺少绑定插件时的错误。它需要 npm registry 或可用的 pnpm 缓存，结束后自动清理临时项目；普通 pnpm test 不执行这项独立安装。跨仓修复发布前，可以通过 ZERODEP_CSS_TEST_RELEASE 指向 CSS 仓库的 release:pack 产物目录，仅在临时消费者中验证候选 tarball，不修改正式依赖。

pnpm check:package 会重新构建组件库，将实际 tarball 写入根目录 artifacts，再执行 publint --strict；不会发布 npm。pnpm pack:ui 仅打包已有构建产物，也写入根目录 artifacts。正式组件出现后，继续用文档站和消费端测试验证包导出、SSR 与 CSS，不能仅凭包检查通过判定组件可用。

## 已安装的运行时依赖

packages/ui 已显式声明以下 npm 依赖；根目录的 Zod 仍单独用于 MCP 工具，两个用途统一使用 catalog 版本。

| 依赖                    | 当前用途边界                                             |
| ----------------------- | -------------------------------------------------------- |
| @floating-ui/dom        | 为浮层定位预备；焦点、键盘、关闭逻辑与 ARIA 仍需组件实现 |
| zod                     | 为表单和数据校验预备；尚未确定公共表单 API               |
| decimal.js              | 为精确十进制输入和计算预备；尚未确定组件绑定值类型       |
| @internationalized/date | 为日期、日历与时区能力预备；尚未确定日期组件 API         |

安装这些依赖不会自动导出它们，也没有提前实现浮层、表单、数字或日期组件。主题与组件上下文仍优先复用 zerodep-css 和 Svelte 原生能力，具体契约在首个组件设计时确定。

## 图标资源依赖

已安装 Lucide 官方数据包 @lucide/icons 1.48.0，仅由它提供 SVG 结构数据；Icon 的渲染、属性、样式和可访问性由本组件库负责。

组件库将 @lucide/icons 声明为必需的 peer dependency（兼容范围 ^1.48.0），开发时通过 devDependencies 使用 catalog 固定版本。文档站作为消费端，在 dependencies 中显式安装同一版本。未来使用组件库的应用也应显式安装兼容的 @lucide/icons；本仓库的 autoInstallPeers: false 不会强制改变外部应用的包管理器设置。

图标直接使用官方名称，例如 `import { Search } from '@lucide/icons'`，使用写法为 `<Icon icon={Search} />`。不引入框架图标组件包，也不维护全量图标注册表。

## CSS 框架接入

- 组件库已安装 npm 的 zerodep-css、zerodep-css-svelte，均为 0.1.3，包含中文属性、常用值、使用场景、关键字区别和方法调用文档。
- 文档站安装相同版本，并添加 zerodep-css-sveltekit 0.1.3。Vite 中 CSS 绑定插件放在 SvelteKit 前面，支持组件中的显式 bx。
- hooks.server.ts 创建每请求样式宿主，app.html 的占位符接收 SSR 样式；hooks.client.ts 在水合前恢复登记。
- 根布局使用组件库 Provider；src/lib/css.ts 转导出组件库 useCss。页面和组件读取同一个作者实例，首页链接使用 npm CSS 包生成样式。

CSS 作者实例和 SSR 宿主按作用域/请求隔离，没有使用本地兄弟仓库 link。所有消费者都必须启用 zerodep-css-svelte/vite，放在 Svelte/SvelteKit 插件之前。

## Provider

```svelte
<script lang="ts">
  import { Provider, UiCss } from 'zerodep-svelte-ui';
  const appCss = new UiCss();
</script>

<Provider css={appCss} theme="light" locale="zh-CN">
  <Content />
  <Provider theme="dark"><Panel /></Provider>
</Provider>
```

根 Provider 省略 css 时创建一次默认 UiCss；子 Provider 默认复用父实例。theme/locale 响应式继承，undefined 撤销覆盖。css 仅用于初始化，更换实例需用 key 块重建作用域。没有 dir 属性；lang 由 locale 设置。

useCss() 取得当前作者，useConfig() 取得只读的有效配置，均在后代组件初始化时调用。组件 props 默认值直接写在 $props()；size/color 等语义属性由组件映射到 UiCss 属性。自定义主题可继承 UiCss 并覆盖 theme(mode)，自定义作者属性可继承对应的 UiColorCss 等类型。

Provider 提供真实 div 容器、主题变量、color-scheme 与文字颜色，背景和布局由使用者设置。默认规则在 @layer zerodep-ui 中，未分层的外部 CSS 可覆盖。只有显式 theme/css 的内层容器重建主题边界，语言覆盖不会抹掉父级局部 token。网页示例位于 /provider。

## Icon

```svelte
<script lang="ts">
  import { Search } from '@lucide/icons';
  import { Provider, Icon } from 'zerodep-svelte-ui';
</script>

<Provider>
  <Icon icon={Search} />
  <Icon icon={Search} size="lg" color="primary" aria-label="搜索" />
</Provider>
```

icon 必须是 LucideIconData，只通过 `<Icon icon={Search} />` 传入，不接受子组件或 children snippet。size 为 sm/md/lg（默认 md），color 为 inherit/text/muted/primary/success/warning/danger（默认 inherit）。它们映射到注入的 UiCss 属性；Icon 不自行创建作者。strokeWidth 为数值（默认 2），由 bx 编译成 CSS 变量。精确宽高、原始颜色、动画等通过 class/style 设置。

默认图标作为装饰内容隐藏；提供 aria-label 或 aria-labelledby 时自动设置 img 角色，显式 aria-hidden/role 保持优先。图标默认不增加 Tab 停靠点，按钮自身承担名称与交互。SVG 根属性可透传，但 children、width/height、viewBox 和原生 stroke-width 由组件管理。图形数据保持只读，递归子节点使用正确的 SVG 命名空间，内部 key 元数据不输出。网页交互示例位于 /icon。

已安装包的 Vite 依赖 SSR 会使用带缓存查询的 .svelte 文件路径；完整消费链路需要 zerodep-css-svelte 0.1.1 的对应编译修复。不得以跳过插件或只测试工作区源码代替 tarball 验收。

## Codex LSP

执行 pnpm lsp:setup 后，在 Codex 中打开并信任本项目，重载会话以加载 zerodep_ui_lsp。这是 [Codex 项目级配置](https://learn.chatgpt.com/docs/config-file/config-basic)，不会修改全局配置或其他项目服务。

桥接逻辑复用 zerodep-css 已验证的实现并移除了 Vue 路径；源码已放入本仓库，运行不依赖兄弟目录。仅 TypeScript 和 Svelte 官方语言服务负责语义判断。生成的 .codex/config.toml 包含本机 Node/目录路径，被 Git 忽略；换机重新运行 setup。

pnpm lsp:verify 会临时生成错误/正确的 TS 与 Svelte 文件，并往返检查诊断更新、跨文件跳转与补全，最后自动清理。它验证新进程的 MCP 链路；当前 Codex 会话的直连工具必须在重载后另外实测。

## CI 和交付

GitHub Actions 分组并行：

- 类型、ESLint 规则与格式检查。
- Ubuntu / Windows 构建、包入口/SSR、tarball 检查、独立消费端安装和 LSP 验证。
- Chromium / Firefox / WebKit 独立组件测试，以及文档站导航、水合、窄屏、键盘和 axe 无障碍冒烟。
- 构建任务保留 npm tarball 与静态站目录 7 天；浏览器失败时上传报告和 trace。

测试无需仓库密钥。本地只执行相关检查，完整浏览器与耗时场景交 CI。推送不等于远程测试已通过；下一次提交前检查前次结果。

当前 CI 使用 Playwright 管理的桌面浏览器版本。这是现有验证范围，尚未承诺旧版浏览器或移动端最低版本；公共组件发布前需补充支持范围与相应验收。

当前仍有两项工具链提示需要跟进：Vitest 5.0.2 / Vite 8.3.1 会提示 mock 拦截插件的 configureServer 钩子被忽略，已验证的组件用例不使用模块 mock，后续引入模块 mock 前需专项验证并复核上游修复；文档站约 716 kB 的 chunk 提示在基础提交 98532ae 的 CI 中已存在，后续需根据产物分析定位体积来源。本项目没有屏蔽这些提示。

文档站构建目录是 apps/docs/build。默认部署到站点根目录；子路径部署时设置 BASE_PATH，例如 /zerodep-svelte-ui，链接通过 $app/paths 自动适配。目前未部署网站，也未添加发布令牌或发布流程。

## 协同维护与下一步

zerodep-css（通常位于 ../zerodep-css）仍是核心项目。CSS 框架与绑定插件的通用修复回到该仓库，组件和站点改动留在这里，具体分工见 AGENTS.md。

Provider 的作者、继承、编译和 SSR 契约见 [Provider 设计记录](.design/provider.md)。基础站点不是最终视觉设计，Provider 与 Icon 的通过不能代表整个组件库已完成生产验收。后续组件继续沿用相同的作者和配置体系。

发布前仍需确定许可证、首发组件范围、npm 元数据和站点部署目标。这些是尚未开展的发布工作，当前 private 用于防止提前发布。
