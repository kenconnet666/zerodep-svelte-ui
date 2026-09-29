/** 主题是普通 JS 数据；叶子 token 键统一带下划线，分类名保持原名。组件读取对象生成声明，不依赖主题 CSS 变量。 */
export interface UiTheme {
  readonly themeName: 'light' | 'dark';
  readonly color: {
    readonly _background: string;
    readonly _surface: string;
    readonly _surfaceHover: string;
    readonly _text: string;
    readonly _muted: string;
    readonly _textDisabled: string;
    readonly _border: string;
    readonly _divider: string;
    readonly _focusRing: string;
    readonly _primary: string;
    readonly _primaryHover: string;
    readonly _primaryPressed: string;
    readonly _onPrimary: string;
    readonly _info: string;
    readonly _infoHover: string;
    readonly _infoPressed: string;
    readonly _onInfo: string;
    readonly _success: string;
    readonly _successHover: string;
    readonly _successPressed: string;
    readonly _onSuccess: string;
    readonly _warning: string;
    readonly _warningHover: string;
    readonly _warningPressed: string;
    readonly _onWarning: string;
    readonly _danger: string;
    readonly _dangerHover: string;
    readonly _dangerPressed: string;
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
