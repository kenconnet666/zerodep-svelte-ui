<svelte:head>
  <title>开始使用 · zerodep svelte ui</title>
  <meta name="description" content="了解 zerodep svelte ui 的当前状态与后续组件文档。" />
</svelte:head>

<p class="eyebrow">开始使用</p>
<h1>先把基础做好。</h1>
<p class="lead">Provider 和 Icon 已提供，组件库仍在开发，尚未发布 npm。</p>
<section class="prose" aria-labelledby="next">
  <h2 id="next">接入顺序</h2>
  <p>
    在当前工作区运行 pnpm install --frozen-lockfile，再运行 pnpm check 或 pnpm dev
    生成组件库产物。文档页面通过包名使用正式产物。
  </p>
  <p>
    消费应用需要 Svelte 5、@lucide/icons、zerodep-css 与 zerodep-css-svelte。Vite 中将
    zerodep-css-svelte/vite 放在 Svelte 插件之前，然后在应用根使用 Provider。
  </p>
  <p>
    SvelteKit 应用还需 zerodep-css-sveltekit：hooks.server.ts 导出 handle，hooks.client.ts 导出
    init，并在 app.html 使用该适配器的 SSR 样式占位符。可参考本项目的实际接入文件。
  </p>
  <a href="https://github.com/kenconnet666/zerodep-svelte-ui">查看项目源代码 →</a>
</section>
