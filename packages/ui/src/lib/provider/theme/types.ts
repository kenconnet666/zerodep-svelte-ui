/** 主题是普通 JS 数据；叶子 token 键统一带下划线，分类名保持原名。组件读取对象生成声明，不依赖主题 CSS 变量。 */
export interface UiTheme {
  readonly themeName: 'light' | 'dark';
  readonly color: {
    /** 页面底色。 */
    readonly _background: string;
    /** 卡片、面板等表面底色。 */
    readonly _surface: string;
    /** 表面悬停底色。 */
    readonly _surfaceHover: string;
    /** 主要文字颜色。 */
    readonly _text: string;
    /** 次要说明文字颜色。 */
    readonly _muted: string;
    /** 禁用文字颜色。 */
    readonly _textDisabled: string;
    /** 常规边框颜色。 */
    readonly _border: string;
    /** 分隔线颜色。 */
    readonly _divider: string;
    /** 键盘焦点轮廓颜色。 */
    readonly _focusRing: string;
    /** 主操作颜色；由当前 Provider 的亮色、暗色或品牌主题提供。 */
    readonly _primary: string;
    /** 主操作悬停颜色。 */
    readonly _primaryHover: string;
    /** 主操作按下颜色。 */
    readonly _primaryPressed: string;
    /** 主操作实色背景上的前景色。 */
    readonly _onPrimary: string;
    /** 信息状态颜色。 */
    readonly _info: string;
    /** 信息状态悬停颜色。 */
    readonly _infoHover: string;
    /** 信息状态按下颜色。 */
    readonly _infoPressed: string;
    /** 信息状态实色背景上的前景色。 */
    readonly _onInfo: string;
    /** 成功状态颜色。 */
    readonly _success: string;
    /** 成功状态悬停颜色。 */
    readonly _successHover: string;
    /** 成功状态按下颜色。 */
    readonly _successPressed: string;
    /** 成功状态实色背景上的前景色。 */
    readonly _onSuccess: string;
    /** 警告状态颜色。 */
    readonly _warning: string;
    /** 警告状态悬停颜色。 */
    readonly _warningHover: string;
    /** 警告状态按下颜色。 */
    readonly _warningPressed: string;
    /** 警告状态实色背景上的前景色。 */
    readonly _onWarning: string;
    /** 危险或错误状态颜色。 */
    readonly _danger: string;
    /** 危险状态悬停颜色。 */
    readonly _dangerHover: string;
    /** 危险状态按下颜色。 */
    readonly _dangerPressed: string;
    /** 危险状态实色背景上的前景色。 */
    readonly _onDanger: string;
  };
  readonly fontFamily: Readonly<Record<'_sans' | '_mono', string>>;
  readonly fontSize: Readonly<Record<'_xs' | '_sm' | '_md' | '_lg' | '_xl' | '_2xl', string>>;
  readonly fontWeight: Readonly<Record<'_normal' | '_medium' | '_semibold' | '_bold', number>>;
  readonly lineHeight: Readonly<Record<'_tight' | '_normal' | '_relaxed', number>>;
  /** 控件高度与字号分开；组件选择相同档位时可以复用高度。 */
  readonly controlHeight: Readonly<Record<'_xs' | '_sm' | '_md' | '_lg' | '_xl', string>>;
  readonly space: Readonly<
    Record<'_2xs' | '_xs' | '_sm' | '_md' | '_lg' | '_xl' | '_2xl' | '_3xl', string>
  >;
  readonly radius: Readonly<Record<'_sm' | '_md' | '_lg' | '_full', string>>;
  readonly borderWidth: Readonly<Record<'_thin' | '_thick', string>>;
  readonly opacity: Readonly<Record<'_disabled' | '_hover' | '_pressed', number>>;
  readonly shadow: Readonly<Record<'_sm' | '_md' | '_lg', string>>;
  readonly motion: {
    readonly duration: Readonly<Record<'_fast' | '_normal' | '_slow', string>>;
    readonly easing: Readonly<Record<'_standard' | '_enter' | '_exit', string>>;
  };
  readonly zIndex: Readonly<
    Record<'_dropdown' | '_sticky' | '_modal' | '_popover' | '_tooltip' | '_toast', number>
  >;
}
