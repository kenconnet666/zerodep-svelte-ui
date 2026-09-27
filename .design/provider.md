# Provider 与组件作者模型设计草案

状态：讨论稿，尚未实现。本文中的 API 名称、默认值和代码示例是建议，不代表现有公共导出。

## 已确认的方向

- 第一个正式组件改为 Provider；Icon 在基础建立后实现。
- Provider 同时向下注入配置，并渲染真实 DOM 作为主题容器。
- 组件库定义自己的 CSS 属性子类和 UiCss 作者类，复用 zerodep-css 的基类与运行时。
- 作者实例由根 Provider 或显式覆盖的局部 Provider 创建/提供。普通组件只读取注入实例，不自行 new，也不回退到全局单例。
- size、color 等组件外观属性接收语义名称，由组件映射到注入的 CSS 属性。
- 普通组件默认值直接声明在 $props() 解构处，不增加全局组件默认值注册表。
- 消费项目必须启用 zerodep-css-svelte/vite，并将其放在 Svelte/SvelteKit 插件之前。不设计无插件兼容分支。
- Icon 使用 `<Icon icon={Search} />`。已安装的 @lucide/icons 仅提供图形数据，组件行为由本库负责。

## 建议的第一版 API

```svelte
<script lang="ts">
  import { Provider, UiCss } from 'zerodep-svelte-ui';

  // 应用根组件实例内创建一次；SSR 时每个请求拥有自己的实例。
  const appCss = new UiCss();
  let theme = $state<'light' | 'dark'>('light');
</script>

<Provider css={appCss} {theme} locale="zh-CN" dir="ltr">
  <AppContent />
</Provider>
```

根 Provider 省略 css 时，内部为这个作用域懒创建一次默认 UiCss。嵌套 Provider 省略 css 时复用父实例，不创建新的默认实例。

```svelte
<Provider css={appCss} theme="light" locale="zh-CN">
  <MainContent />

  <Provider theme="dark">
    <DarkPanel />
  </Provider>

  <Provider locale="en-US" dir="ltr">
    <EnglishPanel />
  </Provider>
</Provider>
```

| 属性                                | 建议类型          | 语义                                                         |
| ----------------------------------- | ----------------- | ------------------------------------------------------------ |
| css                                 | UiCss             | 作用域初始化时提供的作者实例；省略时继承，根部才创建默认实例 |
| theme                               | 'light' \| 'dark' | 主题模式；省略时继承，根部建议默认 light                     |
| locale                              | string            | 语言与格式化区域；省略时继承，根部默认值待定                 |
| dir                                 | 'ltr' \| 'rtl'    | 方向；省略时继承，根部建议默认 ltr                           |
| children                            | Snippet           | Svelte 原生内容插槽                                          |
| class、style、id、data-_、aria-_ 等 | 原生容器属性      | 应用到主题容器；与 Provider 自有属性冲突的字段显式排除       |

第一版建议根元素为 div。暂不增加泛型 as、asChild 或动态标签体系。原生 lang 由 locale 对应，不再同时提供一个可能冲突的独立 lang 输入。locale 不自动推断 dir；调用方需要 RTL 时显式指定。

locale、dir 仍是建议加入的环境配置，语言包与完整翻译系统不属于第一版 Provider。确认功能范围时，可以先保留实际要消费的字段。

## CSS 属性与主题的所有权

UiCss 必须有实际的组件库语义属性，不能只是一个空的 Css 子类。例如：

```ts
import { ColorCss, Css, FontSizeCss } from 'zerodep-css-svelte';

export class UiColorCss extends ColorCss {
  readonly _primary: string = this.raw('var(--ui-color-primary)');
  readonly _text: string = this.raw('var(--ui-color-text)');
  readonly _muted: string = this.raw('var(--ui-color-muted)');
}

export class UiFontSizeCss extends FontSizeCss {
  readonly _sm: string = this.raw('var(--ui-font-size-sm)');
  readonly _md: string = this.raw('var(--ui-font-size-md)');
  readonly _lg: string = this.raw('var(--ui-font-size-lg)');
}

export class UiCss extends Css {
  override readonly color = new UiColorCss();
  override readonly fontSize = new UiFontSizeCss();
}
```

