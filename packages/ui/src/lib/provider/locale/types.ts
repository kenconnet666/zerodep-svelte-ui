/** 显式地区与 IANA 时区，避免 SSR 和浏览器使用各自机器的默认时区。 */
export interface UiLocale {
  readonly localeName: 'zh-CN' | 'en-US';
  readonly timeZone: string;
}
