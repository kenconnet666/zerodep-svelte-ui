<script lang="ts">
  import {
    Ripple,
    Text,
    useCss,
    focusRing,
    rippleButton,
    type RippleHandle,
  } from '../../src/lib/index.js';
  import { css } from 'zerodep-css-svelte';
  let {
    disabled = false,
    loading = false,
    fieldsetDisabled = false,
    show = true,
    type = 'button',
    onRipple,
  }: {
    disabled?: boolean;
    loading?: boolean;
    fieldsetDisabled?: boolean;
    show?: boolean;
    type?: 'button' | 'submit' | 'reset';
    onRipple?: (ripple: RippleHandle | undefined) => void;
  } = $props();
  const s = useCss();
  let ripple = $state<RippleHandle>();
  let clicks = $state(0);
  let submissions = $state(0);
  $effect(() => onRipple?.(ripple));
</script>

<button type="button">前一项</button>
<form
  onsubmit={(event) => {
    event.preventDefault();
    submissions++;
  }}
>
  <fieldset disabled={fieldsetDisabled}>
    <legend>按钮准备</legend>
    {#if show}
      <button
        {type}
        {disabled}
        aria-disabled={loading || undefined}
        aria-busy={loading || undefined}
        onclick={(event) => {
          if (loading || disabled || event.currentTarget.matches(':disabled')) {
            event.preventDefault();
            return;
          }
          clicks++;
        }}
        {@attach rippleButton(
          () => ripple,
          () => disabled || loading,
        )}
        class={css(
          s.position.relative,
          s.isolation.isolate,
          s.width.px(160),
          s.height.px(48),
          s.borderRadius._md,
          focusRing(s),
        )}
      >
        <Text class={css(s.position.relative, s.zIndex.raw(1))}>执行操作</Text>
        <Ripple bind:this={ripple} disabled={disabled || loading} data-testid="ripple-layer" />
      </button>
    {/if}
  </fieldset>
</form>
<button type="button">后一项</button>
<output aria-label="操作次数">{clicks}</output>
<output aria-label="提交次数">{submissions}</output>
