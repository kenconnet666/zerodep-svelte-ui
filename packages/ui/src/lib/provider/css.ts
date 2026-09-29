import {
  Css,
  ColorCss,
  BackgroundColorCss,
  BorderColorCss,
  OutlineColorCss,
  FontFamilyCss,
  FontSizeCss,
  FontWeightCss,
  LineHeightCss,
  HeightCss,
  PaddingCss,
  PaddingInlineCss,
  PaddingBlockCss,
  MarginCss,
  GapCss,
  BorderRadiusCss,
  BorderWidthCss,
  OpacityCss,
  BoxShadowCss,
  TransitionDurationCss,
  TransitionTimingFunctionCss,
  AnimationDurationCss,
  AnimationTimingFunctionCss,
  ZIndexCss,
} from 'zerodep-css-svelte';
import type { UiTheme } from './theme/types.js';

export type UiThemeColor = `_${keyof UiTheme['color']}`;
export type UiThemeFontFamily = `_${keyof UiTheme['fontFamily']}`;
export type UiThemeFontSize = `_${keyof UiTheme['fontSize']}`;
export type UiThemeFontWeight = `_${keyof UiTheme['fontWeight']}`;
export type UiThemeLineHeight = `_${keyof UiTheme['lineHeight']}`;
export type UiThemeControlHeight = `_${keyof UiTheme['controlHeight']}`;
export type UiThemeSpace = `_${keyof UiTheme['space']}`;
export type UiThemeRadius = `_${keyof UiTheme['radius']}`;
export type UiThemeBorderWidth = `_${keyof UiTheme['borderWidth']}`;
export type UiThemeOpacity = `_${keyof UiTheme['opacity']}`;
export type UiThemeShadow = `_${keyof UiTheme['shadow']}`;
export type UiThemeDuration = `_${keyof UiTheme['motion']['duration']}`;
export type UiThemeEasing = `_${keyof UiTheme['motion']['easing']}`;
export type UiThemeZIndex = `_${keyof UiTheme['zIndex']}`;

/** 只解析完整主题标识；原生 CSS 值保持原样，数字仍保留原生参数类型。 */
function themeValue<V extends string | number, T extends string | number>(
  value: V,
  values: Readonly<Record<string, T>>,
): V | T {
  if (typeof value === 'string' && value.startsWith('_')) {
    const key = value.slice(1);
    if (Object.hasOwn(values, key)) return values[key];
  }
  return value;
}

/** color 的主题声明；每次读取当前作用域，不缓存主题快照。 */
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
  get _surfaceHover(): string {
    return this.raw('_surfaceHover');
  }
  get _text(): string {
    return this.raw('_text');
  }
  get _muted(): string {
    return this.raw('_muted');
  }
  get _textDisabled(): string {
    return this.raw('_textDisabled');
  }
  get _border(): string {
    return this.raw('_border');
  }
  get _divider(): string {
    return this.raw('_divider');
  }
  get _focusRing(): string {
    return this.raw('_focusRing');
  }
  get _primary(): string {
    return this.raw('_primary');
  }
  get _primaryHover(): string {
    return this.raw('_primaryHover');
  }
  get _primaryPressed(): string {
    return this.raw('_primaryPressed');
  }
  get _onPrimary(): string {
    return this.raw('_onPrimary');
  }
  get _info(): string {
    return this.raw('_info');
  }
  get _infoHover(): string {
    return this.raw('_infoHover');
  }
  get _infoPressed(): string {
    return this.raw('_infoPressed');
  }
  get _onInfo(): string {
    return this.raw('_onInfo');
  }
  get _success(): string {
    return this.raw('_success');
  }
  get _successHover(): string {
    return this.raw('_successHover');
  }
  get _successPressed(): string {
    return this.raw('_successPressed');
  }
  get _onSuccess(): string {
    return this.raw('_onSuccess');
  }
  get _warning(): string {
    return this.raw('_warning');
  }
  get _warningHover(): string {
    return this.raw('_warningHover');
  }
  get _warningPressed(): string {
    return this.raw('_warningPressed');
  }
  get _onWarning(): string {
    return this.raw('_onWarning');
  }
  get _danger(): string {
    return this.raw('_danger');
  }
  get _dangerHover(): string {
    return this.raw('_dangerHover');
  }
  get _dangerPressed(): string {
    return this.raw('_dangerPressed');
  }
  get _onDanger(): string {
    return this.raw('_onDanger');
  }
}

