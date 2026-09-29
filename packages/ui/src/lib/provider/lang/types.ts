export interface UiLanguage {
  readonly code: string;
  readonly dir: 'ltr' | 'rtl';
  readonly messages: {
    readonly confirm: string;
    readonly cancel: string;
    readonly loading: string;
    readonly empty: string;
  };
}
