# zerodep-svelte-ui

Svelte 5 组件库与直接编写网页的文档站。已实现 Provider、Icon、Text，以及 Ripple、原生按钮反馈接入和焦点样式基础，并具备打包、语言服务与 CI。已提供 Button、Loading、Checkbox、Select、Slider，以及 Flex、Grid、Container、Divider、Card。项目仍保持 private，尚未发布 npm。

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

安装这些依赖不会自动导出它们，也没有提前实现浮层、表单、数字或日期组件。样式统一使用 zerodep-css；通用 token 直接复用，组件专用值就近定义，通过 class 定制。交互行为优先使用 Svelte 原生能力。

## 图标资源依赖

已安装 Lucide 官方数据包 @lucide/icons 1.48.0，仅由它提供 SVG 结构数据；Icon 的渲染、属性、样式和可访问性由本组件库负责。

组件库将 @lucide/icons 声明为必需的 peer dependency（兼容范围 ^1.48.0），开发时通过 devDependencies 使用 catalog 固定版本。文档站作为消费端，在 dependencies 中显式安装同一版本。未来使用组件库的应用也应显式安装兼容的 @lucide/icons；本仓库的 autoInstallPeers: false 不会强制改变外部应用的包管理器设置。

图标直接使用官方名称，例如 `import { Search } from '@lucide/icons'`，使用写法为 `<Icon icon={Search} />`。不引入框架图标组件包，也不维护全量图标注册表。

## CSS 框架接入

- 组件库已安装 npm 的 zerodep-css、zerodep-css-svelte，均为 0.2.0，包含中文属性、常用值、使用场景、关键字区别和方法调用文档。
- 文档站安装相同版本，并添加 zerodep-css-sveltekit 0.2.0。Vite 中 CSS 绑定插件放在 SvelteKit 前面，支持组件中的显式 bx。
- hooks.server.ts 创建每请求样式宿主，app.html 的占位符接收 SSR 样式；hooks.client.ts 在水合前恢复登记。
- 根布局使用组件库 Provider；src/lib/css.ts 转导出组件库 useCss。页面和组件读取同一个作者实例，首页链接使用 npm CSS 包生成样式。

CSS 作者实例和 SSR 宿主按作用域/请求隔离，没有使用本地兄弟仓库 link。所有消费者都必须启用 zerodep-css-svelte/vite，放在 Svelte/SvelteKit 插件之前。

## 注入主题值

UiKeywords 继承核心 SystemKeywords，将 UiTheme 的颜色、间距、动效等分类映射为 CSS 属性值。UiCss 使用 Css<UiKeywords>，原来的 23 个 UiXxxCss 属性子类已移除。每个 Provider 只创建一次作者和值视图；主题替换与响应式字段更新在读取时生效。

```ts
const s = useCss();
s.color._primary; // 完整声明，例如 color:#1d4ed8;
s.color.raw('_primary'); // 相同声明
s.keywords.color._primary; // 当前主题的原始颜色值
s.width.px(20); // 原生方法仍可用
```

这些读取放在模板或 $derived 中；初始化时保存字符串仍是快照。原生属性/关键字沿用核心文档，主题颜色的说明来自 UiTheme，映射后仍显示在 hover 与补全详情中。

## 样式与 token

通用、常用且需要统一定制的外观 token 进入 UiCss 对应的主题分类，各组件直接使用 s.color._primary、s.fontSize._md 等属性。优先复用已有 token；组件专用值直接写在组件内部，例如 Icon 的描边默认 2、垂直对齐默认 -0.125em。props 默认值用 Svelte $props() 声明，固定结构样式直接写在 css() 中。

组件外观 props 以 CSS 工具的输入类型为准，统一采用 `Parameters<UiCss['属性']['raw']>[0]`；它包含该属性支持的主题标识和原生 CSS 输入，不另外维护一套 size/color 枚举：

```ts
import type { UiCss } from 'zerodep-svelte-ui';

type AppearanceProps = {
  size?: Parameters<UiCss['fontSize']['raw']>[0];
  color?: Parameters<UiCss['color']['raw']>[0];
};
```