/** color 的主题声明；每次读取当前作用域，不缓存主题快照。 */
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
  get _surfaceHover(): string {
    return this.raw('_surfaceHover');
  }
  get _text(): string {
    return this.raw('_text');
  }
  get _muted(): string {
    return this.raw('_muted');
  }
  get _textDisabled(): string {
    return this.raw('_textDisabled');
  }
  get _border(): string {
    return this.raw('_border');
  }
  get _divider(): string {
    return this.raw('_divider');
  }
  get _focusRing(): string {
    return this.raw('_focusRing');
  }
  get _primary(): string {
    return this.raw('_primary');
  }
  get _primaryHover(): string {
    return this.raw('_primaryHover');
  }
  get _primaryPressed(): string {
    return this.raw('_primaryPressed');
  }
  get _onPrimary(): string {
    return this.raw('_onPrimary');
  }
  get _info(): string {
    return this.raw('_info');
  }
  get _infoHover(): string {
    return this.raw('_infoHover');
  }
  get _infoPressed(): string {
    return this.raw('_infoPressed');
  }
  get _onInfo(): string {
    return this.raw('_onInfo');
  }
  get _success(): string {
    return this.raw('_success');
  }
  get _successHover(): string {
    return this.raw('_successHover');
  }
  get _successPressed(): string {
    return this.raw('_successPressed');
  }
  get _onSuccess(): string {
    return this.raw('_onSuccess');
  }
  get _warning(): string {
    return this.raw('_warning');
  }
  get _warningHover(): string {
    return this.raw('_warningHover');
  }
  get _warningPressed(): string {
    return this.raw('_warningPressed');
  }
  get _onWarning(): string {
    return this.raw('_onWarning');
  }
  get _danger(): string {
    return this.raw('_danger');
  }
  get _dangerHover(): string {
    return this.raw('_dangerHover');
  }
  get _dangerPressed(): string {
    return this.raw('_dangerPressed');
  }
  get _onDanger(): string {
    return this.raw('_onDanger');
  }
}

/** color 的主题声明；每次读取当前作用域，不缓存主题快照。 */
export class UiBorderColorCss extends BorderColorCss {
  constructor(private readonly readTheme: () => UiTheme) {
    super();
  }
  override raw(value: UiThemeColor | Parameters<BorderColorCss['raw']>[0]): string {
    return super.raw(themeValue(value, this.readTheme().color));
  }
  get _background(): string {
    return this.raw('_background');
  }
  get _surface(): string {
    return this.raw('_surface');
  }
  get _surfaceHover(): string {
    return this.raw('_surfaceHover');
  }
  get _text(): string {
    return this.raw('_text');
  }
  get _muted(): string {
    return this.raw('_muted');
  }
  get _textDisabled(): string {
    return this.raw('_textDisabled');
  }
  get _border(): string {
    return this.raw('_border');
  }
  get _divider(): string {
    return this.raw('_divider');
  }
  get _focusRing(): string {
    return this.raw('_focusRing');
  }
  get _primary(): string {
    return this.raw('_primary');
  }
  get _primaryHover(): string {
    return this.raw('_primaryHover');
  }
  get _primaryPressed(): string {
    return this.raw('_primaryPressed');
  }
  get _onPrimary(): string {
    return this.raw('_onPrimary');
  }
  get _info(): string {
    return this.raw('_info');
  }
  get _infoHover(): string {
    return this.raw('_infoHover');
  }
  get _infoPressed(): string {
    return this.raw('_infoPressed');
  }
  get _onInfo(): string {
    return this.raw('_onInfo');
  }
  get _success(): string {
    return this.raw('_success');
  }
  get _successHover(): string {
    return this.raw('_successHover');
  }
  get _successPressed(): string {
    return this.raw('_successPressed');
  }
  get _onSuccess(): string {
    return this.raw('_onSuccess');
  }
  get _warning(): string {
    return this.raw('_warning');
  }
  get _warningHover(): string {
    return this.raw('_warningHover');
  }
  get _warningPressed(): string {
    return this.raw('_warningPressed');
  }
  get _onWarning(): string {
    return this.raw('_onWarning');
  }
  get _danger(): string {
    return this.raw('_danger');
  }
  get _dangerHover(): string {
    return this.raw('_dangerHover');
  }
  get _dangerPressed(): string {
    return this.raw('_dangerPressed');
  }
  get _onDanger(): string {
    return this.raw('_onDanger');
  }
}

