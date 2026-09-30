<script lang="ts">
  import {
    Ripple,
    Flex,
    Checkbox,
    Select,
    Text,
    useCss,
    focusRing,
    rippleButton,
    type RippleHandle,
  } from 'zerodep-svelte-ui';
  import { css } from 'zerodep-css-svelte';
  const s = useCss();
  let ripple = $state<RippleHandle>();
  let disabled = $state(false);
  let loading = $state(false);
  let fieldsetDisabled = $state(false);
  let type = $state<'button' | 'submit'>('button');
  let clicks = $state(0);
  let submissions = $state(0);
  const code = css(s.whiteSpace.preWrap, s.overflowWrap.anywhere);
</script>

<svelte:head><title>Ripple 与焦点 · zerodep svelte ui</title></svelte:head>
<p class="eyebrow">交互基础</p>
<h1>Ripple 与原生按钮</h1>
<p class="lead">从点击位置扩散的视觉反馈。下方是原生按钮测试示例，还不是正式 Button 组件。</p>
<Flex wrap="wrap" align="center" gap="_lg" class={css(s.marginBlock.raw(s.theme.space._xl))}>
  <Checkbox bind:checked={disabled}>禁用按钮</Checkbox>
  <Checkbox bind:checked={loading}>加载中</Checkbox>
  <Checkbox bind:checked={fieldsetDisabled}>禁用字段组</Checkbox>
  <label class="demo-label"
    >按钮类型 <Select bind:value={type}><option>button</option><option>submit</option></Select
    ></label
  >
</Flex>
<button type="button" data-focus-before>前一项</button>
<form
  onsubmit={(event) => {
    event.preventDefault();
    submissions++;
  }}
>
  <fieldset disabled={fieldsetDisabled}>
    <legend>交互演示</legend>
    <button
      data-ripple-button
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
        s.minWidth.px(180),
        s.height._lg,
        s.paddingInline._lg,
        s.borderRadius._md,
        s.borderStyle.solid,
        s.borderWidth._thin,
        s.borderColor._primary,
        s.backgroundColor._surface,
        s.color._primary,
        focusRing(s),
      )}
    >
      <Text class={css(s.position.relative, s.zIndex.raw(1))}>测试按钮</Text>
      <Ripple bind:this={ripple} disabled={disabled || loading} data-ripple-layer />
    </button>
  </fieldset>
</form>
<button type="button" data-focus-after>后一项</button>
<p>
  <output aria-label="操作次数">{clicks}</output> 次操作；<output aria-label="提交次数"
    >{submissions}</output
  > 次表单提交。
</p>

<section class="prose">
  <h2>接入</h2>
  <pre class={code}><code
      >{`// 组件位于 Provider 后代中。
const s = useCss();
let ripple = $state<RippleHandle>();

<button type="button"
  {@attach rippleButton(() => ripple)}
  class={css(s.position.relative, s.isolation.isolate, focusRing(s))}
  onclick={handleClick}>
  <Text>保存</Text>
  <Ripple bind:this={ripple} />
</button>`}</code
    ></pre>
  <p>
    Ripple
    的父容器提供定位上下文和尺寸；覆盖层自身裁剪并继承圆角，不裁剪按钮外侧的焦点环。文字要位于波纹上方时，可像示例一样使用相对定位和
    z-index。
  </p>
  <h2>API 与边界</h2>
  <table>
    <thead><tr><th>入口</th><th>含义</th></tr></thead><tbody>
      <tr
        ><td>color / opacity</td><td
          >分别取 UiCss.color.raw 和 opacity.raw 的输入；默认 _primary / _pressed。class 为
          CssInput。</td
        ></tr
      >
      <tr><td>disabled</td><td>只控制视觉反馈；设为 true 时取消并清理波纹。</td></tr>
      <tr
        ><td>start(origin?)</td><td
          >返回波纹编号；坐标为 clientX/clientY，省略时居中。未挂载、隐藏或禁用时不创建波纹。</td
        ></tr
      >
      <tr
        ><td>stop(id?) / cancel()</td><td
          >stop 淡出指定波纹，省略编号则全部淡出；cancel 立即清理。</td
        ></tr
      >
      <tr
        ><td>rippleButton()</td><td
          >原生 HTMLButtonElement 的 attachment，只观察输入。不会调用 click、用户回调或提交表单。</td
        ></tr
      >
      <tr><td>focusRing(s)</td><td>生成 :focus-visible 样式；不管理焦点、不拦截键盘。</td></tr>
    </tbody>
  </table>
  <p>
    按压从接触点扩散，松开后淡出；键盘和程序化的无指针 click
    从中心播放一次。取消、移出、失焦、禁用和卸载时清理。默认扩散 250ms、淡出 150ms，快速点击至少显示
    80ms，同时最多保留 4 个波纹。
  </p>
  <p>
    启用系统“减少动效”后不创建扩散动画，偏好在播放期间变化也会取消动画。波纹始终
    aria-hidden、pointer-events:none，不参与焦点和可访问名称。坐标写入节点内联样式，不为每次点击登记新
    CSS 类。
  </p>
  <p>
    disabled 语义、loading 的点击拦截和表单行为由使用方负责；上面的 loading 示例使用
    aria-disabled/aria-busy
    并阻止重复操作，同时保留焦点。交互工具不替代这些逻辑。旋转或倾斜变换后的任意几何形状不是本阶段定位目标。
  </p>
</section>
