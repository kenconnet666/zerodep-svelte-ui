import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import cssBindings from 'zerodep-css-svelte/vite';

export default defineConfig({ plugins: [cssBindings(), sveltekit()] });
