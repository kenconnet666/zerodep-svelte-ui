# 系统主题与组件外观

本库保持 Svelte context + JS 对象 + getter，不使用主题 CSS 变量，不引入 iem。系统主题名称为 light/dark。类型中明确列出字段，没有任意字符串索引签名。

系统 token 的叶子键统一以 `_` 开头，分类名与 themeName 保持原名。数据、类型、作者 getter 和 raw 参数使用同一标识，例如 `theme.space._2xs`、`s.gap._2xs`、`s.gap.raw('_2xs')`。尺寸统一为 `_2xs/_xs/_sm/_md/_lg/_xl/_2xl/_3xl`，各分类按需选取；对象键不混用数字开头的字符串键。旧的无下划线 token 不保留别名。

## token 的归属与使用

系统 token 和组件专用样式都通过已有 CSS 工具生成声明。通用、常用且需要统一定制的外观 token 放入 CSS 工具主题树，优先复用现有分类；组件专用值就近写在组件内部。

| 范围                 | 定义位置                               | 组件使用方式                                                     | 外部定制                    |
| -------------------- | -------------------------------------- | ---------------------------------------------------------------- | --------------------------- |
| 通用或常用外观 token | provider/theme 的主题对象与 UiCss 属性 | 直接使用 s.color._primary、s.fontSize._md 等声明                 | Provider.theme 调整通用主题 |
| 组件专用值           | 组件内部的默认值和 CSS 声明            | 直接使用 s.strokeWidth.raw(strokeWidth) 等属性，默认值由组件确定 | class 传入 CSS 声明覆盖     |

组件级 token 在这里指组件自身确定的样式值，不代表一套公开、可注入的 token 对象。以 Icon 为例，strokeWidth 默认 2、verticalAlign 默认 -0.125em，直接写在 $props()；宽高 1em、线帽 round 等结构样式直接写在模板的 css() 中。无需另建 IconTokens、默认值工厂或覆盖合并器。

class 是统一的样式定制入口，组件把调用方的声明放在默认声明之后组合。同等层叠条件下，外部声明覆盖默认值：

```svelte
<!-- s 来自当前 Provider 的 useCss()，css 从 zerodep-css-svelte 导入。 -->
<Icon icon={Search} class={css(s.fontSize.px(22), s.color._primary, s.strokeWidth.raw(1.5))} />
```

class 定制只改变样式，不修改 Provider 的主题数据。已有直接外观 props 保留，供常用值设置；不为每个内部样式值增加独立 prop。原生 style 的既有行为保持不变。

## 组件外观参数以 CSS 输入类型为准

外观 props 默认使用 `Parameters<UiCss['属性']['raw']>[0]`，同时保留该属性的主题标识补全和原生 CSS 输入。Parameters 接收具体函数类型，返回参数元组，`[0]` 才是第一个参数；`Parameters<UiCss>` 本身不是合法的提取方式。

```ts
import type { UiCss } from 'zerodep-svelte-ui';

type AppearanceProps = {
  size?: Parameters<UiCss['fontSize']['raw']>[0];
  color?: Parameters<UiCss['color']['raw']>[0];
  strokeWidth?: Parameters<UiCss['strokeWidth']['raw']>[0];
  verticalAlign?: Parameters<UiCss['verticalAlign']['raw']>[0];
};
```

组件用自己的 $props() 就近声明默认值，再调用对应 raw()。不要重复抄写 UiCss 的 token 联合类型，也不要为继承输入再建立通用 props 工厂。

### 按需收窄

以下是新组件确有需求时的局部类型示例，不是 Icon 当前 API 的限制：

```ts
import type { UiCss, UiTheme } from 'zerodep-svelte-ui';

type FontSizeInput = Parameters<UiCss['fontSize']['raw']>[0];
// 去掉数字成员（例如原生允许的 0），保留主题标识和 CSS 字符串。
type StringSizeInput = Exclude<FontSizeInput, number>;
// 如果组件只接受主题字号，就明确选出已知主题键。
type ThemeSizeInput = Extract<FontSizeInput, keyof UiTheme['fontSize']>;
type CompactSizeInput = Extract<ThemeSizeInput, '_sm' | '_md'>;
```

不能把 `Exclude<FontSizeInput, 'inherit'>` 当作字符串黑名单：raw() 包含开放 CSS 字符串，inherit 仍可能通过该成员被接受。严格枚举应使用 Extract/主题键白名单；需要禁止某些原始字符串时必须另做运行时校验。Omit 用于删对象属性，不用于删参数联合成员。

### 按需扩展

```ts
type StrokeInput = Parameters<UiCss['strokeWidth']['raw']>[0];
type OptionalStrokeInput = StrokeInput | false;

// 仅对选择了此契约的组件生效：false 表示无描边，先转换，再交给 raw()。
function strokeDeclaration(s: UiCss, value: OptionalStrokeInput): string {
  return s.strokeWidth.raw(value === false ? 0 : value);
}
```

增加类型不等于 raw() 自动懂得新语义。false 是示例中的局部组件语义，不加入系统 token，也不改变当前 Icon（Icon 不接受 false）。只增加确实需要的值和转换，不把这些特例提升为组件配置框架。

