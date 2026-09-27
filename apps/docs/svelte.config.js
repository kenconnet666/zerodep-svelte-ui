import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    // GitHub Pages 等子目录部署可在构建时指定；默认站点根目录。
    paths: { base: process.env.BASE_PATH ?? '' },
  },
};
