import { BackgroundColorCss, ColorCss, Css, FontSizeCss } from 'zerodep-css-svelte';
import type { UiTheme } from './theme/types.js';

/** 每次读取语义属性时取当前主题，避免缓存初始化时的颜色。 */
export class UiColorCss extends ColorCss {
  constructor(private readonly readTheme: () => UiTheme) {
    super();
  }
  get background(): string {
    return this.raw(this.readTheme().color.background);
  }
  get surface(): string {
    return this.raw(this.readTheme().color.surface);
  }
  get text(): string {
    return this.raw(this.readTheme().color.text);
  }
  get muted(): string {
    return this.raw(this.readTheme().color.muted);
  }
  get primary(): string {
    return this.raw(this.readTheme().color.primary);
  }
  get success(): string {
    return this.raw(this.readTheme().color.success);
  }
  get warning(): string {
    return this.raw(this.readTheme().color.warning);
  }
  get danger(): string {
    return this.raw(this.readTheme().color.danger);
  }
}

export class UiBackgroundColorCss extends BackgroundColorCss {
  constructor(private readonly readTheme: () => UiTheme) {
    super();
  }
  get background(): string {
    return this.raw(this.readTheme().color.background);
  }
  get surface(): string {
    return this.raw(this.readTheme().color.surface);
  }
  get text(): string {
    return this.raw(this.readTheme().color.text);
  }
  get muted(): string {
    return this.raw(this.readTheme().color.muted);
  }
  get primary(): string {
    return this.raw(this.readTheme().color.primary);
  }
  get success(): string {
    return this.raw(this.readTheme().color.success);
  }
  get warning(): string {
    return this.raw(this.readTheme().color.warning);
  }
  get danger(): string {
    return this.raw(this.readTheme().color.danger);
  }
}

export class UiFontSizeCss extends FontSizeCss {
  constructor(private readonly readTheme: () => UiTheme) {
    super();
  }
  get sm(): string {
    return this.raw(this.readTheme().fontSize.sm);
  }
  get md(): string {
    return this.raw(this.readTheme().fontSize.md);
  }
  get lg(): string {
    return this.raw(this.readTheme().fontSize.lg);
  }
}

/** 每个 Provider 独立创建；主题读取函数由 Provider 提供，不修改调用方对象。 */
export class UiCss<T extends UiTheme = UiTheme> extends Css {
  override readonly color: UiColorCss;
  override readonly backgroundColor: UiBackgroundColorCss;
  override readonly fontSize: UiFontSizeCss;

  constructor(private readonly readTheme: () => T) {
    super();
    this.color = new UiColorCss(readTheme);
    this.backgroundColor = new UiBackgroundColorCss(readTheme);
    this.fontSize = new UiFontSizeCss(readTheme);
  }

  get theme(): T {
    return this.readTheme();
  }
}

/** 创建函数随 Provider 嵌套继承；每次调用必须返回新的作用域实例。 */
export type UiCssFactory = (readTheme: () => UiTheme) => UiCss;
