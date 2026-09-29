export type UiSize = '_sm' | '_md' | '_lg';
export type UiColor =
  | 'inherit'
  | '_text'
  | '_muted'
  | '_textDisabled'
  | '_primary'
  | '_info'
  | '_success'
  | '_warning'
  | '_danger';

/** 主题是普通 JS 数据；组件读取对象生成声明，不依赖主题 CSS 变量。 */
export interface UiTheme {
  readonly themeName: 'light' | 'dark';
  readonly color: {
    readonly background: string;
    readonly surface: string;
    readonly surfaceHover: string;
    readonly text: string;
    readonly muted: string;
    readonly textDisabled: string;
    readonly border: string;
    readonly divider: string;
    readonly focusRing: string;
    readonly primary: string;
    readonly primaryHover: string;
    readonly primaryPressed: string;
    readonly onPrimary: string;
    readonly info: string;
    readonly infoHover: string;
    readonly infoPressed: string;
    readonly onInfo: string;
    readonly success: string;
    readonly successHover: string;
    readonly successPressed: string;
    readonly onSuccess: string;
    readonly warning: string;
    readonly warningHover: string;
    readonly warningPressed: string;
    readonly onWarning: string;
    readonly danger: string;
    readonly dangerHover: string;
    readonly dangerPressed: string;
    readonly onDanger: string;
  };
  readonly fontFamily: Readonly<Record<'sans' | 'mono', string>>;
  readonly fontSize: Readonly<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl', string>>;
  readonly fontWeight: Readonly<Record<'normal' | 'medium' | 'semibold' | 'bold', number>>;
  readonly lineHeight: Readonly<Record<'tight' | 'normal' | 'relaxed', number>>;
  /** 控件高度与字号分开；组件选择相同档位时可以复用高度。 */
  readonly controlHeight: Readonly<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', string>>;
  readonly space: Readonly<
    Record<'2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl', string>
  >;
  readonly radius: Readonly<Record<'sm' | 'md' | 'lg' | 'full', string>>;
  readonly borderWidth: Readonly<Record<'thin' | 'thick', string>>;
  readonly opacity: Readonly<Record<'disabled' | 'hover' | 'pressed', number>>;
  readonly shadow: Readonly<Record<'sm' | 'md' | 'lg', string>>;
  readonly motion: {
    readonly duration: Readonly<Record<'fast' | 'normal' | 'slow', string>>;
    readonly easing: Readonly<Record<'standard' | 'enter' | 'exit', string>>;
  };
  readonly zIndex: Readonly<
    Record<'dropdown' | 'sticky' | 'modal' | 'popover' | 'tooltip' | 'toast', number>
  >;
}
