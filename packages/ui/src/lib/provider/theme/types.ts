export type UiSize = 'sm' | 'md' | 'lg';
export type UiColor = 'inherit' | 'text' | 'muted' | 'primary' | 'success' | 'warning' | 'danger';

/** 主题是普通 JS 数据；组件读取对象生成声明，不依赖主题 CSS 变量。 */
export interface UiTheme {
  readonly themeName: 'light' | 'dark';
  readonly color: {
    readonly background: string;
    readonly surface: string;
    readonly text: string;
    readonly muted: string;
    readonly primary: string;
    readonly success: string;
    readonly warning: string;
    readonly danger: string;
  };
  readonly fontSize: Readonly<Record<UiSize, string>>;
}
