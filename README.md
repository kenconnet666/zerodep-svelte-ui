# zerodep-svelte-ui

Svelte 5 组件库与直接编写网页的文档站。当前完成开发、打包、语言服务和 CI 基础，尚未实现公共组件或发布 npm。

## 目录

```text
packages/ui/               组件库（Svelte 源组件、JS 与类型声明）
  src/lib/                 正式源码和公共入口
  test/                    包入口、SSR 与后续组件测试
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

| 命令                            | 用途                                        |
| ------------------------------- | ------------------------------------------- |
| pnpm check                      | Svelte、TypeScript 和测试配置类型检查       |
| pnpm build                      | 组件库打包 + 文档静态站构建                 |
| pnpm test                       | 构建后的包入口与 SSR 焦点测试               |
| pnpm format / pnpm format:check | 格式整理 / 只检查                           |
| pnpm pack:ui                    | 构建后打包到 artifacts；不会发布            |
| pnpm test:browser               | 构建后执行 Playwright；浏览器矩阵通常交 CI  |
| pnpm lsp:setup                  | 生成当前机器的 Codex 配置                   |
| pnpm lsp:verify                 | 验证 TS/Svelte 诊断、补全、悬停、定义和引用 |
| pnpm lsp:inspect <相对文件路径> | 独立进程内检查指定文件                      |

TypeScript 固定在 6.0.3，因为当前 Svelte 检查器/语言服务的 peer 范围尚未包含 7；不跟随 latest 跨主版本升级。

## CSS 框架接入

- 组件库已安装 npm 的 zerodep-css、zerodep-css-svelte，均为 0.1.0。
- 文档站安装相同版本，并添加 zerodep-css-sveltekit 0.1.0。Vite 中 CSS 绑定插件放在 SvelteKit 前面，支持后续组件中的显式 bx。
- hooks.server.ts 创建每请求样式宿主，app.html 的占位符接收 SSR 样式；hooks.client.ts 在水合前恢复登记。
- src/lib/css.ts 仅创建文档站的上下文键，根布局每次实例化 Css。首页链接实际使用 npm 包生成样式，构建与浏览器验收可覆盖这条接入链路。

当前没有把 CSS 作者实例或 SSR 宿主做成全局单例，也没有使用本地兄弟仓库 link。组件库自身的主题/提供者 API 留待首个组件设计时确定。

## Codex LSP

执行 pnpm lsp:setup 后，在 Codex 中打开并信任本项目，重载会话以加载 zerodep_ui_lsp。这是 [Codex 项目级配置](https://learn.chatgpt.com/docs/config-file/config-basic)，不会修改全局配置或其他项目服务。

桥接逻辑复用 zerodep-css 已验证的实现并移除了 Vue 路径；源码已放入本仓库，运行不依赖兄弟目录。仅 TypeScript 和 Svelte 官方语言服务负责语义判断。生成的 .codex/config.toml 包含本机 Node/目录路径，被 Git 忽略；换机重新运行 setup。

pnpm lsp:verify 会临时生成错误/正确的 TS 与 Svelte 文件，并往返检查诊断更新、跨文件跳转与补全，最后自动清理。它验证新进程的 MCP 链路；当前 Codex 会话的直连工具必须在重载后另外实测。

## CI 和交付

GitHub Actions 分组并行：

- 类型与格式检查。
- Ubuntu / Windows 构建、包入口/SSR、打包和 LSP 验证。
- Chromium / Firefox / WebKit 导航、水合、窄屏、键盘和 axe 无障碍冒烟。
- 构建任务保留 npm tarball 与静态站目录 7 天；浏览器失败时上传报告和 trace。

测试无需仓库密钥。本地只执行相关检查，完整浏览器与耗时场景交 CI。推送不等于远程测试已通过；下一次提交前检查前次结果。

文档站构建目录是 apps/docs/build。默认部署到站点根目录；子路径部署时设置 BASE_PATH，例如 /zerodep-svelte-ui，链接通过 $app/paths 自动适配。目前未部署网站，也未添加发布令牌或发布流程。

## 协同维护与下一步

zerodep-css（通常位于 ../zerodep-css）仍是核心项目。CSS 框架与绑定插件的通用修复回到该仓库，组件和站点改动留在这里，具体分工见 AGENTS.md。

下一步讨论首个组件的使用示例与 API、主题与组件上下文，然后以一个完整组件同时验证库产物、网页示例、键盘、SSR 和浏览器行为。基础站点不是最终视觉设计；当前不以测试夹具充当产品组件。

发布前仍需确定许可证、首发组件范围、npm 元数据和站点部署目标。这些是尚未开展的发布工作，当前 private 用于防止提前发布。
