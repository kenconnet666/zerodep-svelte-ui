import { BackgroundColorCss, ColorCss, Css, FontSizeCss } from 'zerodep-css-svelte';

export type UiTheme = 'light' | 'dark';
export type UiSize = 'sm' | 'md' | 'lg';
export type UiColor = 'inherit' | 'text' | 'muted' | 'primary' | 'success' | 'warning' | 'danger';

/** 语义属性始终引用容器变量，切换主题不需要重建作者实例。 */
export class UiColorCss extends ColorCss {
  readonly _text: string = this.raw('var(--ui-color-text)');
  readonly _muted: string = this.raw('var(--ui-color-muted)');
  readonly _primary: string = this.raw('var(--ui-color-primary)');
  readonly _success: string = this.raw('var(--ui-color-success)');
  readonly _warning: string = this.raw('var(--ui-color-warning)');
  readonly _danger: string = this.raw('var(--ui-color-danger)');
}

export class UiBackgroundColorCss extends BackgroundColorCss {
  readonly _background: string = this.raw('var(--ui-color-background)');
  readonly _surface: string = this.raw('var(--ui-color-surface)');
}

export class UiFontSizeCss extends FontSizeCss {
  readonly _sm: string = this.raw('var(--ui-font-size-sm)');
  readonly _md: string = this.raw('var(--ui-font-size-md)');
  readonly _lg: string = this.raw('var(--ui-font-size-lg)');
}

const palettes = {
  light: {
    background: '#ffffff',
    surface: '#f3f4f6',
    text: '#111827',
    muted: '#4b5563',
    primary: '#1d4ed8',
    success: '#166534',
    warning: '#92400e',
    danger: '#b91c1c',
  },
  dark: {
    background: '#111827',
    surface: '#1f2937',
    text: '#f9fafb',
    muted: '#d1d5db',
    primary: '#93c5fd',
    success: '#86efac',
    warning: '#fcd34d',
    danger: '#fca5a5',
  },
} as const;

/** 每个根 Provider 创建一次；应用可继承此类及属性子类。 */
export class UiCss extends Css {
  override readonly color = new UiColorCss();
  override readonly backgroundColor = new UiBackgroundColorCss();
  override readonly fontSize = new UiFontSizeCss();

  /** 只返回声明。覆盖时可在 super.theme(mode) 后追加局部 token。 */
  theme(mode: UiTheme): string {
    return (
      `color-scheme:${mode};` +
      Object.entries(palettes[mode])
        .map(([name, value]) => `--ui-color-${name}:${value};`)
        .join('') +
      '--ui-font-size-sm:0.875rem;--ui-font-size-md:1rem;--ui-font-size-lg:1.5rem;'
    );
  }
}
