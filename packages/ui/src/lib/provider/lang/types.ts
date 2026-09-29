export interface UiLanguage {
  readonly languageName: 'zh-CN' | 'en-US';
  readonly messages: {
    readonly confirm: string;
    readonly cancel: string;
    readonly loading: string;
    readonly empty: string;
  };
}
