# 系统主题与组件 token

本库保持 Svelte context + JS 对象 + getter，不使用主题 CSS 变量，不引入 iem。系统主题名称为 light/dark。类型中明确列出字段，没有任意字符串索引签名。

## 系统层

参考 Naive UI 的显式状态和尺寸、daisyUI 的前景/背景配对、MUI 的分类主题。具体默认数值是本库的设计选择，并非完整复制任何一家：

- https://github.com/tusen-ai/naive-ui/blob/main/src/_styles/common/light.ts
- https://github.com/tusen-ai/naive-ui/blob/main/src/_styles/common/_common.ts
- https://daisyui.com/docs/utilities/
- https://mui.com/material-ui/customization/theming/

| 数据分类      | 字段与语义                                                                               | Css 工具例子                                        |
| ------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------- |
| color         | background、surface、surfaceHover；text、muted、textDisabled；border、divider、focusRing | s.color._text、s.borderColor._border                |
| color         | primary/info/success/warning/danger，每种包括 Hover、Pressed 和 onX 前景色               | s.backgroundColor._primaryHover、s.color._onPrimary |
| fontFamily    | sans、mono                                                                               | s.fontFamily._sans                                  |
| fontSize      | xs/sm/md/lg/xl/2xl，默认 12/14/16/20/24/32px 对应的 rem                                  | s.fontSize._md                                      |
| fontWeight    | normal/medium/semibold/bold，400/500/600/700                                             | s.fontWeight._semibold                              |
| lineHeight    | tight/normal/relaxed，1.25/1.5/1.75                                                      | s.lineHeight._normal                                |
| controlHeight | xs/sm/md/lg/xl，22/28/34/40/46px                                                         | s.height._md                                        |
| space         | 2xs/xs/sm/md/lg/xl/2xl/3xl，2/4/8/12/16/24/32/48px                                       | s.paddingInline._sm、s.gap._md                      |
| radius        | sm/md/lg/full，4/6/10/9999px                                                             | s.borderRadius._md                                  |
| borderWidth   | thin/thick，1/2px                                                                        | s.borderWidth._thin                                 |
| opacity       | disabled/hover/pressed，0.5/0.08/0.12；hover/pressed 供状态遮罩使用                      | s.opacity._disabled                                 |
| shadow        | sm/md/lg，亮暗主题分别配置                                                               | s.boxShadow._md                                     |
| motion        | duration.fast/normal/slow，150/250/350ms；easing.standard/enter/exit                     | s.transitionDuration._fast                          |
| zIndex        | dropdown/sticky/modal/popover/tooltip/toast                                              | s.zIndex._modal                                     |

字号换算基于根字号 16px；使用 rem 的值随根字号变化。控件高度不等于字号。同一档位在不同分类中各有含义。

所有上表对应的作者均支持下划线属性与 raw() 两种入口。数字 token 保持数字，不自动附加 px；原生关键字、单位方法仍可使用。阴影、动效、透明度和层级只有组件显式使用时生效，不是自动行为；组件仍需按实际交互处理减少动效等需求。

Provider 在本级容器应用字体族、字号、字重、行高、文字颜色和 color-scheme。其他 token 由组件使用。系统 theme 仍是完整对象替换；缺省继承父级，根部回退 lightTheme。

## 组件层

当前实现的组件映射只有 Icon。UiComponentThemes 是类型入口，Provider 仅 type-only 引用 IconTokens，不加载 Icon 组件。

```svelte
<Provider theme={darkTheme} components={{ Icon: { sizeMd: '20px' } }}>
  <Icon icon={Search} color="_primary" />
  <Icon icon={Search} tokens={{ sizeMd: '24px', colorPrimary: 'purple' }} />
</Provider>
```

覆盖顺序为：本级系统主题派生默认值 → 外层 Provider 覆盖 → 内层 Provider 覆盖 → 当前实例 tokens。只按字段浅合并，undefined 不覆盖，0/空字符串仍是显式值。默认值和用户对象都不会被修改。

Provider 向下传递覆盖项，不传递按父主题解析的完整默认 token。内层切换 darkTheme 后，未覆盖颜色必须重新取暗色默认值；显式覆盖则继续继承。Svelte 的 $derived 跟踪对象替换和代理字段更新。

IconTokens 包括 sizeSm/Md/Lg、colorText/colorMuted/colorTextDisabled/colorPrimary/colorInfo/colorSuccess/colorWarning/colorDanger、strokeWidth、verticalAlign。图标默认大小维持 14/16/24px，large 取系统 fontSize.xl；系统 fontSize.lg 现在是 20px。显式 strokeWidth prop 优先于组件描边 token；class/style 仍是最终样式定制入口，不修改 token 数据。

Icon 位于 src/lib/display/gene/Icon.svelte，token 定义就在同目录 icon-theme.ts。它是没有 children 插槽的叶子组件，只消费 Provider 注入的组件配置，不增加不可使用的 useIconTheme()。后续复合组件需要子部件时再增加组件专属 context，不能共享其他组件的键。组件复用 Provider 的 Css 实例，不为每个 Icon 构造完整作者。

## 后续边界

Button/Input 尚未实现；下一步以两者的共享高度、独立 padding/图标尺寸作为组件 token 的第二个落地点。不要先加入 variants、任意样式回调、递归 peers 或通用 DeepPartial 合并器。