/** color 的主题声明；每次读取当前作用域，不缓存主题快照。 */
export class UiOutlineColorCss extends OutlineColorCss {
  constructor(private readonly readTheme: () => UiTheme) {
    super();
  }
  override raw(value: UiThemeColor | Parameters<OutlineColorCss['raw']>[0]): string {
    return super.raw(themeValue(value, this.readTheme().color));
  }
  get _background(): string {
    return this.raw('_background');
  }
  get _surface(): string {
    return this.raw('_surface');
  }
  get _surfaceHover(): string {
    return this.raw('_surfaceHover');
  }
  get _text(): string {
    return this.raw('_text');
  }
  get _muted(): string {
    return this.raw('_muted');
  }
  get _textDisabled(): string {
    return this.raw('_textDisabled');
  }
  get _border(): string {
    return this.raw('_border');
  }
  get _divider(): string {
    return this.raw('_divider');
  }
  get _focusRing(): string {
    return this.raw('_focusRing');
  }
  get _primary(): string {
    return this.raw('_primary');
  }
  get _primaryHover(): string {
    return this.raw('_primaryHover');
  }
  get _primaryPressed(): string {
    return this.raw('_primaryPressed');
  }
  get _onPrimary(): string {
    return this.raw('_onPrimary');
  }
  get _info(): string {
    return this.raw('_info');
  }
  get _infoHover(): string {
    return this.raw('_infoHover');
  }
  get _infoPressed(): string {
    return this.raw('_infoPressed');
  }
  get _onInfo(): string {
    return this.raw('_onInfo');
  }
  get _success(): string {
    return this.raw('_success');
  }
  get _successHover(): string {
    return this.raw('_successHover');
  }
  get _successPressed(): string {
    return this.raw('_successPressed');
  }
  get _onSuccess(): string {
    return this.raw('_onSuccess');
  }
  get _warning(): string {
    return this.raw('_warning');
  }
  get _warningHover(): string {
    return this.raw('_warningHover');
  }
  get _warningPressed(): string {
    return this.raw('_warningPressed');
  }
  get _onWarning(): string {
    return this.raw('_onWarning');
  }
  get _danger(): string {
    return this.raw('_danger');
  }
  get _dangerHover(): string {
    return this.raw('_dangerHover');
  }
  get _dangerPressed(): string {
    return this.raw('_dangerPressed');
  }
  get _onDanger(): string {
    return this.raw('_onDanger');
  }
}

/** fontFamily 的主题声明；每次读取当前作用域，不缓存主题快照。 */
export class UiFontFamilyCss extends FontFamilyCss {
  constructor(private readonly readTheme: () => UiTheme) {
    super();
  }
  override raw(value: UiThemeFontFamily | Parameters<FontFamilyCss['raw']>[0]): string {
    return super.raw(themeValue(value, this.readTheme().fontFamily));
  }
  get _sans(): string {
    return this.raw('_sans');
  }
  get _mono(): string {
    return this.raw('_mono');
  }
}

