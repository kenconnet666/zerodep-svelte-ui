<script lang="ts">
  import {
    Provider,
    lightTheme,
    darkTheme,
    zhCNLanguage,
    enUSLanguage,
    chinaLocale,
    usLocale,
    useCss,
  } from 'zerodep-svelte-ui';
  import { css } from 'zerodep-css-svelte';
  import ProviderState from '$lib/ProviderState.svelte';

  const author = useCss();
  const themes = {
    light: lightTheme,
    dark: darkTheme,
    brand: { ...lightTheme, color: { ...lightTheme.color, _primary: '#7e22ce' } },
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
  const tokenGroups = $derived([
    { name: '颜色与状态', values: theme.color },
    { name: '字体族', values: theme.fontFamily },
    { name: '字号', values: theme.fontSize },
    { name: '字重', values: theme.fontWeight },
    { name: '行高', values: theme.lineHeight },
    { name: '控件高度', values: theme.controlHeight },
    { name: '间距', values: theme.space },
    { name: '圆角', values: theme.radius },
    { name: '边框宽度', values: theme.borderWidth },
    { name: '透明度', values: theme.opacity },
    { name: '阴影', values: theme.shadow },
    { name: '动效时长', values: theme.motion.duration },
    { name: '动效曲线', values: theme.motion.easing },
    { name: '层级', values: theme.zIndex },
  ]);
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
  {theme}
  lang={language === 'zh-CN' ? zhCNLanguage : enUSLanguage}
  locale={region === 'china' ? chinaLocale : usLocale}
  class={css(panel, author.backgroundColor.raw(theme.color._background))}
>
  <ProviderState label="父级" />
  <Provider
    theme={childTheme}
    class={css(panel, author.backgroundColor.raw((childTheme ?? theme).color._background))}
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
          >可选创建函数：(readTheme) =&gt; new AppCss(readTheme)。每个 Provider
          创建独立作者；子级继承创建函数，更换函数时用 key 重建。</td
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
      >{`css(s.height._md, s.paddingInline._sm, s.borderRadius._md);
css(s.color._primaryHover, s.borderColor._border);
css(s.fontWeight._semibold, s.lineHeight._normal);
css(s.transitionDuration._fast, s.zIndex._modal);`}</code
    ></pre>
  <pre class={code}><code
      >{`const theme = useTheme();
const locale = useLocale();
const lang = useLang();
const s = useCss();
// 在模板或 $derived 中读取，才能随配置替换更新。
const appearance = $derived(css(s.color._primary, s.fontSize._md));`}</code
    ></pre>
  <p>
    Provider 将当前主题的读取函数传给 UiCss，不依赖主题 CSS 变量。在模板或派生表达式中读取
    s.color._primary、s.backgroundColor._surface、s.fontSize._md，主题替换时自动更新；s.theme
    可取得原始主题对象。不要在初始化时缓存这些声明。容器的外部 class 只改变 DOM
    样式，不修改传给后代的主题数据。
  </p>
  <p>
    主题数据键与声明统一带下划线，例如
    theme.color._primary、theme.space._2xs；分类名保持不变。s.color._primary 与
    s.color.raw('_primary') 等价，s.backgroundColor._surface 与 s.fontSize._md 同理。原生关键字和
    CSS 值仍可直接传给 raw()。
  </p>
  <p>
    语言与地区独立：英文文案可以配合上海时区。上面的时间示例固定为 2026-01-15 12:00
    UTC，切换地区可核对时区变化；Provider 不猜测服务器或浏览器的本地时区。
  </p>
  <h2>接入约定</h2>
  <p>
    所有库组件及 useCss()、useTheme()、useLocale()、useLang() 必须在 Provider 后代中使用，缺少
    Provider 会直接报错。Provider 应包裹消费组件；同一个组件的初始化代码不能读取自己模板中 Provider
    提供的 context。
  </p>
  <p>
    应用启用 zerodep-css-svelte/vite；SvelteKit 接入 zerodep-css-sveltekit 的服务端 handle 与客户端
    init。Provider 提供 context，不另建 SSR 样式宿主。默认配置冻结，用户传入的对象不会被组件修改。
  </p>
</section>

<section class="prose">
  <h2>系统 token 参考</h2>
  <p>
    以下展示当前父主题的完整
    token。名称参考成熟组件库的语义分类；数值由本库明确维护。尺寸、状态透明度、阴影、动效和层级相互独立，不把组件专属参数塞进全局。
  </p>
  {#each tokenGroups as group (group.name)}
    <h3>{group.name}</h3>
    <table>
      <thead><tr><th>名称</th><th>值</th></tr></thead><tbody>
        {#each Object.entries(group.values) as [name, value] (name)}
          <tr><td>{name}</td><td style="overflow-wrap:anywhere">{value}</td></tr>
        {/each}
      </tbody>
    </table>
  {/each}
</section>
