import { BackgroundColorCss, ColorCss, Css, FontSizeCss } from 'zerodep-css-svelte';
import type { UiSize, UiTheme } from './theme/types.js';

export type UiThemeColor = `_${keyof UiTheme['color']}`;

// 只解析完整的主题标识；原生关键字、长度、var()/calc() 等交回基础工具处理。
function themeValue<T extends string | number>(
  value: T,
  values: Readonly<Record<string, string>>,
): T | string {
  if (typeof value === 'string' && value.startsWith('_')) {
    const key = value.slice(1);
    if (Object.hasOwn(values, key)) return values[key];
  }
  return value;
}

/** 每次读取语义属性时取当前主题，避免缓存初始化时的颜色。 */
export class UiColorCss extends ColorCss {
  constructor(private readonly readTheme: () => UiTheme) {
    super();
  }
  override raw(value: UiThemeColor | Parameters<ColorCss['raw']>[0]): string {
    return super.raw(themeValue(value, this.readTheme().color));
  }
  get _background(): string {
    return this.raw('_background');
  }
  get _surface(): string {
    return this.raw('_surface');
  }
  get _text(): string {
    return this.raw('_text');
  }
  get _muted(): string {
    return this.raw('_muted');
  }
  get _primary(): string {
    return this.raw('_primary');
  }
  get _success(): string {
    return this.raw('_success');
  }
  get _warning(): string {
    return this.raw('_warning');
  }
  get _danger(): string {
    return this.raw('_danger');
  }
}

export class UiBackgroundColorCss extends BackgroundColorCss {
  constructor(private readonly readTheme: () => UiTheme) {
    super();
  }
  override raw(value: UiThemeColor | Parameters<BackgroundColorCss['raw']>[0]): string {
    return super.raw(themeValue(value, this.readTheme().color));
  }
  get _background(): string {
    return this.raw('_background');
  }
  get _surface(): string {
    return this.raw('_surface');
  }
  get _text(): string {
    return this.raw('_text');
  }
  get _muted(): string {
    return this.raw('_muted');
  }
  get _primary(): string {
    return this.raw('_primary');
  }
  get _success(): string {
    return this.raw('_success');
  }
  get _warning(): string {
    return this.raw('_warning');
  }
  get _danger(): string {
    return this.raw('_danger');
  }
}

export class UiFontSizeCss extends FontSizeCss {
  constructor(private readonly readTheme: () => UiTheme) {
    super();
  }
  override raw(value: UiSize | Parameters<FontSizeCss['raw']>[0]): string {
    return super.raw(themeValue(value, this.readTheme().fontSize));
  }
  get _sm(): string {
    return this.raw('_sm');
  }
  get _md(): string {
    return this.raw('_md');
  }
  get _lg(): string {
    return this.raw('_lg');
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
