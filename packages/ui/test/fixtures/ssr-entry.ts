import { render } from 'svelte/server';
import { createServerCssHost, withCssHost } from 'zerodep-css-svelte/server';
import type { UiCss, UiTheme } from 'zerodep-svelte-ui';
import ProviderSsr from './ProviderSsr.svelte';
import PublicConfigProbe from './PublicConfigProbe.svelte';
import IconSsr from './IconSsr.svelte';

export async function renderProvider(theme: UiTheme, locale: string, brand: string) {
  const host = createServerCssHost();
  const authors: UiCss[] = [];
  return withCssHost(host, async () => {
    // 并发请求在异步边界交错，不能共享作者或样式宿主。
    await Promise.resolve();
    const body = render(ProviderSsr, {
      props: { theme, locale, brand, onRead: (s) => authors.push(s) },
    }).body;
    return { body, css: host.cssText(), authors, rules: host.rules() };
  });
}

export function renderWithoutProvider() {
  return withCssHost(
    createServerCssHost(),
    () => render(PublicConfigProbe, { props: { onRead: () => {} } }).body,
  );
}

export function renderWithoutHost() {
  return render(ProviderSsr, {
    props: { theme: 'light', locale: 'zh-CN', brand: 'red', onRead: () => {} },
  }).body;
}

export function renderIcon(label: string) {
  const host = createServerCssHost();
  const body = withCssHost(host, () => render(IconSsr, { props: { label } }).body);
  return { body, css: host.cssText(), rules: host.rules() };
}
