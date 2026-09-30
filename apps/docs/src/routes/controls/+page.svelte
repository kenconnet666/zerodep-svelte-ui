<script lang="ts">
  import {
    Checkbox,
    Select,
    Slider,
    Button,
    Provider,
    useCss,
    lightTheme,
    darkTheme,
  } from 'zerodep-svelte-ui';
  import { css } from 'zerodep-css-svelte';
  const s = useCss();
  let dark = $state(false);
  let disabled = $state(false);
  let size = $state('_md');
  let checked = $state(true);
  let mixed = $state(false);
  let choice = $state('b');
  let amount = $state(3);
  let submitted = $state('');
  const theme = $derived(dark ? darkTheme : lightTheme);
  const code = css(s.whiteSpace.preWrap, s.overflowWrap.anywhere);
</script>

<svelte:head><title>Checkbox、Select 与 Slider · zerodep svelte ui</title></svelte:head>
<p class="eyebrow">表单基础</p>
<h1>Checkbox、Select 与 Slider</h1>
<p class="lead">以原生表单控件处理交互，复用 Text、Icon、主题和焦点样式。</p>
<div class="demo-controls">
  <Checkbox bind:checked={dark}>深色主题</Checkbox>
  <Checkbox bind:checked={disabled}>禁用字段组</Checkbox>
  <label class="demo-label"
    >尺寸 <Select bind:value={size}
      ><option>_sm</option><option>_md</option><option>_lg</option><option>24px</option></Select
    ></label
  >
</div>
<Provider
  {theme}
  class={css(s.padding._lg, s.borderRadius._md, s.backgroundColor.raw(theme.color._background))}
>
  <form
    onsubmit={(event) => {
      event.preventDefault();
      submitted = JSON.stringify([...new FormData(event.currentTarget)]);
    }}
  >
    <fieldset
      {disabled}
      class={css(s.borderWidth.px(0), s.padding.px(0), s.margin.px(0), s.minWidth.px(0))}
    >
      <legend>原生表单演示</legend>
      <div class="demo-controls">
        <Checkbox
          {size}
          name="accepted"
          value="yes"
          defaultChecked
          bind:checked
          bind:indeterminate={mixed}>接受条款</Checkbox
        >
        <label class="demo-label"
          >选项 <Select {size} name="choice" defaultValue="b" bind:value={choice}>
            <option value="a">选项 A</option><option value="b">选项 B</option>
            <option value="c" disabled>选项 C（禁用）</option>
            <optgroup label="其他"><option value="d">选项 D</option></optgroup>
          </Select></label
        >
        <label class="demo-label"
          >时长 <Slider
            {size}
            name="duration"
            min={0}
            max={10}
            step={0.5}
            defaultValue={3}
            bind:value={amount}
            showValue
            formatValue={(value) => `${value}秒`}
          /></label
        >
      </div>
    </fieldset>
    <div class="demo-controls">
      <Button type="submit">读取表单</Button><Button type="reset">重置表单</Button>
      <Button onclick={() => (mixed = true)}>设为半选</Button>
    </div>
  </form>
  <p>
    <output aria-label="绑定状态"
      >{checked ? '已勾选' : '未勾选'} / {mixed ? '半选' : '非半选'} / {choice} / {amount}</output
    >
  </p>
  <p>表单数据：<output aria-label="表单数据">{submitted || '尚未读取'}</output></p>
</Provider>

<section class="prose">
  <h2>Checkbox</h2>
  <pre class={code}><code
      >{`<Checkbox bind:checked bind:indeterminate={mixed}
  name="accepted" value="yes" defaultChecked>
  接受条款
</Checkbox>`}</code
    ></pre>
  <p>
    children 是标签内容，内部复用 Text；原生 input 负责标签点击、Space、required、disabled
    和表单提交。indeterminate 与 checked 独立：半选不改变表单值，点击会清除半选。半选图形属于 DOM
    属性，水合后显示；SSR 先输出 aria-checked="mixed"。
  </p>
  <p>
    size 默认 _md=1rem，根字号 16px 时方框为 16px、文字为 14px、间距 8px。slotProps.input 定制 input
    的 class/style；slotProps.label 转发 Text 外观属性。标签内应使用文本等非交互内容。
  </p>

  <h2>Select</h2>
  <pre class={code}><code
      >{`<Select bind:value={choice} defaultValue="b" aria-label="选项">
  <option value="a">选项 A</option>
  <option value="b">选项 B</option>
  <optgroup label="其他"><option value="d">选项 D</option></optgroup>
</Select>`}</code
    ></pre>
  <p>
    单选原生 select，选项支持禁用与分组，value 保留 Svelte
    选项值的类型。展开、选项键盘操作和触屏选择器由浏览器提供，弹出列表外观随系统变化。此组件不包含搜索、多选或自定义弹层。
  </p>
  <p>
    默认外框 192×34px（基准 16px），文字 14px，箭头复用 Icon。slotProps.select 定制 select 的
    class/style；slotProps.icon 转发 Icon 外观属性。高对比度模式恢复系统箭头。
  </p>

  <h2>Slider</h2>
  <pre class={code}><code
      >{`<Slider bind:value={amount} min={0} max={10} step={0.5}
  defaultValue={3} aria-label="时长" showValue
  formatValue={(value) => value + '秒'} />`}</code
    ></pre>
  <p>
    单滑块水平 range，支持 min/max/step、默认值、方向键、Home/End 和原生 input/change
    事件。请传入符合边界和步长的数值；未设置 value/defaultValue 时从 min 开始。showValue 复用 Text
    显示数值，formatValue 同时提供 aria-valuetext。
  </p>
  <p>
    默认整体宽 192px、input 高 24px、滑块 16px、轨道 4px；size
    改变时按比例缩放。轨道使用固定颜色，不随拖动生成新 CSS 类。slotProps.input 定制 input 的
    class/style，slotProps.value 转发 Text 属性。当前没有双滑块、垂直方向或刻度标签组件。
  </p>

  <h2>共同约定</h2>
  <p>
    size 为 UiCss.fontSize.raw() 输入。顶层 class/style 定制外层容器，其他原生属性和事件传给真实
    input/select，例如 id、name、form、aria-label、aria-describedby。底层 class
    在默认声明后组合；slotProps 显式外观优先于联动默认值。禁用字段组同样生效。
  </p>
  <p>
    defaultChecked/defaultValue 表示表单重置目标，绑定值优先决定初始状态。原生 form.reset()
    会同步绑定值；需要条件取消重置时，应在触发按钮的 onclick 中 preventDefault，或使用 type="button"
    判断后再调用 form.reset()；当前 Svelte 版本中，仅取消 reset 事件可能仍先同步绑定。Select
    使用项目当前 Svelte 版本提供的 defaultValue 支持。无 JavaScript
    时保留原生输入和表单能力，双向绑定与演示按钮需要水合。
  </p>
</section>
