export interface UiLanguage {
  readonly languageName: string;
  readonly messages: {
    readonly confirm: string;
    readonly cancel: string;
    readonly loading: string;
    readonly empty: string;
  };
}
