import type { UiCss } from './css.js';
import { parentConfig } from '../../internal/provider-context.js';
import type { UiConfig } from './types.js';

export function useConfig(): UiConfig {
  const config = parentConfig();
  if (!config) throw new Error('zerodep-svelte-ui: components must be inside a Provider.');
  return config;
}

export function useCss(): UiCss {
  return useConfig().css;
}
