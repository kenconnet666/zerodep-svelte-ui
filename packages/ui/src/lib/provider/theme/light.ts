import type { UiTheme } from './types.js';

export const lightTheme: UiTheme = Object.freeze({
  name: 'light',
  colorScheme: 'light',
  color: Object.freeze({
    background: '#ffffff',
    surface: '#f3f4f6',
    text: '#111827',
    muted: '#4b5563',
    primary: '#1d4ed8',
    success: '#166534',
    warning: '#92400e',
    danger: '#b91c1c',
  }),
  fontSize: Object.freeze({ sm: '0.875rem', md: '1rem', lg: '1.5rem' }),
});