以上命名和 token 集合为示意；正式实现前确定最小完整集合及亮暗默认值。颜色和字号等语义属性保留显式 string 类型，方便派生类覆盖值，而不是被字面量类型锁死。

组件库主题声明也归 packages/ui 所有。Provider 把亮暗主题的变量声明注册到当前 CSS 宿主，并在自己的容器上选择相应主题类。作者对象保持稳定，切换主题只改变容器的主题类，不重建作者对象或批量修改其字段。

应用可以通过 AppCss extends UiCss、属性子类继承和方法覆盖扩展。库组件只依赖 UiCss 已声明的接口；应用增加的任意新字段不会自动变成库组件的公共类型参数，不能靠未经检查的泛型强转宣称类型安全。

组件专用的 Props、状态、选择逻辑和样式仍放在自己的 .svelte 文件。UiCss 只承载共享的作者语义，不收纳整套组件的样式表和行为。

## 生命周期与响应式规则

### CSS 作者

- 一个 Provider 作用域使用一个作者实例。
- 嵌套 Provider 未传 css 时复用父引用；传入 css 时建立局部作者作用域。
- 缺少 Provider 的 useCss/useConfig 明确报错，不在消费者中隐式创建作者。
- 第一版建议 css 为作用域初始化参数，挂载后保持身份稳定。替换整套作者类需显式重建该 Provider 作用域；运行时主题切换使用 theme。
- 若后续要求不重建子树而替换整个 css 对象，必须重新设计并验证响应式作者访问协议，不能把现有 createCssContext 当作已支持。

### 公共配置

- useConfig 返回一个身份稳定的只读视图。
- theme、locale、dir 的有效值由当前 props 和父配置派生；父配置变更时，未覆盖的子字段继续更新。
- undefined 表示继承；显式传入的值表示覆盖。null 不作为通用“重置”值。
- 嵌套继承逐字段处理，不使用通用深合并。父级配置不被子级修改。
- 不把父值在初始化时展开复制到一个普通对象中，否则继承链会冻结。
- 组件读取 config.locale 等属性或在 $derived 中使用；不把会变化的配置解构成一次性快照。

### 普通组件 Props

```svelte
<script lang="ts">
  const s = useCss();

  let { icon, size = 'md', color = 'inherit', ...rest }: Props = $props();

  const sizeStyle = $derived(s.fontSize[`_${size}`]);
  const colorStyle = $derived(color === 'inherit' ? s.color.inherit : s.color[`_${color}`]);
</script>
```

例子仅说明映射和默认值位置，Props 中的语义联合类型需与实际属性集合对应。Svelte 默认值在属性省略或为 undefined 时生效；null 不会触发默认值。依赖其他 props 的计算值使用 $derived，固定默认值直接写在 $props() 中。

## 主题容器与嵌套规则

- Provider 渲染一个真实容器，不默认使用 display: contents。
- 容器负责主题变量、color-scheme、lang/dir 与调用方 class/style；不预置页面高度、布局、间距或滚动策略。
- 是否同时设置容器前景色/背景色，需要在视觉默认值中明确；不能把主题变量配置误称为已自动处理页面背景。
- 没有 css/theme 覆盖的嵌套 Provider 继承父 DOM 变量，不重复声明一整套默认 palette，以免意外抹掉父级局部定制。
- 显式 theme 覆盖只作用当前子树，兄弟不受影响；切换回 undefined 恢复继承。
- 显式 css 覆盖时，需要用该作者对应的主题定义建立局部主题边界；模式仍可继承父配置。
- 首版不承诺 system 模式、持久化或自动读取 localStorage。若加入 system，必须同时确定 SSR 初值与客户端更新协议。
- 将 DOM portal 到容器外会改变 CSS 变量和 dir/lang 的物理继承。后续浮层组件必须确定挂载目标或主题桥接策略，Provider 阶段不宣称该问题已解决。

## CSS 合成与覆盖

