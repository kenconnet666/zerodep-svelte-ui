<script lang="ts">
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { onMount, type Snippet } from 'svelte';
  import { Provider, Container, zhCNLanguage } from 'zerodep-svelte-ui';
  import '../app.css';

  let { children }: { children: Snippet } = $props();

  onMount(() => {
    // 浏览器验收等到水合完成再操作，避免把原生整页跳转误判为路由故障。
    document.documentElement.dataset.hydrated = 'true';
  });
</script>

<Provider lang={zhCNLanguage}>
  <a class="skip-link" href="#main">跳到正文</a>
  <!-- 1148px 包含两侧各 24px，正文最大宽度仍为 1100px。 -->
  <Container maxWidth="1148px" paddingInline="_xl">
    <header>
      <a class="brand" href={resolve('/')}>zerodep <span>svelte ui</span></a>
      <nav aria-label="主导航">
        <a href={resolve('/')} aria-current={page.route.id === '/' ? 'page' : undefined}>概览</a>
        <a href={resolve('/guide')} aria-current={page.route.id === '/guide' ? 'page' : undefined}>
          开始使用
        </a>
        <a
          href={resolve('/provider')}
          aria-current={page.route.id === '/provider' ? 'page' : undefined}>Provider</a
        >
        <a href={resolve('/icon')} aria-current={page.route.id === '/icon' ? 'page' : undefined}
          >Icon</a
        >
        <a href={resolve('/text')} aria-current={page.route.id === '/text' ? 'page' : undefined}
          >Text</a
        >
        <a href={resolve('/ripple')} aria-current={page.route.id === '/ripple' ? 'page' : undefined}
          >Ripple</a
        >
        <a href={resolve('/button')} aria-current={page.route.id === '/button' ? 'page' : undefined}
          >Button</a
        >
        <a
          href={resolve('/controls')}
          aria-current={page.route.id === '/controls' ? 'page' : undefined}>表单控件</a
        >
        <a href={resolve('/layout')} aria-current={page.route.id === '/layout' ? 'page' : undefined}
          >布局与卡片</a
        >
        <a href="https://github.com/kenconnet666/zerodep-svelte-ui">GitHub</a>
      </nav>
    </header>
    <main id="main" tabindex="-1">{@render children()}</main>
    <footer>简洁的 API，灵活的组合，便于维护的代码。</footer>
  </Container>
</Provider>
