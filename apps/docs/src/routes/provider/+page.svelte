<script lang="ts">
  import { Provider, UiCss, type UiTheme } from 'zerodep-svelte-ui';
  import { css } from 'zerodep-css-svelte';
  import ProviderState from '$lib/ProviderState.svelte';

  const author = new UiCss();
  const panel = css(
    author.backgroundColor._background,
    author.padding.rem(1.5),
    author.borderRadius.px(12),
  );
  let theme = $state<UiTheme>('light');
  let locale = $state('zh-CN');
  let nested = $state<'inherit' | UiTheme>('inherit');
</script>

<svelte:head
  ><title>Provider · zerodep svelte ui</title><meta
    name="description"
    content="共享 CSS 作者、主题作用域与响应式配置继承。"
  /></svelte:head
>
<p class="eyebrow">基础组件</p>
<h1>Provider</h1>
<p class="lead">在一个作用域内共享 CSS 作者，让主题与语言配置沿组件树向下继承。</p>

<div class="demo-controls">
  <label
    >父主题 <select bind:value={theme}
      ><option value="light">light</option><option value="dark">dark</option></select
    ></label
  >
  <label
    >语言 <select bind:value={locale}
      ><option value="zh-CN">zh-CN</option><option value="en-US">en-US</option></select
    ></label
  >
  <label
    >子主题 <select bind:value={nested}
      ><option value="inherit">继承</option><option value="light">light</option><option value="dark"
        >dark</option
      ></select
    ></label
  >
</div>
<Provider css={author} {theme} {locale} class={panel}>
  <ProviderState label="父级" />
  <Provider theme={nested === 'inherit' ? undefined : nested} class={panel}>
    <ProviderState label="子级" />
  </Provider>
  <ProviderState label="兄弟" />
</Provider>

<section class="prose">
  <h2>使用</h2>
  <pre><code
      >{`<Provider theme="light" locale="zh-CN">
  <Content />
  <Provider theme="dark"><Panel /></Provider>
</Provider>`}</code
    ></pre>
  <p>
    根 Provider 默认创建一次 UiCss。嵌套 Provider 复用父实例；只有传入新的 css
    才建立独立作者作用域。主题、语言可响应式更新，传入 undefined 恢复继承。
  </p>
  <h2>属性</h2>
  <table>
    <thead><tr><th>属性</th><th>语义</th></tr></thead><tbody>
      <tr><td>css</td><td>UiCss 实例；只用于作用域初始化，更换时用 key 重建 Provider。</td></tr>
      <tr><td>theme</td><td>light / dark；根部默认 light，子级默认继承。</td></tr>
      <tr><td>locale</td><td>语言与格式化区域，同时设置容器 lang；根部默认 zh-CN。</td></tr>
      <tr><td>class / style</td><td>传给实际 div 容器，可覆盖主题变量与默认样式。</td></tr>
    </tbody>
  </table>
  <h2>接入约定</h2>
  <p>
    应用必须启用 zerodep-css-svelte/vite，放在 Svelte 插件之前。SvelteKit 还需安装
    zerodep-css-sveltekit 并接入服务端 handle 与客户端 init。Provider 负责配置作用域，不负责创建 SSR
    样式宿主。
  </p>
  <p>
    useConfig() 返回只读的响应式配置视图，使用 config.locale 等属性保持追踪。useCss()
    返回当前作者；二者都必须在 Provider 的后代组件初始化时调用。
  </p>
  <p>
    容器提供主题变量、文字颜色和 color-scheme，背景由调用方选择；示例显式使用了
    backgroundColor._background。层外用户 class 可覆盖组件默认规则。
  </p>
</section>