- css(...) 处理声明和已登记样式类；Svelte class 负责普通类名、数组和条件对象。
- Provider 自带类与用户 class 在模板中组合，不能把 class 字符串顺序当作优先级。
- 建议组件库默认规则使用统一的 CSS layer，让普通未分层的用户规则可覆盖；layer 名称及公开覆盖契约仍待确认。
- 主题 token 与组件规则分开管理。父变量的继承、当前容器变量的重定义和选择器的层叠不是同一件事。
- 动态结构通过原生条件和 $derived 处理；连续值需要变量传输时使用 bx。自定义作者方法仍走框架支持的运行时路径，不假定全部能进入编译器快路径。

## 编译、SSR 与生命周期边界

- 所有消费项目必须安装并启用 zerodep-css-svelte/vite；文档和验收采用同一配置。
- 当前 svelte-package 仅运行 vitePreprocess，会保留 bx。按已确认的强制插件约定，消费端必须继续转换库产物中的 .svelte；正式验收要从 tarball 安装后的 node_modules 路径验证这条链路。
- 通用绑定编译器或适配器的问题回到 zerodep-css；Provider、UiCss 和语义配置属于 packages/ui。
- SvelteKit hooks 负责每请求样式宿主和 hydration 清单。Provider 复用当前宿主，不另建共享全局宿主。
- SSR 的作者实例按请求/Provider 实例隔离。模块级仅放类定义、上下文键和纯声明，不存放请求配置或登记后的类名。
- Provider 卸载不调用 disposeCss 销毁整页共享宿主；组件自己的绑定由适配器生命周期回收。
- locale/dir/主题的 SSR 输出必须与首次水合一致，不能在构造默认值时读取 navigator、localStorage 或 matchMedia。
- nonce、样式插入位置和宿主初始化继续由应用集成负责，避免嵌套 Provider 改写共享宿主配置。

## 建议的文件职责

| 位置                                | 职责                                           |
| ----------------------------------- | ---------------------------------------------- |
| packages/ui/src/lib/css.ts          | UiCss、必要的属性子类及语义类型                |
| packages/ui/src/lib/context.ts      | 作用域配置与 CSS 注入/读取协议                 |
| packages/ui/src/lib/Provider.svelte | Props、继承解析、生命周期和主题容器            |
| packages/ui/src/lib/index.ts        | 经过确认的公共导出                             |
| apps/docs                           | 使用真实包产物展示默认配置、嵌套覆盖与主题切换 |

这些文件尚未创建。先保持少量内聚模块，不为每个 token 或字段拆文件。

## 验收场景

1. 根部默认作者仅创建一次；多个后代读取同一引用；嵌套未覆盖时不重复创建。
2. 自定义作者及属性子类确实影响下游组件；局部作者只影响当前子树。
3. theme/locale/dir 单项覆盖、父级更新、撤销覆盖和兄弟隔离正确。
4. 容器变量、color-scheme、lang/dir、class/style 及原生属性的实际 DOM 结果符合约定。
5. 连续值更新与反复切换不无界增加规则；卸载后不会误删其他 Provider 的样式。
6. 并发 SSR 请求之间作者、配置和样式清单不串；缺少 Provider 或宿主时有明确错误。
7. SSR 首屏、hydration 和嵌套主题一致；不只检查客户端挂载。
8. 公共类型拒绝无效主题、方向、语义名称和配置字段，children 使用原生 Snippet。
9. 消费端通过实际打包产物和强制编译插件工作，不依赖源码别名或本机 link。

本地只运行改动相关的类型、SSR 和单浏览器焦点验证；完整浏览器与跨平台矩阵交 CI。

## 当前证据与未实现项

在临时探针中，3 个后代共享 1 个 UiCss 实例；语义 size 切换有效，bx 描边值和 CSS 变量主题切换不会继续增加规则；缺少提供者时明确抛错；正反类型用例通过。临时文件、浏览器和服务已清理。

这些只验证基础机制，不能替代正式 Provider 的嵌套覆盖、公开类型、SSR hydration 和 tarball 验收。Provider、UiCss、主题 palette 与其公共 API 均尚未实现。
