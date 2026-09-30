<script lang="ts">
  import { Search } from '@lucide/icons';
  import { Button, Loading, Checkbox, useCss } from 'zerodep-svelte-ui';
  import { css } from 'zerodep-css-svelte';
  const s = useCss();
  let loading = $state(false);
  let disabled = $state(false);
  let clicks = $state(0);
  const code = css(s.whiteSpace.preWrap, s.overflowWrap.anywhere);
</script>

<svelte:head><title>Button 与 Loading · zerodep svelte ui</title></svelte:head>
<p class="eyebrow">输入与反馈</p>
<h1>Button 与 Loading</h1>
<p class="lead">
  固定的原生按钮，复用 Text、Icon、Loading、Ripple。通过 class 和 slotProps 定制外观。
</p>
<div class="demo-controls">
  <Checkbox bind:checked={loading}>加载中</Checkbox>
  <Checkbox bind:checked={disabled}>禁用</Checkbox>
</div>
<div class="demo-controls">
  <Button data-button-preview {loading} {disabled} icon={Search} onclick={() => clicks++}
    >保存</Button
  >
  <output aria-label="操作次数">{clicks}</output>
  <Loading />
</div>

<section class="prose">
  <h2>size 等比联动，slotProps 局部覆盖</h2>
  <p>
    size 接收 UiCss.fontSize.raw() 的输入，默认 _md=1rem。以这个基准 B 计算：外框高
    2.125B、左右内边距各 0.75B、边框 0.0625B、圆角 0.375B、文字 0.875B、图标与 Loading 1B、图文间距
    0.5B。上下内边距为 0，内容由 flex 居中。
  </p>
  <p>
    根字号 16px 时，文字为 14px、行框为 21px、图标为 16px。两字宽度约 28px 时，纯文字按钮宽约
    54px，带图标约 78px；实际字宽取决于字体。size 改为 20px 时，外框高 42.5px、文字 17.5px、图标
    20px、左右内边距各 15px。这里的 _md/_lg 是字号分类的基准，并非 controlHeight 的档位。
  </p>
  <div class="demo-controls">
    <Button data-default-size>保存</Button>
    <Button size="_lg">等比放大</Button>
    <Button class={css(s.width.px(120), s.height.px(40))}>固定宽高</Button>
  </div>
  <Button class={css(s.width.raw('100%'))}>铺满父容器</Button>
  <pre class={code}><code
      >{`<Button
  size="_lg"
  slotProps={{ label: { size: '_md', lineHeight: '_normal' } }}
>保存</Button>

<Button class={css(s.width.px(120), s.height.px(40))}>保存</Button>`}</code
    ></pre>
  <p>
    size 默认联动所有部分；slotProps 显式传入的值优先，例如 label.size="18px"
    会固定文字大小。单独覆盖文字可能脱离原比例，应确保外框足够高。顶层 class
    最后组合，可独立覆盖高度、宽度和内边距。按钮默认单行，父容器 Flex/Grid 也可能约束最终宽度。
  </p>

  <h2>复用底层组件并转发属性</h2>
  <p>
    slotProps.label、icon、loading、ripple 分别转发对应组件的外观属性、class、原生 style 等。class
    在底层默认声明之后组合。Text 标签固定为 span，图标为装饰；内容与加载、禁用状态由 Button 管理。
  </p>
  <pre class={code}><code
      >{`<Button icon={Search} {loading}
  slotProps={{
    label: { fontWeight: '_semibold', style: 'letter-spacing: 1px' },
    icon: { size: '18px' },
    loading: { size: '1em', color: 'inherit' },
    ripple: { color: '_primary', opacity: 0.12 },
  }}
>保存</Button>`}</code
    ></pre>
  <p>
    children snippet 只承载内容，不应放置另一个按钮、链接或其他交互元素。根节点始终为 button，不提供
    as、href、slots 或根组件替换，也不规划这些入口。纯图标按钮应在根节点传 aria-label。
  </p>

  <h2>禁用与加载</h2>
  <p>
    disabled 使用原生禁用，退出 Tab 顺序。loading 是受控布尔值，通过 aria-disabled 和 aria-busy
    保留焦点，同时阻止点击回调和默认提交；不会自动追踪
    Promise。加载时原内容透明占位并保留可访问名称，Loading 和 Ripple 不增加宽高。
  </p>
  <p>
    默认 type="button"；显式 type="submit" 或 type="reset" 使用原生表单行为。业务仍需在表单 onsubmit
    中管理整个表单的提交状态，按钮不能拦截 form.requestSubmit()
    等绕过点击的路径。服务端首屏仅有语义标记，加载点击守卫需要水合后生效。
  </p>
  <p>
    Loading 单独使用时通过当前语言提供加载状态名称，可用 label 覆盖。嵌入 Button
    时是装饰，避免重复播报；减少动效偏好下显示静止圆环。
  </p>
</section>
