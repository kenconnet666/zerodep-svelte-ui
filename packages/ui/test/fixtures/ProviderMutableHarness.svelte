<script lang="ts">
  import { Provider, lightTheme, zhCNLanguage, chinaLocale } from '../../src/lib/index.js';
  import ConfigProbe from './ConfigProbe.svelte';
  let theme = $state({ ...lightTheme, color: { ...lightTheme.color } });
  let lang = $state({ ...zhCNLanguage, messages: { ...zhCNLanguage.messages } });
  let locale = $state({ ...chinaLocale });
</script>

<button
  onclick={() => {
    theme.color.primary = 'purple';
    lang.messages.loading = '处理中';
    locale.timeZone = 'America/New_York';
  }}>更新对象字段</button
>
<Provider {theme} {lang} {locale}>
  <Provider><ConfigProbe name="value" /></Provider>
</Provider>
