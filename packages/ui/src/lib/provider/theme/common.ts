/** 亮暗主题共用的尺寸基准；嵌套对象冻结，调用方通过对象展开定制。 */
export const commonThemeTokens = Object.freeze({
  fontFamily: Object.freeze({
    sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  }),
  fontSize: Object.freeze({
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.25rem',
    xl: '1.5rem',
    '2xl': '2rem',
  }),
  fontWeight: Object.freeze({ normal: 400, medium: 500, semibold: 600, bold: 700 }),
  lineHeight: Object.freeze({ tight: 1.25, normal: 1.5, relaxed: 1.75 }),
  controlHeight: Object.freeze({ xs: '22px', sm: '28px', md: '34px', lg: '40px', xl: '46px' }),
  space: Object.freeze({
    '2xs': '2px',
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '48px',
  }),
  radius: Object.freeze({ sm: '4px', md: '6px', lg: '10px', full: '9999px' }),
  borderWidth: Object.freeze({ thin: '1px', thick: '2px' }),
  opacity: Object.freeze({ disabled: 0.5, hover: 0.08, pressed: 0.12 }),
  motion: Object.freeze({
    duration: Object.freeze({ fast: '150ms', normal: '250ms', slow: '350ms' }),
    easing: Object.freeze({
      standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
      enter: 'cubic-bezier(0, 0, 0.2, 1)',
      exit: 'cubic-bezier(0.4, 0, 1, 1)',
    }),
  }),
  zIndex: Object.freeze({
    dropdown: 1000,
    sticky: 1100,
    modal: 1300,
    popover: 1400,
    tooltip: 1500,
    toast: 1600,
  }),
});
