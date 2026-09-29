export interface UiLanguage {
  readonly code: string;
  readonly messages: {
    readonly confirm: string;
    readonly cancel: string;
    readonly loading: string;
    readonly empty: string;
  };
}
