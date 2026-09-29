<script lang="ts">
  import { Search, Check } from '@lucide/icons';
  import {
    Icon,
    Provider,
    useCss,
    type UiColor,
    type UiSize,
    type UiTheme,
  } from 'zerodep-svelte-ui';
  import { css } from 'zerodep-css-svelte';

  const s = useCss();
  const panel = css(s.backgroundColor._background, s.padding.rem(1.5), s.borderRadius.px(12));
  const row = css(s.display.flex, s.alignItems.center, s.gap.rem(1.5), s.flexWrap.wrap);
  const colors: UiColor[] = ['inherit', 'text', 'muted', 'primary', 'success', 'warning', 'danger'];
  let choice = $state<'Search' | 'Check'>('Search');
  let size = $state<UiSize>('md');
  let color = $state<UiColor>('primary');
  let theme = $state<UiTheme>('light');
  let strokeWidth = $state(2);
  let searches = $state(0);
  const selected = $derived(choice === 'Search' ? Search : Check);
</script>

<svelte:head>
  <title>Icon · zerodep svelte ui</title>
  <meta
    name="description"
    content="按需传入 Lucide 图形数据，使用共享作者的语义尺寸、颜色和可访问性。"
  />
</svelte:head>

<p class="eyebrow">基础组件</p>
<h1>Icon</h1>
<p class="lead">传入图标数据，统一使用组件库的尺寸、颜色和主题。</p>

<div class="demo-controls">
  <label
    >图标 <select bind:value={choice}><option>Search</option><option>Check</option></select></label
  >
  <label
    >尺寸 <select bind:value={size}
      ><option>sm</option><option>md</option><option>lg</option></select
    ></label
  >
  <label
    >颜色 <select bind:value={color}
      >{#each colors as value (value)}<option>{value}</option>{/each}</select
    ></label
  >
  <label>主题 <select bind:value={theme}><option>light</option><option>dark</option></select></label
  >
  <label>描边 <input type="range" min="0.5" max="4" step="0.25" bind:value={strokeWidth} /></label>
  <output aria-label="描边宽度">{strokeWidth}</output>
</div>

<Provider {theme} class={panel}>
  <div class={row}>
    <Icon icon={selected} {size} {color} {strokeWidth} aria-label="预览图标" data-icon-preview />
    <span>语义尺寸 {size}，颜色 {color}</span>
    <button type="button" aria-label="搜索" onclick={() => searches++}
      ><Icon icon={Search} /></button
    >
    <output aria-label="搜索次数">{searches}</output>
  </div>
</Provider>

<section class="prose">
  <h2>使用</h2>
  <pre><code
      >{`import { Search } from '@lucide/icons';
import { Provider, Icon } from 'zerodep-svelte-ui';`}</code
    ></pre>
  <pre><code
      >{`<Provider>
  <Icon icon={Search} />
  <Icon icon={Search} size="lg" color="primary" aria-label="搜索" />
</Provider>`}</code
    ></pre>
  <h2>属性</h2>
  <table>
    <thead><tr><th>属性</th><th>说明</th></tr></thead><tbody>
      <tr
        ><td>icon</td><td
          >必填，LucideIconData 图形数据，支持响应式替换，不接受子组件或 children。</td
        ></tr
      >
      <tr><td>size</td><td>sm / md / lg，默认 md，映射到作者的 fontSize 语义属性。</td></tr>
      <tr
        ><td>color</td><td
          >inherit / text / muted / primary / success / warning / danger，默认 inherit。</td
        ></tr
      >
      <tr><td>strokeWidth</td><td>数值，默认 2；编译为 CSS 变量，连续更新不重新登记样式类。</td></tr
      >
      <tr><td>class</td><td>CssInput；外部 css() 结果放在默认声明之后，合成一个类。</td></tr>
      <tr><td>style</td><td>根 SVG 的原生内联样式。</td></tr>
    </tbody>
  </table>
  <h2>可访问性</h2>
  <p>
    默认作为装饰图标隐藏，提供 aria-label 或 aria-labelledby 时自动赋予 img 角色。显式 aria-hidden
    优先。仅图标按钮把名称放在按钮上，图标本身不增加 Tab 停靠点。
  </p>
  <h2>主题与扩展</h2>
  <pre><code>{`<Icon icon={Search} class={css(s.width.px(30), s.color.red)} />`}</code></pre>
  <p>
    class 优先传入同一宿主的 css() 结果，也接受 CSS 声明、嵌套数组和条件空项；
    不透传普通类名、多类名字符串或条件对象。同等层叠条件下，外部声明覆盖默认值。
  </p>
  <p>
    Icon 不创建 Css 实例，读取最近 Provider 注入的 UiCss。应用可覆盖 UiFontSizeCss、UiColorCss 或
    UiCss.theme。viewBox 来自图标数据；图形节点保留 SVG 命名空间，不修改共享资源。
  </p>
  <p>
    消费应用必须安装 @lucide/icons 并启用
    zerodep-css-svelte/vite。只导入实际使用的图标，组件库不登记全量图标表。
  </p>
</section>
