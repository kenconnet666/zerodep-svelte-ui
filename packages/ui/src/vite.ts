import type { Plugin } from 'vite';
import { lucideIconNames } from '@lucide/icons/dynamic';
import { transformLucide } from './internal/lucide-transform.js';

/** 将 Icon 的 lucide 字面量编译为按需导入；放在 Svelte/SvelteKit 插件之前。 */
export default function uiIcons(): Plugin {
  return {
    name: 'zerodep-ui-lucide',
    enforce: 'pre',
    config() {
      // 单图标是可直接加载的 ESM 数据；转换后发现新名称不应触发依赖预构建重载。
      // Vite 的运行时发现按完整导入路径匹配 exclude，不使用目录前缀。
      return {
        optimizeDeps: { exclude: lucideIconNames.map((name) => `@lucide/icons/icons/${name}`) },
      };
    },
    transform(code, id) {
      const [filename, query = ''] = id.split('?', 2);
      const params = new URLSearchParams(query);
      if (
        !filename.endsWith('.svelte') ||
        params.has('raw') ||
        params.has('url') ||
        params.get('type') === 'style'
      )
        return;
      return transformLucide(code, filename);
    },
  };
}
