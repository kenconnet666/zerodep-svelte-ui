# 系统主题与组件外观

本库保持 Svelte context + JS 对象 + getter，不使用主题 CSS 变量，不引入 iem。系统主题名称为 light/dark。类型中明确列出字段，没有任意字符串索引签名。

系统 token 的叶子键统一以 `_` 开头，分类名与 themeName 保持原名。数据、类型、作者 getter 和 raw 参数使用同一标识，例如 `theme.space._2xs`、`s.gap._2xs`、`s.gap.raw('_2xs')`。尺寸统一为 `_2xs/_xs/_sm/_md/_lg/_xl/_2xl/_3xl`，各分类按需选取；对象键不混用数字开头的字符串键。旧的无下划线 token 不保留别名。

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

Button/Input 尚未实现。后续先讨论系统 token 与直接 CSS props 能覆盖的需求，再决定是否存在真正需要组件专属配置的行为。不预设通用组件 token 覆盖体系、variants、递归 peers 或 DeepPartial 合并器。
