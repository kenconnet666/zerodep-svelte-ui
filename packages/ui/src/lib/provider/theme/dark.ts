import type { UiTheme } from './types.js';

export const darkTheme: UiTheme = Object.freeze({
  colorScheme: 'dark',
  color: Object.freeze({
    background: '#111827',
    surface: '#1f2937',
    text: '#f9fafb',
    muted: '#d1d5db',
    primary: '#93c5fd',
    success: '#86efac',
    warning: '#fcd34d',
    danger: '#fca5a5',
  }),
  fontSize: Object.freeze({ sm: '0.875rem', md: '1rem', lg: '1.5rem' }),
});
