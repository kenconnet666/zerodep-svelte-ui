<script lang="ts">
  import {
    Provider,
    lightTheme,
    darkTheme,
    zhCNLanguage,
    enUSLanguage,
    chinaLocale,
    usLocale,
  } from 'zerodep-svelte-ui';
  import { Css, css } from 'zerodep-css-svelte';
  import ProviderState from '$lib/ProviderState.svelte';

  const author = new Css();
  const themes = {
    light: lightTheme,
    dark: darkTheme,
    brand: { ...lightTheme, color: { ...lightTheme.color, primary: '#7e22ce' } },
  };
  const panel = css(author.padding.rem(1.5), author.borderRadius.px(12));
  // 长代码自动换行，避免产生无法通过键盘操作的横向滚动区。
  const code = css(author.whiteSpace.preWrap, author.overflowWrap.anywhere);
  let choice = $state<'light' | 'dark' | 'brand'>('light');
  let language = $state('zh-CN');
  let region = $state('china');
  let nested = $state<'inherit' | 'light' | 'dark' | 'brand'>('inherit');
  const theme = $derived(themes[choice]);
  const childTheme = $derived(nested === 'inherit' ? undefined : themes[nested]);
</script>

<svelte:head>
  <title>Provider · zerodep svelte ui</title>
  <meta
    name="description"
    content="通过 Svelte context 注入主题、语言和地区时区对象，支持响应式替换与嵌套继承。"
  />
</svelte:head>
<p class="eyebrow">基础组件</p>
<h1>Provider</h1>
<p class="lead">把主题、语言和地区作为 JS 对象传入，让后代共享配置。</p>

<div class="demo-controls">
  <label
    >父主题 <select bind:value={choice}
      ><option>light</option><option>dark</option><option>brand</option></select
    ></label
  >
  <label
    >语言 <select bind:value={language}><option>zh-CN</option><option>en-US</option></select></label
  >
  <label
    >地区与时区 <select bind:value={region}
      ><option value="china">中国 · 上海</option><option value="us">美国 · 纽约</option></select
    ></label
  >
  <label
    >子主题 <select bind:value={nested}
      ><option>inherit</option><option>light</option><option>dark</option><option>brand</option
      ></select
    ></label
  >
</div>
<Provider
  css={author}
  {theme}
  lang={language === 'zh-CN' ? zhCNLanguage : enUSLanguage}
  locale={region === 'china' ? chinaLocale : usLocale}
  class={css(panel, author.backgroundColor.raw(theme.color.background))}
>
  <ProviderState label="父级" />
  <Provider
    theme={childTheme}
    class={css(panel, author.backgroundColor.raw((childTheme ?? theme).color.background))}
  >
    <ProviderState label="子级" />
  </Provider>
  <ProviderState label="兄弟" />
</Provider>

<section class="prose">
  <h2>使用</h2>
  <pre class={code}><code
      >{`import { Provider, lightTheme, darkTheme, enUSLanguage, usLocale } from 'zerodep-svelte-ui';`}</code
    ></pre>
  <pre class={code}><code
      >{`<Provider theme={lightTheme} lang={enUSLanguage} locale={usLocale}>
  <Content />
  <Provider theme={darkTheme}><Panel /></Provider>
</Provider>`}</code
    ></pre>
  <p>
    theme、lang、locale 分别继承最近父级，传入对象时整体替换，传入 undefined
    恢复继承；不自动深合并。自定义配置可用对象展开从预设构建。
  </p>
  <h2>属性</h2>
  <table>
    <thead><tr><th>属性</th><th>含义</th></tr></thead><tbody>
      <tr
        ><td>theme</td><td
          >UiTheme：颜色、字号和 themeName（light / dark）。根部默认 lightTheme。</td
        ></tr
      >
      <tr
        ><td>lang</td><td
          >UiLanguage：语言代码和通用文案。根部默认 zhCNLanguage，同时设置容器 lang。</td
        ></tr
      >
      <tr
        ><td>locale</td><td
          >UiLocale：地区代码和显式 IANA 时区。根部默认 chinaLocale，日期和数值格式交给 Intl。</td
        ></tr
      >
      <tr
        ><td>css</td><td
          >可选 Css 作者，只用于初始化。默认根部创建，子级复用；换作者时用 key 重建。</td
        ></tr
      >
      <tr
        ><td>class / style</td><td
          >class 接收 CssInput，在默认声明之后合成一个类；style 是原生内联样式。</td
        ></tr
      >
    </tbody>
  </table>
  <h2>消费配置</h2>
  <pre class={code}><code
      >{`const config = useConfig();
const s = useCss();
// 在模板或 $derived 中读取，才能随配置替换更新。
const appearance = $derived(css(s.color.raw(config.theme.color.primary)));`}</code
    ></pre>
  <p>
    主题数据通过 Svelte context 传递，不依赖主题 CSS 变量。保留 config
    对象并在模板或派生表达式中读取属性，不要在初始化时解构成快照。容器的外部 class 只改变 DOM
    样式，不修改传给后代的主题数据。
  </p>
  <p>
    语言与地区独立：英文文案可以配合上海时区。上面的时间示例固定为 2026-01-15 12:00
    UTC，切换地区可核对时区变化；Provider 不猜测服务器或浏览器的本地时区。
  </p>
  <h2>接入约定</h2>
  <p>
    应用启用 zerodep-css-svelte/vite；SvelteKit 接入 zerodep-css-sveltekit 的服务端 handle 与客户端
    init。Provider 提供 context，不另建 SSR 样式宿主。默认配置冻结，用户传入的对象不会被组件修改。
  </p>
</section>
