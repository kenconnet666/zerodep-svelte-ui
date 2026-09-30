<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Text, Provider, lightTheme, darkTheme, useCss } from 'zerodep-svelte-ui';
  import { css } from 'zerodep-css-svelte';
  const s = useCss();
  let dark = $state(false);
  let size = $state<ComponentProps<typeof Text>['size']>('_md');
  const theme = $derived(dark ? darkTheme : lightTheme);
  const code = css(s.whiteSpace.preWrap, s.overflowWrap.anywhere);
</script>

<svelte:head><title>Text · zerodep svelte ui</title></svelte:head>
<p class="eyebrow">基础组件</p>
<h1>Text</h1>
<p class="lead">保留原生文本语义，按需使用系统主题或直接 CSS 值。</p>
<div class="demo-controls">
  <label><input type="checkbox" bind:checked={dark} /> 深色主题</label>
  <label
    >文字大小 <select bind:value={size}
      ><option>_sm</option><option>_md</option><option>_xl</option><option>18px</option></select
    ></label
  >
</div>
<Provider
  {theme}
  class={css(s.padding._lg, s.borderRadius._md, s.backgroundColor.raw(theme.color._surface))}
>
  <Text {size} color="_primary" data-text-preview>主题文字 &lt;内容&gt;</Text>
  <Text as="p"
    >普通段落中的 <Text as="strong">强调文字</Text> 和 <Text as="em">语气强调</Text>。</Text
  >
  <Text as="code">const value = 1;</Text>
</Provider>
<section class="prose">
  <h2>使用</h2>
  <pre class={code}><code
      >{`<Text>按钮文字</Text>
<Text as="h2" size="_xl" color="_primary">标题</Text>
<Text as="strong">保留原生粗体</Text>
<Text as="code">保留原生等宽字体</Text>
<Text size="18px" fontWeight={600} lineHeight={1.5}>自定义文字</Text>`}</code
    ></pre>
  <p>
    as 默认 span，可选 p、strong、em、small、code、kbd、samp、sub、sup、del、ins 和
    h1–h6。它改变真实标签，不靠 role 模拟语义；没有传入外观属性时不覆盖标签默认样式和 margin。
  </p>
  <p>
    size、color、fontFamily、fontWeight、lineHeight、textAlign 分别复用对应 UiCss.raw()
    的输入类型。class 使用 CssInput，调用方声明在默认声明后组合；其他原生 HTML 属性透传。内容使用
    Svelte children snippet，正常文本自动转义。
  </p>
  <p>
    Text 必须位于 Provider 后代中。本阶段不提供复制、富文本 HTML、自动省略、行数截断或
    Tooltip；需要特殊排版时先使用 class。
  </p>
</section>
