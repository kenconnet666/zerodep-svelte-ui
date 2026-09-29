import type { Css } from 'zerodep-css-svelte';
import { parentConfig } from '../../internal/provider-context.js';
import type { UiConfig } from './types.js';

export function useConfig(): UiConfig {
  const config = parentConfig();
  if (!config) throw new Error('zerodep-svelte-ui: components must be inside a Provider.');
  return config;
}

export function useCss(): Css {
  return useConfig().css;
}
