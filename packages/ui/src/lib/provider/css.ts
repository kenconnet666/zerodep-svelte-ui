import { Css, SystemKeywords, systemKeywords } from 'zerodep-css-svelte';
import type { UiTheme } from './theme/types.js';

export type UiThemeColor = keyof UiTheme['color'];
export type UiThemeFontFamily = keyof UiTheme['fontFamily'];
export type UiThemeFontSize = keyof UiTheme['fontSize'];
export type UiThemeFontWeight = keyof UiTheme['fontWeight'];
export type UiThemeLineHeight = keyof UiTheme['lineHeight'];
export type UiThemeControlHeight = keyof UiTheme['controlHeight'];
export type UiThemeSpace = keyof UiTheme['space'];
export type UiThemeRadius = keyof UiTheme['radius'];
export type UiThemeBorderWidth = keyof UiTheme['borderWidth'];
export type UiThemeOpacity = keyof UiTheme['opacity'];
export type UiThemeShadow = keyof UiTheme['shadow'];
export type UiThemeDuration = keyof UiTheme['motion']['duration'];
export type UiThemeEasing = keyof UiTheme['motion']['easing'];
export type UiThemeZIndex = keyof UiTheme['zIndex'];

/** 建立一次只读值视图；getter 保留 Svelte 对原始主题字段的依赖跟踪。 */
function themeValues<S extends object, T extends object>(system: S, read: () => T): S & T {
  const values = { ...system };
  for (const key of Object.keys(read()) as (keyof T & string)[]) {
    Object.defineProperty(values, key, { enumerable: true, get: () => read()[key] });
  }
  // 视图只组合系统成员和主题成员，不缓存主题值，也不代理作者 API。
  return Object.freeze(values) as S & T;
}

