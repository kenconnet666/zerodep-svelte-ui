<script lang="ts">
  import { resolve } from '$app/paths';
  import { css } from 'zerodep-css-svelte';
  import { useCss, Grid, Card } from 'zerodep-svelte-ui';

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

<section aria-label="设计原则">
  <Grid
    columns="repeat(auto-fit, minmax(min(100%, 16rem), 1fr))"
    gap="_xl"
    class={css(s.marginTop.raw(s.theme.space._3xl))}
  >
    <Card
      title="直接易用"
      description="让常见场景写得自然，让进阶用法保持清晰。"
      slotProps={{ title: { as: 'h2', size: '_lg' }, description: { size: '_md' } }}
    />
    <Card
      title="灵活组合"
      description="复用原生能力，保留按需扩展的空间。"
      slotProps={{ title: { as: 'h2', size: '_lg' }, description: { size: '_md' } }}
    />
    <Card
      title="长期维护"
      description="优先简单实现，用真实场景和测试验证取舍。"
      slotProps={{ title: { as: 'h2', size: '_lg' }, description: { size: '_md' } }}
    />
  </Grid>
</section>

<p class="status">首批 Provider 与 Icon 已提供交互示例，组件库仍在持续完善，尚未发布 npm。</p>
