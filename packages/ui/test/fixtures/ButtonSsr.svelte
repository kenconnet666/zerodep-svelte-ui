<script lang="ts">
  import { Provider, Button, Loading } from 'zerodep-svelte-ui';
  import { Search } from '@lucide/icons';
</script>

<Provider>
  <Button loading icon={Search}>保存 &amp; &lt;内容&gt;</Button>
  <Loading />
</Provider>
