import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import cssBindings from 'zerodep-css-svelte/vite';
import uiIcons from 'zerodep-svelte-ui/vite';

export default defineConfig({ plugins: [uiIcons(), cssBindings(), sveltekit()] });
