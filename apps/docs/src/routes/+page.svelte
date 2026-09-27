<script lang="ts">
  import { resolve } from '$app/paths';
  import { css } from 'zerodep-css-svelte';
  import { useCss } from '$lib/css';

  const s = useCss();
  const primaryLink = css(
    s.display.inlineBlock,
    s.padding.px(12, 24),
    s.marginTop.px(18),
    s.borderRadius.px(10),
    s.color.white,
    s.backgroundColor.raw('#2555c7'),
    s.textDecoration.none,
  );
</script>

<svelte:head>
  <title>zerodep svelte ui · Svelte 组件库</title>
  <meta name="description" content="面向 Svelte 5 的组件库，追求简洁、灵活、易于维护的使用体验。" />
</svelte:head>

<p class="eyebrow">为 Svelte 5 而设计</p>
<h1>简洁，让你的设计<br />保留更多可能。</h1>
<p class="lead">从清晰的组件边界出发，用自然的组合方式构建界面。</p>
<a class={primaryLink} href={resolve('/guide')}>了解项目 →</a>

<section class="principles" aria-label="设计原则">
  <article>
    <h2>直接易用</h2>
    <p>让常见场景写得自然，让进阶用法保持清晰。</p>
  </article>
  <article>
    <h2>灵活组合</h2>
    <p>复用原生能力，保留按需扩展的空间。</p>
  </article>
  <article>
    <h2>长期维护</h2>
    <p>优先简单实现，用真实场景和测试验证取舍。</p>
  </article>
</section>

<p class="status">首批 Provider 与 Icon 已提供交互示例，组件库仍在持续完善，尚未发布 npm。</p>
