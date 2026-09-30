<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Provider, Checkbox, Select, Slider, Button, type UiTheme } from '../../src/lib/index.js';
  let {
    checked = $bindable(),
    mixed = $bindable(),
    selected = $bindable(),
    amount = $bindable(),
    disabled = false,
    fieldsetDisabled = false,
    cancelReset = false,
    nativeResetProbe = false,
    theme,
    checkbox = {},
    select = {},
    slider = {},
  }: {
    checked?: boolean;
    mixed?: boolean;
    selected?: string;
    amount?: number;
    disabled?: boolean;
    fieldsetDisabled?: boolean;
    cancelReset?: boolean;
    nativeResetProbe?: boolean;
    theme?: UiTheme;
    checkbox?: Partial<ComponentProps<typeof Checkbox>>;
    select?: Partial<ComponentProps<typeof Select<string>>>;
    slider?: Partial<ComponentProps<typeof Slider>>;
  } = $props();
  let submitted = $state('');
  let number = $state(2);
  let inputs = $state(0);
  let changes = $state(0);
  let nativeValue = $state(3);
</script>

<Provider {theme}>
  <form
    onreset={(event) => {
      if (cancelReset) event.preventDefault();
    }}
    onsubmit={(event) => {
      event.preventDefault();
      submitted = JSON.stringify([...new FormData(event.currentTarget)]);
    }}
  >
    <fieldset disabled={fieldsetDisabled}>
      {#if nativeResetProbe}
        <input
          type="range"
          aria-label="原生对照"
          min="0"
          max="10"
          step="3"
          defaultValue={0}
          bind:value={nativeValue}
        />
      {/if}
      <legend>表单控件</legend>
      <Checkbox
        name="accepted"
        value="yes"
        defaultChecked
        {disabled}
        {...checkbox}
        bind:checked
        bind:indeterminate={mixed}>接受条款</Checkbox
      >
      <label
        >选项 <Select name="choice" defaultValue="b" {disabled} {...select} bind:value={selected}>
          <option value="a">甲</option><option value="b">乙</option><option value="c" disabled
            >不可选</option
          >
          <optgroup label="其他"><option value="d">丁</option></optgroup>
        </Select></label
      >
      <label
        >数值 <Slider
          name="amount"
          min={0}
          max={10}
          step={0.5}
          defaultValue={3}
          showValue
          {disabled}
          oninput={() => inputs++}
          onchange={() => changes++}
          {...slider}
          bind:value={amount}
        /></label
      >
    </fieldset>
    <Button type="submit">提交</Button><Button type="reset">重置</Button>
  </form>
  <label
    >数字选项 <Select bind:value={number}
      ><option value={1}>一</option><option value={2}>二</option></Select
    ></label
  >
  <output aria-label="绑定值">{String(checked)}/{String(mixed)}/{selected}/{amount}</output>
  <output aria-label="数字类型">{typeof number}:{number}</output>
  <output aria-label="表单值">{submitted}</output>
  <output aria-label="事件">{inputs}/{changes}</output>
</Provider>