新建通用 token 时，同步维护 UiTheme 的下划线叶子键、亮暗预设、UiCss getter/raw() 及文档；已有组件从 raw() 提取类型后会自然获得对应输入。单个组件专用常量无需进入主题树。类型工具语义见 [TypeScript 官方说明](https://www.typescriptlang.org/docs/handbook/utility-types.html)。

## 系统层

参考 Naive UI 的显式状态和尺寸、daisyUI 的前景/背景配对、MUI 的分类主题。具体默认数值是本库的设计选择，并非完整复制任何一家：

- https://github.com/tusen-ai/naive-ui/blob/main/src/_styles/common/light.ts
- https://github.com/tusen-ai/naive-ui/blob/main/src/_styles/common/_common.ts
- https://daisyui.com/docs/utilities/
- https://mui.com/material-ui/customization/theming/

| 数据分类      | 字段与语义                                                                                        | Css 工具例子                                        |
| ------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| color         | _background、_surface、_surfaceHover；_text、_muted、_textDisabled；_border、_divider、_focusRing | s.color._text、s.borderColor._border                |
| color         | _primary/_info/_success/_warning/_danger，每种包括 Hover、Pressed 和 onX 前景色                   | s.backgroundColor._primaryHover、s.color._onPrimary |
| fontFamily    | _sans、_mono                                                                                      | s.fontFamily._sans                                  |
| fontSize      | _xs/_sm/_md/_lg/_xl/_2xl，默认 12/14/16/20/24/32px 对应的 rem                                     | s.fontSize._md                                      |
| fontWeight    | _normal/_medium/_semibold/_bold，400/500/600/700                                                  | s.fontWeight._semibold                              |
| lineHeight    | _tight/_normal/_relaxed，1.25/1.5/1.75                                                            | s.lineHeight._normal                                |
| controlHeight | _xs/_sm/_md/_lg/_xl，22/28/34/40/46px                                                             | s.height._md                                        |
| space         | _2xs/_xs/_sm/_md/_lg/_xl/_2xl/_3xl，2/4/8/12/16/24/32/48px                                        | s.paddingInline._sm、s.gap._md                      |
| radius        | _sm/_md/_lg/_full，4/6/10/9999px                                                                  | s.borderRadius._md                                  |
| borderWidth   | _thin/_thick，1/2px                                                                               | s.borderWidth._thin                                 |
| opacity       | _disabled/_hover/_pressed，0.5/0.08/0.12；_hover/_pressed 供状态遮罩使用                          | s.opacity._disabled                                 |
| shadow        | _sm/_md/_lg，亮暗主题分别配置                                                                     | s.boxShadow._md                                     |
| motion        | duration._fast/_normal/_slow，150/250/350ms；easing._standard/_enter/_exit                        | s.transitionDuration._fast                          |
| zIndex        | _dropdown/_sticky/_modal/_popover/_tooltip/_toast                                                 | s.zIndex._modal                                     |

字号换算基于根字号 16px；使用 rem 的值随根字号变化。控件高度不等于字号。同一档位在不同分类中各有含义。

所有上表对应的作者均支持下划线属性与 raw() 两种入口。数字 token 保持数字，不自动附加 px；原生关键字、单位方法仍可使用。阴影、动效、透明度和层级只有组件显式使用时生效，不是自动行为；组件仍需按实际交互处理减少动效等需求。

Provider 在本级容器应用字体族、字号、字重、行高、文字颜色和 color-scheme。其他 token 由组件使用。系统 theme 仍是完整对象替换；缺省继承父级，根部回退 lightTheme。

## Icon 直接使用系统 CSS

Icon 的四个外观 props 从 UiCss 对应 raw() 提取输入类型，默认值直接放在 Svelte $props() 中：

| prop          | CSS 属性      | 默认值   |
| ------------- | ------------- | -------- |
| size          | fontSize      | _md      |
| color         | color         | inherit  |
| strokeWidth   | strokeWidth   | 2        |
| verticalAlign | verticalAlign | -0.125em |

```svelte
<Provider theme={darkTheme}>
  <Icon icon={Search} size="_xl" color="_primary" />
  <Icon icon={Search} size="18px" color="purple" strokeWidth="3px" verticalAlign="middle" />
</Provider>
```

size 对应 font-size，图标宽高为 1em。系统 _lg 为 20px，_xl 为 24px；Icon 不再将 _lg 映射到 _xl。非零尺寸数字不自动补 px，原始值使用带单位字符串。原始字符串沿用 raw() 的开放输入契约，不保证拒绝 token 拼写错误。

Icon 直接消费本级 Provider 的 UiCss，不创建作者或额外主题 context。主题替换和响应式字段更新由 UiCss 的主题读取函数处理。省略或传 undefined 时恢复 Svelte 默认值；0 仍是有效描边值。

IconTokens、createIconTokens、UiComponentThemes、Provider.components、Icon.tokens 及其合并逻辑已移除，不保留别名。旧的 UiColor/UiSize 限定枚举同时移除，消费端需要 Icon props 类型时使用 ComponentProps<typeof Icon>。class/style 继续作为最终声明覆盖入口。

Icon 的四个外观属性都直接通过对应 raw() 生成声明。描边是普通外观配置，不因文档中的滑块演示就引入 bx 优化或全局关键字分支。bx 留给实际存在高频连续值的场景，按需求单独设计和验证。

## 后续边界

Button 已实现，Input 尚未实现。Button.size 直接复用 UiCss.fontSize.raw() 的输入，默认 _md=1rem，作为统一比例基准；通过 em 联动高度、padding、文字、图标、Loading、间距和圆角，不将 controlHeight 的档位映射到多套组件尺寸。默认基准 16px 时外框高 34px、文字 14px、图标 16px。slotProps 的显式值优先于比例默认值，class 在默认声明之后组合，完整比例与边界见 README 和 /button 文档。

后续组件的外观参数默认从对应 UiCss.raw() 提取，通用或常用外观 token 直接进入 CSS 工具主题树；专用 padding、图标与状态样式在组件内部通过 CSS 工具定义。组件 token 的注册、注入、覆盖和合并不再列为后续建设项。交互状态、键盘或子部件协作需要的 context 按具体行为设计，不承载样式 token 覆盖。
