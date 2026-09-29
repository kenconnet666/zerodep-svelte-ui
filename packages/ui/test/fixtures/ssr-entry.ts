import { render } from 'svelte/server';
import { Search } from '@lucide/icons';
import { createServerCssHost, withCssHost } from 'zerodep-css-svelte/server';
import type { Css } from 'zerodep-css-svelte';
import {
  lightTheme,
  darkTheme,
  zhCNLanguage,
  enUSLanguage,
  chinaLocale,
  usLocale,
  Icon,
} from 'zerodep-svelte-ui';
import ProviderSsr from './ProviderSsr.svelte';
import PublicConfigProbe from './PublicConfigProbe.svelte';
import IconSsr from './IconSsr.svelte';
import ContextWithoutProvider from './ContextWithoutProvider.svelte';

export async function renderProvider(dark: boolean, brand: string) {
  const host = createServerCssHost();
  const authors: Css[] = [];
  return withCssHost(host, async () => {
    await Promise.resolve();
    const body = render(ProviderSsr, {
      props: {
        theme: dark ? darkTheme : lightTheme,
        lang: dark ? enUSLanguage : zhCNLanguage,
        locale: dark ? usLocale : chinaLocale,
        brand,
        onRead: (s) => authors.push(s),
      },
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
    props: {
      theme: lightTheme,
      lang: zhCNLanguage,
      locale: chinaLocale,
      brand: 'red',
      onRead: () => {},
    },
  }).body;
}
export function renderIconWithoutProvider() {
  return withCssHost(createServerCssHost(), () => render(Icon, { props: { icon: Search } }).body);
}
export function readWithoutProvider(kind: 'theme' | 'locale' | 'lang' | 'css') {
  return withCssHost(
    createServerCssHost(),
    () => render(ContextWithoutProvider, { props: { kind } }).body,
  );
}
export function renderIcon(label: string) {
  const host = createServerCssHost();
  const body = withCssHost(host, () => render(IconSsr, { props: { label } }).body);
  return { body, css: host.cssText(), rules: host.rules() };
}