只有组件确实需要不同语义时，才在本组件临时用 Exclude/Extract 收窄或用联合类型增加输入；新增值必须转换成 CSS 工具能处理的值。完整示例与开放字符串的边界见 [组件参数约定](.design/theme-tokens.md#组件外观参数以-css-输入类型为准)。这是一条通用组件设计规则，不只适用于 Icon。

外部样式定制使用 class: CssInput，组件将外部声明放在默认声明之后组合。无需额外的组件 token 注册表、context、tokens prop、Provider.components 或覆盖合并器，也不为后续组件预留这些设施。Provider.theme 用于调整通用主题，class 用于定制具体组件的样式，两者各自负责明确的范围。

## Provider

```svelte
<script lang="ts">
  import { Provider, lightTheme, darkTheme, zhCNLanguage, chinaLocale } from 'zerodep-svelte-ui';
</script>

<Provider theme={lightTheme} lang={zhCNLanguage} locale={chinaLocale}>
  <Content />
  <Provider theme={darkTheme}><Panel /></Provider>
</Provider>
```

Provider 位于 src/lib/provider/Provider.svelte，三个子目录分别提供 JS 配置对象：theme 包含 lightTheme/darkTheme，lang 包含 zhCNLanguage/enUSLanguage，locale 包含 chinaLocale/usLocale（地区代码及 IANA 时区）。theme/lang/locale 独立响应式继承，显式对象整体替换，undefined 撤销覆盖。容器 lang 取自语言对象，地区和时区交给 Intl 格式化，不依赖机器默认时区。

必须在消费组件外包裹 Provider；组件、useCss()、useTheme()、useLocale() 和 useLang() 缺少 Provider 时直接报错，不创建隐式默认作者。同一个组件的初始化代码不能读取自己模板中 Provider 提供的 context。每个 Provider 创建独立 UiCss，传入当前主题的读取函数；useCss() 返回带主题语义属性的工具，useTheme()、useLocale()、useLang() 分别返回对应的只读对象。可选 css prop 为 (readTheme) => new AppCss(readTheme)，创建函数向下继承，但实例不共享；只用于初始化，更换函数需用 key 块重建。

主题通过 Svelte context 向下传递，并注入 UiCss。组件在模板或 $derived 中使用 s.color._primary、s.backgroundColor._surface、s.fontSize._md；s.theme 提供原始主题对象。语义属性由 getter 读取当前主题，不使用主题 CSS 变量。UiCss 仍可继承以复用样式方法，UiKeywords 提供系统值与主题值，原生属性和 raw() 仍可使用。系统 token 的叶子键统一带下划线，分类名保持原名；例如 theme.color._primary、theme.space._2xs。不保留无下划线别名。自定义主题使用普通对象，例如 `{ ...lightTheme, color: { ...lightTheme.color, _primary: 'purple' } }`。默认预设冻结，用户对象不会被 Provider 修改。容器提供 color-scheme 与文字颜色，背景和布局由调用者设置；class/style 不会改变后代读取的配置数据。网页示例位于 /provider。

Provider 和 Icon 的 class 使用 CssInput，优先传入同一 CSS 宿主的 css(...) 结果；也接受声明字符串、嵌套数组及 false/null/undefined 条件空项。组件最终使用一个组合类，同等层叠条件下外部声明覆盖默认值。普通类名、多类名字符串和条件对象不作为原生 class 透传；style 仍是原生内联样式。SSR 中先在当前请求宿主登记外部类，客户端沿用同一宿主的水合清单。

```svelte
<!-- s 来自所在 Provider 的 useCss()，css 从 zerodep-css-svelte 导入。 -->
<Icon icon={Search} class={css(s.width.px(30), s.color.red)} />
```

## Icon

```svelte
<script lang="ts">
  import { Search } from '@lucide/icons';
  import { Provider, Icon } from 'zerodep-svelte-ui';
</script>

<Provider>
  <Icon icon={Search} />
  <Icon icon={Search} size="_lg" color="_primary" aria-label="搜索" />
</Provider>
```

icon 必须是 LucideIconData，只通过 `<Icon icon={Search} />` 传入，不接受子组件或 children snippet。size、color、strokeWidth、verticalAlign 直接使用 UiCss 对应 raw() 的输入类型，默认值在 $props() 中分别为 _md、inherit、2、-0.125em。支持全部系统字号/颜色 token 和原始 CSS 值，如 size="18px"、color="#7e22ce"、strokeWidth="3px"、verticalAlign="middle"。size 对应 font-size，图标宽高为 1em；_lg 是 20px，_xl 是 24px，不再做 Icon 专属尺寸映射。原始字符串沿用 raw() 契约，不进行 token 拼写校验，非零尺寸数字不自动补 px。

Icon 复用最近 Provider 的作者，主题更新直接由 UiCss 响应。没有 IconTokens、tokens prop 或 Provider.components。四个外观属性均直接生成 CSS 声明，描边按普通外观配置处理，不使用 bx 或关键字判断分支。class/style 继续提供最终样式定制。

默认图标作为装饰内容隐藏；提供 aria-label 或 aria-labelledby 时自动设置 img 角色，显式 aria-hidden/role 保持优先。图标默认不增加 Tab 停靠点，按钮自身承担名称与交互。SVG 根属性可透传，但 children、width/height、viewBox 和原生 stroke-width 由组件管理。图形数据保持只读，递归子节点使用正确的 SVG 命名空间，内部 key 元数据不输出。网页交互示例位于 /icon。

已安装包的 Vite 依赖 SSR 会使用带缓存查询的 .svelte 文件路径；完整消费链路需要 zerodep-css-svelte 0.1.1 的对应编译修复。不得以跳过插件或只测试工作区源码代替 tarball 验收。

## 按钮准备与文字基础

- Text 默认渲染 span，也支持 p、strong、em、code 和标题等原生文本标签。外观 props 从对应 UiCss.raw() 提取类型；不传时保留原生样式，class 在最后组合。内容使用 children snippet，不提供富文本 HTML、复制或自动省略。
- Ripple 是装饰覆盖层，提供 start(origin?)、stop(id?)、cancel()；颜色/透明度复用 CSS 输入类型。扩散 250ms、淡出 150ms，快速点击至少显示 80ms，最多 4 个波纹；持续按压保留到释放或取消。减少动效、禁用和卸载会清理资源。
- rippleButton(() => ripple, () => disabled) 是原生 button 的 Svelte attachment；观察 pointerdown/up/cancel、移出、失焦和无指针 click，不合成点击、不拦截键盘、不管理业务回调或表单。原生 disabled、fieldset 和 aria-disabled 都会阻止反馈；loading 的业务拦截仍由按钮负责。
- focusRing(s) 只返回 :focus-visible CSS，复用 _focusRing，不引入焦点管理器。原生 Enter/Space/Tab 保持浏览器行为。

Ripple 父容器需要定位和尺寸，建议建立局部 stacking context；覆盖层自己裁剪圆角，焦点环不会被整个按钮的 overflow:hidden 裁掉。createRippleController 在 src/lib/tool/ripple-controller.ts 公开导出，独占空覆盖层新增的波纹子节点，调用方在挂载后创建并在卸载时 destroy()；Ripple 已通过 attachment 管理这些操作。几何值写入内联样式，不按点击坐标登记 CSS 类。没有引入新依赖或 bx。

文档与真实原生按钮示例见 /text、/ripple。该按钮只是验证夹具，不是新增的 Button API。几何定位支持未旋转的矩形与普通缩放；不承诺任意旋转/倾斜宿主的坐标还原。

通用 `context<T>()` 从包入口导出，模块顶层创建一次，组件初始化时使用 `provide(value)` 注入、`optional()` 可选读取或 `use()` 必须读取。每次创建使用独立键，缺失值仅在 use() 时报错；值仍由 Svelte 按组件树隔离。Provider 自身的 context 实例和四个 use hook 就近放在 Provider.svelte 的 module script，实例不导出，不再保留独立 provider-context 文件与 provideCss 包装。

## Button 与 Loading

Button 根节点长期固定为 `<button>`，默认 `type="button"`，不提供 as、链接按钮或替换根组件。复用 Text、Icon、Loading、Ripple；`slotProps.label/icon/loading/ripple` 转发底层外观、class、原生 style，状态和内容由 Button 管理。

`size` 复用 `Parameters<UiCss['fontSize']['raw']>[0]`，默认 `_md=1rem`。尺寸基准 B 默认 16px：高度 2.125B=34px（含边框），左右内边距 0.75B=12px，边框 0.0625B=1px，圆角 0.375B=6px，文字 0.875B=14px、行高 1.5，图标/Loading 1B=16px，图文间距 0.5B=8px。size 默认等比联动；slotProps 显式值优先，根 class 最后组合。不额外维护尺寸档位映射。单独覆盖字号后需保证外框足够高。

原生 disabled（包括 fieldset）阻止激活。受控 loading 保留焦点和原内容占位，通过 aria-disabled/aria-busy 表达状态，同时拦截点击回调和默认提交；不会追踪 Promise。表单仍需在 onsubmit 中管理绕过点击的提交路径，SSR 首屏的点击守卫需要水合后生效。Loading 单独使用时提供当前语言的状态名称，嵌入 Button 时为装饰；减少动效时停止旋转。

## Checkbox、Select 与 Slider

三个组件位于 src/lib/input/gene，复用 Text、Icon、focusRing、UiCss 和 Svelte 原生双向绑定。当前系统 token 足够，组件专用比例在组件内定义，没有新增主题分类、状态框架或依赖。

- Checkbox：bind:checked、bind:indeterminate、defaultChecked；默认复选框 16px、文字 14px、间距 8px。内部为原生 checkbox，保留 Space、required、标签点击和表单能力；半选不改变表单提交值，其图形在水合后设置。
- Select：原生单选，children 放 option/optgroup，bind:value 保留选项值类型，支持 defaultValue、禁用选项及分组。默认外框 192×34px、文字 14px，箭头复用 Icon；不提供搜索、多选或可替换弹层，弹出列表由系统管理。
- Slider：单滑块水平 range，bind:value 为数值，支持 min/max/step、defaultValue（省略初值时从 min 开始）、原生 input/change 和键盘交互。默认宽 192px、输入高 24px、滑块 16px、轨道 4px。showValue 复用 Text，formatValue 同时用于数值文本和 aria-valuetext；数值变化不会生成新 CSS 类。程序化传值应符合边界和步长；当前无双滑块、垂直方向或刻度标签组件。

上述默认尺寸按根字号 16px 换算。size 使用 UiCss.fontSize.raw() 的输入，默认 _md=1rem，并通过 em 联动。顶层 class/style 作用于外层，其他原生属性/事件转发到 input/select；slotProps.input/select 转发 class/style，slotProps.label/icon/value 转发对应底层组件的外观，显式值优先。form.reset() 恢复默认值并同步绑定；fieldset 禁用保持原生效果。

文档站 /controls 提供完整表单、主题、尺寸、半选、禁用和重置演示；Icon/Text/Provider/Button/Ripple 页的控制区已实际使用这些组件。后续滚动容器按半透明覆盖式滚动条设计，显隐不挤占内容、不改变布局；该滚动容器尚未实现，不对原生 Select 的系统弹出列表作此承诺。

兼容边界：Svelte 5.57.0 在本机 Chromium 中，真实重置按钮触发的 reset 即使被表单取消，绑定仍可能先恢复默认值；原生 input 与 Slider 对照均可复现。需要条件取消时在触发按钮的 onclick 中 preventDefault，或使用 type="button" 判断后再 form.reset()，不在 UI 内复制绑定框架。已测试该方式；升级 Svelte 后应复核原生/组件对照，确认取消 reset 不再改变绑定后移除此说明。

## 布局与 Card

Flex、Grid、Container、Divider 放在 src/lib/layout/gene，Card 放在 src/lib/display/gene。均要求 Provider，外观参数直接使用 UiCss 对应 raw() 输入，class 最后组合，原生 style/属性继续透传；没有新增依赖、断点对象或组件专用主题配置。

- Flex：默认 row/nowrap/stretch/flex-start，gap=_md（12px）。Grid：默认单列 minmax(0,1fr)、gap=_md，columns/rows 直接写 CSS。根节点允许收缩，不批量改子项的最小尺寸或字号。
- Container：100% 宽度、自动居中，maxWidth 默认 72rem，包含左右各 _xl（24px）的内边距；根字号 16px 时外框 1152px、内容 1104px。文档站用 1148px 保持内容上限 1100px。
- Divider：默认水平、_divider 颜色、_thin（1px）单侧边框、零 margin。竖线依赖横向 Flex 的交叉轴或显式高度。语义为 separator，decorative 隐藏纯视觉分隔。
- Card：复用 Flex、Text、Divider，默认每个存在的区域独立 padding=_lg（16px）、radius=_lg（10px）、1px 边框、无阴影。title/description、children、actions、footer 组织内容，缺省区域不生成空盒子。标题默认 span，文档层级通过 slotProps.title.as 指定；divided 启用装饰分隔线。

Card.slotProps.header/actions/footer 转发 Flex；title/description 转发 Text；body 转发 div 属性与 CssInput；divider 转发颜色、粗细和 class。显式配置优先。Card 不主动裁剪溢出、不滚动、不添加可点击语义；长正文按需设置换行或后续组合 ScrollArea。

文档站 /layout 提供自适应/固定列、窄屏、深色主题、分区和键盘示例。首页使用 Grid+Card，站点宽度使用 Container，各演示控制区使用 Flex，Icon/Text/Provider/表单预览复用 Card，并移除了对应的重复布局 CSS。ScrollArea、Demo、CodeBlock 留待下一批。

## 公共导出与目录

`packages/ui/src/lib` 中的所有模块都进入公共入口 `src/lib/index.ts`；不公开的实现放到 `src/internal` 等其他目录。组件默认导出按文件名转为 PascalCase，TS/JS 的具名与默认导出、Svelte module script 的具名导出均自动汇总，重名会报错。公开类型使用 .ts 文件或组件的 module script，静态资源可通过显式模块包装导出。

- `pnpm exports:generate`：重新生成入口，新增、删除或改名模块后使用。
- `pnpm exports:check`：只检查同步状态，不修改文件；已纳入 `pnpm check`。
- 构建自动生成，开发模式自动监听目录；不要手工维护生成文件。

打包输入为 src，内部依赖保留在 dist/internal，公开入口为 dist/lib/index.js。包的 exports 只公开根入口，内部模块不提供消费端子路径。

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

Provider 的作者、继承、编译和 SSR 契约见 [Provider 设计记录](.design/provider.md)。基础站点不是最终视觉设计，Provider 与 Icon 的通过不能代表整个组件库已完成生产验收。后续组件复用同一 CSS 作者和通用 token，专用样式在组件内部定义，外部定制通过 class 完成。

发布前仍需确定许可证、首发组件范围、npm 元数据和站点部署目标。这些是尚未开展的发布工作，当前 private 用于防止提前发布。

Firefox 组件测试暂时串行执行文件，避免多页面并行时真实键盘输入受到焦点干扰；跟踪 https://github.com/vitest-dev/vitest/issues/7916 ，待所用版本在 CI 的并行键盘测试稳定后恢复。

系统 token 分类与默认值见 [主题设计](.design/theme-tokens.md)。Icon 位于 packages/ui/src/lib/display/gene/Icon.svelte，公开导入仍是 import { Icon } from 'zerodep-svelte-ui'。组件专用样式就近定义，不建设组件 token 覆盖框架。
