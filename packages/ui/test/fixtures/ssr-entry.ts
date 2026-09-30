import { render } from 'svelte/server';
import type { ComponentProps } from 'svelte';
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
  Text,
  Ripple,
} from 'zerodep-svelte-ui';
import ProviderSsr from './ProviderSsr.svelte';
import PublicConfigProbe from './PublicConfigProbe.svelte';
import IconSsr from './IconSsr.svelte';
import ContextWithoutProvider from './ContextWithoutProvider.svelte';
import FoundationSsr from './FoundationSsr.svelte';

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

export function renderFoundations(label: string) {
  const host = createServerCssHost();
  const body = withCssHost(host, () => render(FoundationSsr, { props: { label } }).body);
  return { body, css: host.cssText() };
}

export function renderFoundationWithoutProvider(kind: 'text' | 'ripple') {
  return withCssHost(createServerCssHost(), () =>
    kind === 'text' ? render(Text).body : render(Ripple).body,
  );
}

export async function renderIconAppearance(appearance: Partial<ComponentProps<typeof Icon>>) {
  const host = createServerCssHost();
  return withCssHost(host, async () => {
    await Promise.resolve();
    const body = render(IconSsr, { props: { appearance } }).body;
    return { body, css: host.cssText() };
  });
}
