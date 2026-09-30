<script lang="ts">
  import { Provider, Checkbox, Select, Slider } from 'zerodep-svelte-ui';
</script>

<Provider>
  <Checkbox checked indeterminate name="accepted" value="yes">接受 &lt;条款&gt;</Checkbox>
  <label
    >选项 <Select value="b"><option value="a">甲</option><option value="b">乙</option></Select
    ></label
  >
  <label
    >数值 <Slider
      value={3.5}
      min={0}
      max={10}
      step={0.5}
      showValue
      formatValue={(value) => `${value}秒`}
    /></label
  >
</Provider>
