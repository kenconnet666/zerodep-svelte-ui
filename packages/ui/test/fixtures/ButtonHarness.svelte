<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Provider, Button, Loading, enUSLanguage, zhCNLanguage } from '../../src/lib/index.js';
  import type { UiTheme } from '../../src/lib/index.js';
  let {
    appearance = {},
    fieldsetDisabled = false,
    english = false,
    theme,
  }: {
    appearance?: ComponentProps<typeof Button>;
    fieldsetDisabled?: boolean;
    english?: boolean;
    theme?: UiTheme;
  } = $props();
  let clicks = $state(0);
  let submissions = $state(0);
  let resets = $state(0);
</script>

<Provider {theme} lang={english ? enUSLanguage : zhCNLanguage}>
  <form
    onsubmit={(event) => {
      event.preventDefault();
      submissions++;
    }}
    onreset={() => resets++}
  >
    <fieldset disabled={fieldsetDisabled}>
      <legend>操作</legend>
      <Button onclick={() => clicks++} {...appearance}>保存</Button>
    </fieldset>
  </form>
  <output aria-label="点击">{clicks}</output>
  <output aria-label="提交">{submissions}</output>
  <output aria-label="重置">{resets}</output>
  <Loading data-testid="standalone-loading" />
</Provider>