/** 将 UI 分类映射为原生 CSS 属性的值；作者实例和此对象都随 Provider 创建一次。 */
export class UiKeywords extends SystemKeywords {
  constructor(readTheme: () => UiTheme) {
    super();
    this.color = themeValues(systemKeywords.color, () => readTheme().color);
    this.backgroundColor = themeValues(systemKeywords.backgroundColor, () => readTheme().color);
    this.borderColor = themeValues(systemKeywords.borderColor, () => readTheme().color);
    this.outlineColor = themeValues(systemKeywords.outlineColor, () => readTheme().color);
    this.fontFamily = themeValues(systemKeywords.fontFamily, () => readTheme().fontFamily);
    this.fontSize = themeValues(systemKeywords.fontSize, () => readTheme().fontSize);
    this.fontWeight = themeValues(systemKeywords.fontWeight, () => readTheme().fontWeight);
    this.lineHeight = themeValues(systemKeywords.lineHeight, () => readTheme().lineHeight);
    this.height = themeValues(systemKeywords.height, () => readTheme().controlHeight);
    this.padding = themeValues(systemKeywords.padding, () => readTheme().space);
    this.paddingInline = themeValues(systemKeywords.paddingInline, () => readTheme().space);
    this.paddingBlock = themeValues(systemKeywords.paddingBlock, () => readTheme().space);
    this.margin = themeValues(systemKeywords.margin, () => readTheme().space);
    this.gap = themeValues(systemKeywords.gap, () => readTheme().space);
    this.borderRadius = themeValues(systemKeywords.borderRadius, () => readTheme().radius);
    this.borderWidth = themeValues(systemKeywords.borderWidth, () => readTheme().borderWidth);
    this.opacity = themeValues(systemKeywords.opacity, () => readTheme().opacity);
    this.boxShadow = themeValues(systemKeywords.boxShadow, () => readTheme().shadow);
    this.transitionDuration = themeValues(
      systemKeywords.transitionDuration,
      () => readTheme().motion.duration,
    );
    this.transitionTimingFunction = themeValues(
      systemKeywords.transitionTimingFunction,
      () => readTheme().motion.easing,
    );
    this.animationDuration = themeValues(
      systemKeywords.animationDuration,
      () => readTheme().motion.duration,
    );
    this.animationTimingFunction = themeValues(
      systemKeywords.animationTimingFunction,
      () => readTheme().motion.easing,
    );
    this.zIndex = themeValues(systemKeywords.zIndex, () => readTheme().zIndex);
  }
  /** color 的原始值，读取当前作用域主题。 */
  override readonly color: SystemKeywords['color'] & UiTheme['color'];
  /** backgroundColor 的原始值，读取当前作用域主题。 */
  override readonly backgroundColor: SystemKeywords['backgroundColor'] & UiTheme['color'];
  /** borderColor 的原始值，读取当前作用域主题。 */
  override readonly borderColor: SystemKeywords['borderColor'] & UiTheme['color'];
  /** outlineColor 的原始值，读取当前作用域主题。 */
  override readonly outlineColor: SystemKeywords['outlineColor'] & UiTheme['color'];
  /** fontFamily 的原始值，读取当前作用域主题。 */
  override readonly fontFamily: SystemKeywords['fontFamily'] & UiTheme['fontFamily'];
  /** fontSize 的原始值，读取当前作用域主题。 */
  override readonly fontSize: SystemKeywords['fontSize'] & UiTheme['fontSize'];
  /** fontWeight 的原始值，读取当前作用域主题。 */
  override readonly fontWeight: SystemKeywords['fontWeight'] & UiTheme['fontWeight'];
  /** lineHeight 的原始值，读取当前作用域主题。 */
  override readonly lineHeight: SystemKeywords['lineHeight'] & UiTheme['lineHeight'];
  /** height 的原始值，读取当前作用域主题。 */
  override readonly height: SystemKeywords['height'] & UiTheme['controlHeight'];
  /** padding 的原始值，读取当前作用域主题。 */
  override readonly padding: SystemKeywords['padding'] & UiTheme['space'];
  /** paddingInline 的原始值，读取当前作用域主题。 */
  override readonly paddingInline: SystemKeywords['paddingInline'] & UiTheme['space'];
  /** paddingBlock 的原始值，读取当前作用域主题。 */
  override readonly paddingBlock: SystemKeywords['paddingBlock'] & UiTheme['space'];
  /** margin 的原始值，读取当前作用域主题。 */
  override readonly margin: SystemKeywords['margin'] & UiTheme['space'];
  /** gap 的原始值，读取当前作用域主题。 */
  override readonly gap: SystemKeywords['gap'] & UiTheme['space'];
  /** borderRadius 的原始值，读取当前作用域主题。 */
  override readonly borderRadius: SystemKeywords['borderRadius'] & UiTheme['radius'];
  /** borderWidth 的原始值，读取当前作用域主题。 */
  override readonly borderWidth: SystemKeywords['borderWidth'] & UiTheme['borderWidth'];
  /** opacity 的原始值，读取当前作用域主题。 */
  override readonly opacity: SystemKeywords['opacity'] & UiTheme['opacity'];
  /** boxShadow 的原始值，读取当前作用域主题。 */
  override readonly boxShadow: SystemKeywords['boxShadow'] & UiTheme['shadow'];
  /** transitionDuration 的原始值，读取当前作用域主题。 */
  override readonly transitionDuration: SystemKeywords['transitionDuration'] &
    UiTheme['motion']['duration'];
  /** transitionTimingFunction 的原始值，读取当前作用域主题。 */
  override readonly transitionTimingFunction: SystemKeywords['transitionTimingFunction'] &
    UiTheme['motion']['easing'];
  /** animationDuration 的原始值，读取当前作用域主题。 */
  override readonly animationDuration: SystemKeywords['animationDuration'] &
    UiTheme['motion']['duration'];
  /** animationTimingFunction 的原始值，读取当前作用域主题。 */
  override readonly animationTimingFunction: SystemKeywords['animationTimingFunction'] &
    UiTheme['motion']['easing'];
  /** zIndex 的原始值，读取当前作用域主题。 */
  override readonly zIndex: SystemKeywords['zIndex'] & UiTheme['zIndex'];
}

/** 每个 Provider 注入一份作者；声明生成、raw 解析和属性视图由 CSS 核心处理。 */
export class UiCss<T extends UiTheme = UiTheme> extends Css<UiKeywords> {
  constructor(private readonly readTheme: () => T) {
    super(new UiKeywords(readTheme));
  }
  /** 当前作用域的原始 UI 主题；在模板或派生表达式中读取。 */
  get theme(): T {
    return this.readTheme();
  }
}

/** 创建函数随 Provider 嵌套继承；每次调用必须返回新的作用域实例。 */
export type UiCssFactory = (readTheme: () => UiTheme) => UiCss;
