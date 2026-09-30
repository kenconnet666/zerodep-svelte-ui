<script lang="ts">
  import { useCss } from 'zerodep-svelte-ui';
  import { css } from 'zerodep-css-svelte';
  const s = useCss();
  const code = css(s.whiteSpace.preWrap, s.overflowWrap.anywhere);
</script>

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

<section class="prose" aria-labelledby="appearance-props">
  <h2 id="appearance-props">组件外观参数</h2>
  <p>
    外观 props 默认复用 UiCss 对应 raw() 的输入类型，保留主题标识和原生 CSS 值。Parameters
    的目标是具体方法，取第一个参数类型，不是直接对 UiCss 类使用 Parameters。
  </p>
  <pre class={code}><code
      >{`import type { UiCss } from 'zerodep-svelte-ui';

type AppearanceProps = {
  size?: Parameters<UiCss['fontSize']['raw']>[0];
  color?: Parameters<UiCss['color']['raw']>[0];
};

// 组件在 $props() 就近声明默认值，再用 s.fontSize.raw(size)、s.color.raw(color) 生成声明。`}</code
    ></pre>
  <p>
    通用、常用且需要统一定制的外观 token 进入 CSS
    工具主题树；专用值和固定样式写在组件内部。外部精细定制使用 class:
    CssInput，调用方声明放在默认声明之后组合。
  </p>
  <h3>按当前组件的需要调整输入</h3>
  <pre class={code}><code
      >{`type SizeInput = Parameters<UiCss['fontSize']['raw']>[0];
type StringSizeInput = Exclude<SizeInput, number>;
type CompactSizeInput = Extract<SizeInput, '_sm' | '_md'>;

type StrokeInput = Parameters<UiCss['strokeWidth']['raw']>[0];
type OptionalStrokeInput = StrokeInput | false;
// 只有选择该扩展的组件才允许 false，并在传给 raw() 前转换为 0。`}</code
    ></pre>
  <p>
    以上是新组件的局部类型示例，不改变 Icon 当前 API。raw() 接受开放 CSS 字符串，Exclude
    删除某个字符串字面量不能形成可靠黑名单；需要严格枚举时使用已知主题键或明确白名单。新增特殊值必须实现对应转换，不只是增加类型。
  </p>
  <p>
    不再建立组件 token 对象、注册表、注入或覆盖合并器。交互状态需要的 context
    按实际行为设计，与样式配置分开。
  </p>
</section>
