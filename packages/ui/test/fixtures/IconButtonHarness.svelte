<script lang="ts">
  import { Search } from '@lucide/icons';
  import { Provider, Icon } from '../../src/lib/index.js';
  let count = $state(0);
</script>

<Provider>
  <button type="button" aria-label="搜索" onclick={() => count++}><Icon icon={Search} /></button>
  <output aria-label="点击次数">{count}</output>
  <button type="button">下一项</button>
</Provider>
