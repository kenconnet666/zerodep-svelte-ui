/** 亮暗主题共用的尺寸基准；嵌套对象冻结，调用方通过对象展开定制。 */
export const commonThemeTokens = Object.freeze({
  fontFamily: Object.freeze({
    _sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    _mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  }),
  fontSize: Object.freeze({
    _xs: '0.75rem',
    _sm: '0.875rem',
    _md: '1rem',
    _lg: '1.25rem',
    _xl: '1.5rem',
    _2xl: '2rem',
  }),
  fontWeight: Object.freeze({ _normal: 400, _medium: 500, _semibold: 600, _bold: 700 }),
  lineHeight: Object.freeze({ _tight: 1.25, _normal: 1.5, _relaxed: 1.75 }),
  controlHeight: Object.freeze({ _xs: '22px', _sm: '28px', _md: '34px', _lg: '40px', _xl: '46px' }),
  space: Object.freeze({
    _2xs: '2px',
    _xs: '4px',
    _sm: '8px',
    _md: '12px',
    _lg: '16px',
    _xl: '24px',
    _2xl: '32px',
    _3xl: '48px',
  }),
  radius: Object.freeze({ _sm: '4px', _md: '6px', _lg: '10px', _full: '9999px' }),
  borderWidth: Object.freeze({ _thin: '1px', _thick: '2px' }),
  opacity: Object.freeze({ _disabled: 0.5, _hover: 0.08, _pressed: 0.12 }),
  motion: Object.freeze({
    duration: Object.freeze({ _fast: '150ms', _normal: '250ms', _slow: '350ms' }),
    easing: Object.freeze({
      _standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
      _enter: 'cubic-bezier(0, 0, 0.2, 1)',
      _exit: 'cubic-bezier(0.4, 0, 1, 1)',
    }),
  }),
  zIndex: Object.freeze({
    _dropdown: 1000,
    _sticky: 1100,
    _modal: 1300,
    _popover: 1400,
    _tooltip: 1500,
    _toast: 1600,
  }),
});