/** fontSize 的主题声明；每次读取当前作用域，不缓存主题快照。 */
export class UiFontSizeCss extends FontSizeCss {
  constructor(private readonly readTheme: () => UiTheme) {
    super();
  }
  override raw(value: UiThemeFontSize | Parameters<FontSizeCss['raw']>[0]): string {
    return super.raw(themeValue(value, this.readTheme().fontSize));
  }
  get _xs(): string {
    return this.raw('_xs');
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
  get _xl(): string {
    return this.raw('_xl');
  }
  get _2xl(): string {
    return this.raw('_2xl');
  }
}

/** fontWeight 的主题声明；每次读取当前作用域，不缓存主题快照。 */
export class UiFontWeightCss extends FontWeightCss {
  constructor(private readonly readTheme: () => UiTheme) {
    super();
  }
  override raw(value: UiThemeFontWeight | Parameters<FontWeightCss['raw']>[0]): string {
    return super.raw(themeValue(value, this.readTheme().fontWeight));
  }
  get _normal(): string {
    return this.raw('_normal');
  }
  get _medium(): string {
    return this.raw('_medium');
  }
  get _semibold(): string {
    return this.raw('_semibold');
  }
  get _bold(): string {
    return this.raw('_bold');
  }
}

/** lineHeight 的主题声明；每次读取当前作用域，不缓存主题快照。 */
export class UiLineHeightCss extends LineHeightCss {
  constructor(private readonly readTheme: () => UiTheme) {
    super();
  }
  override raw(value: UiThemeLineHeight | Parameters<LineHeightCss['raw']>[0]): string {
    return super.raw(themeValue(value, this.readTheme().lineHeight));
  }
  get _tight(): string {
    return this.raw('_tight');
  }
  get _normal(): string {
    return this.raw('_normal');
  }
  get _relaxed(): string {
    return this.raw('_relaxed');
  }
}

/** controlHeight 的主题声明；每次读取当前作用域，不缓存主题快照。 */
export class UiHeightCss extends HeightCss {
  constructor(private readonly readTheme: () => UiTheme) {
    super();
  }
  override raw(value: UiThemeControlHeight | Parameters<HeightCss['raw']>[0]): string {
    return super.raw(themeValue(value, this.readTheme().controlHeight));
  }
  get _xs(): string {
    return this.raw('_xs');
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
  get _xl(): string {
    return this.raw('_xl');
  }
}

/** space 的主题声明；每次读取当前作用域，不缓存主题快照。 */
export class UiPaddingCss extends PaddingCss {
  constructor(private readonly readTheme: () => UiTheme) {
    super();
  }
  override raw(value: UiThemeSpace | Parameters<PaddingCss['raw']>[0]): string {
    return super.raw(themeValue(value, this.readTheme().space));
  }
  get _2xs(): string {
    return this.raw('_2xs');
  }
  get _xs(): string {
    return this.raw('_xs');
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
  get _xl(): string {
    return this.raw('_xl');
  }
  get _2xl(): string {
    return this.raw('_2xl');
  }
  get _3xl(): string {
    return this.raw('_3xl');
  }
}

/** space 的主题声明；每次读取当前作用域，不缓存主题快照。 */
export class UiPaddingInlineCss extends PaddingInlineCss {
  constructor(private readonly readTheme: () => UiTheme) {
    super();
  }
  override raw(value: UiThemeSpace | Parameters<PaddingInlineCss['raw']>[0]): string {
    return super.raw(themeValue(value, this.readTheme().space));
  }
  get _2xs(): string {
    return this.raw('_2xs');
  }
  get _xs(): string {
    return this.raw('_xs');
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
  get _xl(): string {
    return this.raw('_xl');
  }
  get _2xl(): string {
    return this.raw('_2xl');
  }
  get _3xl(): string {
    return this.raw('_3xl');
  }
}

/** space 的主题声明；每次读取当前作用域，不缓存主题快照。 */
export class UiPaddingBlockCss extends PaddingBlockCss {
  constructor(private readonly readTheme: () => UiTheme) {
    super();
  }
  override raw(value: UiThemeSpace | Parameters<PaddingBlockCss['raw']>[0]): string {
    return super.raw(themeValue(value, this.readTheme().space));
  }
  get _2xs(): string {
    return this.raw('_2xs');
  }
  get _xs(): string {
    return this.raw('_xs');
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
  get _xl(): string {
    return this.raw('_xl');
  }
  get _2xl(): string {
    return this.raw('_2xl');
  }
  get _3xl(): string {
    return this.raw('_3xl');
  }
}

/** space 的主题声明；每次读取当前作用域，不缓存主题快照。 */
export class UiMarginCss extends MarginCss {
  constructor(private readonly readTheme: () => UiTheme) {
    super();
  }
  override raw(value: UiThemeSpace | Parameters<MarginCss['raw']>[0]): string {
    return super.raw(themeValue(value, this.readTheme().space));
  }
  get _2xs(): string {
    return this.raw('_2xs');
  }
  get _xs(): string {
    return this.raw('_xs');
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
  get _xl(): string {
    return this.raw('_xl');
  }
  get _2xl(): string {
    return this.raw('_2xl');
  }
  get _3xl(): string {
    return this.raw('_3xl');
  }
}

/** space 的主题声明；每次读取当前作用域，不缓存主题快照。 */
export class UiGapCss extends GapCss {
  constructor(private readonly readTheme: () => UiTheme) {
    super();
  }
  override raw(value: UiThemeSpace | Parameters<GapCss['raw']>[0]): string {
    return super.raw(themeValue(value, this.readTheme().space));
  }
  get _2xs(): string {
    return this.raw('_2xs');
  }
  get _xs(): string {
    return this.raw('_xs');
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
  get _xl(): string {
    return this.raw('_xl');
  }
  get _2xl(): string {
    return this.raw('_2xl');
  }
  get _3xl(): string {
    return this.raw('_3xl');
  }
}

/** radius 的主题声明；每次读取当前作用域，不缓存主题快照。 */
export class UiBorderRadiusCss extends BorderRadiusCss {
  constructor(private readonly readTheme: () => UiTheme) {
    super();
  }
  override raw(value: UiThemeRadius | Parameters<BorderRadiusCss['raw']>[0]): string {
    return super.raw(themeValue(value, this.readTheme().radius));
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
  get _full(): string {
    return this.raw('_full');
  }
}

/** borderWidth 的主题声明；每次读取当前作用域，不缓存主题快照。 */
export class UiBorderWidthCss extends BorderWidthCss {
  constructor(private readonly readTheme: () => UiTheme) {
    super();
  }
  override raw(value: UiThemeBorderWidth | Parameters<BorderWidthCss['raw']>[0]): string {
    return super.raw(themeValue(value, this.readTheme().borderWidth));
  }
  get _thin(): string {
    return this.raw('_thin');
  }
  get _thick(): string {
    return this.raw('_thick');
  }
}

/** opacity 的主题声明；每次读取当前作用域，不缓存主题快照。 */
export class UiOpacityCss extends OpacityCss {
  constructor(private readonly readTheme: () => UiTheme) {
    super();
  }
  override raw(value: UiThemeOpacity | Parameters<OpacityCss['raw']>[0]): string {
    return super.raw(themeValue(value, this.readTheme().opacity));
  }
  get _disabled(): string {
    return this.raw('_disabled');
  }
  get _hover(): string {
    return this.raw('_hover');
  }
  get _pressed(): string {
    return this.raw('_pressed');
  }
}

/** shadow 的主题声明；每次读取当前作用域，不缓存主题快照。 */
export class UiBoxShadowCss extends BoxShadowCss {
  constructor(private readonly readTheme: () => UiTheme) {
    super();
  }
  override raw(value: UiThemeShadow | Parameters<BoxShadowCss['raw']>[0]): string {
    return super.raw(themeValue(value, this.readTheme().shadow));
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

/** motion.duration 的主题声明；每次读取当前作用域，不缓存主题快照。 */
export class UiTransitionDurationCss extends TransitionDurationCss {
  constructor(private readonly readTheme: () => UiTheme) {
    super();
  }
  override raw(value: UiThemeDuration | Parameters<TransitionDurationCss['raw']>[0]): string {
    return super.raw(themeValue(value, this.readTheme().motion.duration));
  }
  get _fast(): string {
    return this.raw('_fast');
  }
  get _normal(): string {
    return this.raw('_normal');
  }
  get _slow(): string {
    return this.raw('_slow');
  }
}

/** motion.easing 的主题声明；每次读取当前作用域，不缓存主题快照。 */
export class UiTransitionTimingFunctionCss extends TransitionTimingFunctionCss {
  constructor(private readonly readTheme: () => UiTheme) {
    super();
  }
  override raw(value: UiThemeEasing | Parameters<TransitionTimingFunctionCss['raw']>[0]): string {
    return super.raw(themeValue(value, this.readTheme().motion.easing));
  }
  get _standard(): string {
    return this.raw('_standard');
  }
  get _enter(): string {
    return this.raw('_enter');
  }
  get _exit(): string {
    return this.raw('_exit');
  }
}

/** motion.duration 的主题声明；每次读取当前作用域，不缓存主题快照。 */
export class UiAnimationDurationCss extends AnimationDurationCss {
  constructor(private readonly readTheme: () => UiTheme) {
    super();
  }
  override raw(value: UiThemeDuration | Parameters<AnimationDurationCss['raw']>[0]): string {
    return super.raw(themeValue(value, this.readTheme().motion.duration));
  }
  get _fast(): string {
    return this.raw('_fast');
  }
  get _normal(): string {
    return this.raw('_normal');
  }
  get _slow(): string {
    return this.raw('_slow');
  }
}

/** motion.easing 的主题声明；每次读取当前作用域，不缓存主题快照。 */
export class UiAnimationTimingFunctionCss extends AnimationTimingFunctionCss {
  constructor(private readonly readTheme: () => UiTheme) {
    super();
  }
  override raw(value: UiThemeEasing | Parameters<AnimationTimingFunctionCss['raw']>[0]): string {
    return super.raw(themeValue(value, this.readTheme().motion.easing));
  }
  get _standard(): string {
    return this.raw('_standard');
  }
  get _enter(): string {
    return this.raw('_enter');
  }
  get _exit(): string {
    return this.raw('_exit');
  }
}

/** zIndex 的主题声明；每次读取当前作用域，不缓存主题快照。 */
export class UiZIndexCss extends ZIndexCss {
  constructor(private readonly readTheme: () => UiTheme) {
    super();
  }
  override raw(value: UiThemeZIndex | Parameters<ZIndexCss['raw']>[0]): string {
    return super.raw(themeValue(value, this.readTheme().zIndex));
  }
  get _dropdown(): string {
    return this.raw('_dropdown');
  }
  get _sticky(): string {
    return this.raw('_sticky');
  }
  get _modal(): string {
    return this.raw('_modal');
  }
  get _popover(): string {
    return this.raw('_popover');
  }
  get _tooltip(): string {
    return this.raw('_tooltip');
  }
  get _toast(): string {
    return this.raw('_toast');
  }
}

/** 每个 Provider 持有独立作者；原生 CSS 属性继续复用基础库。 */
export class UiCss<T extends UiTheme = UiTheme> extends Css {
  override readonly color: UiColorCss;
  override readonly backgroundColor: UiBackgroundColorCss;
  override readonly borderColor: UiBorderColorCss;
  override readonly outlineColor: UiOutlineColorCss;
  override readonly fontFamily: UiFontFamilyCss;
  override readonly fontSize: UiFontSizeCss;
  override readonly fontWeight: UiFontWeightCss;
  override readonly lineHeight: UiLineHeightCss;
  override readonly height: UiHeightCss;
  override readonly padding: UiPaddingCss;
  override readonly paddingInline: UiPaddingInlineCss;
  override readonly paddingBlock: UiPaddingBlockCss;
  override readonly margin: UiMarginCss;
  override readonly gap: UiGapCss;
  override readonly borderRadius: UiBorderRadiusCss;
  override readonly borderWidth: UiBorderWidthCss;
  override readonly opacity: UiOpacityCss;
  override readonly boxShadow: UiBoxShadowCss;
  override readonly transitionDuration: UiTransitionDurationCss;
  override readonly transitionTimingFunction: UiTransitionTimingFunctionCss;
  override readonly animationDuration: UiAnimationDurationCss;
  override readonly animationTimingFunction: UiAnimationTimingFunctionCss;
  override readonly zIndex: UiZIndexCss;
  constructor(private readonly readTheme: () => T) {
    super();
    this.color = new UiColorCss(readTheme);
    this.backgroundColor = new UiBackgroundColorCss(readTheme);
    this.borderColor = new UiBorderColorCss(readTheme);
    this.outlineColor = new UiOutlineColorCss(readTheme);
    this.fontFamily = new UiFontFamilyCss(readTheme);
    this.fontSize = new UiFontSizeCss(readTheme);
    this.fontWeight = new UiFontWeightCss(readTheme);
    this.lineHeight = new UiLineHeightCss(readTheme);
    this.height = new UiHeightCss(readTheme);
    this.padding = new UiPaddingCss(readTheme);
    this.paddingInline = new UiPaddingInlineCss(readTheme);
    this.paddingBlock = new UiPaddingBlockCss(readTheme);
    this.margin = new UiMarginCss(readTheme);
    this.gap = new UiGapCss(readTheme);
    this.borderRadius = new UiBorderRadiusCss(readTheme);
    this.borderWidth = new UiBorderWidthCss(readTheme);
    this.opacity = new UiOpacityCss(readTheme);
    this.boxShadow = new UiBoxShadowCss(readTheme);
    this.transitionDuration = new UiTransitionDurationCss(readTheme);
    this.transitionTimingFunction = new UiTransitionTimingFunctionCss(readTheme);
    this.animationDuration = new UiAnimationDurationCss(readTheme);
    this.animationTimingFunction = new UiAnimationTimingFunctionCss(readTheme);
    this.zIndex = new UiZIndexCss(readTheme);
  }
  get theme(): T {
    return this.readTheme();
  }
}

/** 创建函数随 Provider 嵌套继承；每次调用必须返回新的作用域实例。 */
export type UiCssFactory = (readTheme: () => UiTheme) => UiCss;
