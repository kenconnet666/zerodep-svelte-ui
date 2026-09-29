<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Search, Check } from '@lucide/icons';
  import { Icon, Provider, useCss, lightTheme, darkTheme } from 'zerodep-svelte-ui';
  import { css } from 'zerodep-css-svelte';

  const s = useCss();
  const panel = css(s.padding.rem(1.5), s.borderRadius.px(12));
  const row = css(s.display.flex, s.alignItems.center, s.gap.rem(1.5), s.flexWrap.wrap);
  const code = css(s.whiteSpace.preWrap, s.overflowWrap.anywhere);
  type IconProps = ComponentProps<typeof Icon>;
  const colors: IconProps['color'][] = [
    'inherit',
    '_text',
    '_muted',
    '_textDisabled',
    '_primary',
    '_info',
    '_success',
    '_warning',
    '_danger',
    '_onPrimary',
    '#7e22ce',
    'currentColor',
  ];
  let choice = $state<'Search' | 'Check'>('Search');
  let size = $state<IconProps['size']>('_md');
  let color = $state<IconProps['color']>('_primary');
  let theme = $state<'light' | 'dark'>('light');
  const selectedTheme = $derived(theme === 'light' ? lightTheme : darkTheme);
  let strokeWidth = $state(2);
  let searches = $state(0);
  let customAppearance = $state(false);
  const selected = $derived(choice === 'Search' ? Search : Check);
</script>

<svelte:head>
  <title>Icon · zerodep svelte ui</title>
  <meta
    name="description"
    content="按需传入 Lucide 图形数据，使用共享作者的语义尺寸、颜色和可访问性。"
  />
</svelte:head>

<p class="eyebrow">基础组件</p>
<h1>Icon</h1>
<p class="lead">传入图标数据，统一使用组件库的尺寸、颜色和主题。</p>

<section class="prose">
  <h2>选择图标</h2>
  <div class={row}>
    <Icon lucide={(i) => i.search} aria-label="按名称搜索" data-lucide-search />
    <Icon lucide={(i) => i.plus} aria-label="按名称添加" data-lucide-plus />
  </div>
  <pre class={code}><code
      >{`<Icon lucide={i => i.search} />
<Icon lucide={i => i.circlePlus} />
<Icon lucide="search" />
<Icon lucide="plus" />
<Icon lucide="circle-plus" color="_primary" />`}</code
    ></pre>
  <p>
    lucide 支持成员选择回调，在 i. 后补全图标；多词名称使用 circlePlus 这样的
    camelCase。字符串字面量写法也保留，加号使用 plus。启用 zerodep-svelte-ui/vite
    后，名称编译为单个图标导入，SSR 同步输出图形。 icon 与 lucide 二选一；动态选择继续使用 <code
      >icon=&#123;数据&#125;</code
    >。lucide 仅支持实例脚本从包入口显式导入的 Icon（含别名、命名空间），不支持属性 spread
    或跨文件再导出。
  </p>
  <pre class={code}><code
      >{`import uiIcons from 'zerodep-svelte-ui/vite';
// 放在 Svelte/SvelteKit 插件之前，CSS 绑定插件仍需启用。
plugins: [uiIcons(), cssBindings(), sveltekit()]`}</code
    ></pre>
  <h2>直接设置外观</h2>
  <label><input type="checkbox" bind:checked={customAppearance} /> 使用自定义外观</label>
  <Icon
    icon={Search}
    size={customAppearance ? '28px' : undefined}
    color={customAppearance ? '#7e22ce' : undefined}
    strokeWidth={customAppearance ? '3px' : undefined}
    verticalAlign={customAppearance ? 'middle' : undefined}
    aria-label="自定义外观图标"
    data-icon-custom
  />
  <p>四个属性直接接收对应 CSS 属性的输入；省略或传 undefined 时使用组件默认值。</p>
  <pre class={code}><code
      >{`<Icon icon={Search} size="18px" color="#7e22ce" strokeWidth={1.75} verticalAlign="middle" />
<Icon icon={Check} size="_xl" color="_success" />`}</code
    ></pre>
  <p>
    size 使用系统字号或带单位的 CSS 值，宽高为 1em；_lg 对应 20px，_xl 对应 24px（根字号 16px）。
    color 使用系统颜色 token 或原始 CSS 颜色。主题 token 必须带下划线；未知字符串沿用 raw()
    的行为，不进行拼写校验。
  </p>
</section>

<div class="demo-controls">
  <label
    >图标 <select bind:value={choice}><option>Search</option><option>Check</option></select></label
  >
  <label
    >尺寸 <select bind:value={size}
      ><option>_xs</option><option>_sm</option><option>_md</option><option>_lg</option><option
        >_xl</option
      ><option>_2xl</option><option>18px</option><option>inherit</option></select
    ></label
  >
  <label
    >颜色 <select bind:value={color}
      >{#each colors as value (value)}<option>{value}</option>{/each}</select
    ></label
  >
  <label>主题 <select bind:value={theme}><option>light</option><option>dark</option></select></label
  >
  <label>描边 <input type="range" min="0.5" max="4" step="0.25" bind:value={strokeWidth} /></label>
  <output aria-label="描边宽度">{strokeWidth}</output>
</div>

<Provider
  theme={selectedTheme}
  class={css(panel, s.backgroundColor.raw(selectedTheme.color._background))}
>
  <div class={row}>
    <Icon icon={selected} {size} {color} {strokeWidth} aria-label="预览图标" data-icon-preview />
    <span>语义尺寸 {size}，颜色 {color}</span>
    <button type="button" aria-label="搜索" onclick={() => searches++}
      ><Icon icon={Search} /></button
    >
    <output aria-label="搜索次数">{searches}</output>
  </div>
</Provider>

<section class="prose">
  <h2>使用</h2>
  <pre class={code}><code
      >{`import { Search } from '@lucide/icons';
import { Provider, Icon } from 'zerodep-svelte-ui';`}</code
    ></pre>
  <pre class={code}><code
      >{`<Provider>
  <Icon icon={Search} />
  <Icon icon={Search} size="_lg" color="_primary" aria-label="搜索" />
</Provider>`}</code
    ></pre>
  <h2>属性</h2>
  <table>
    <thead><tr><th>属性</th><th>说明</th></tr></thead><tbody>
      <tr
        ><td>icon</td><td
          >LucideIconData 图形数据，与 lucide 二选一，支持响应式替换，不接受子组件或 children。</td
        ></tr
      >
      <tr
        ><td>lucide</td><td
          >成员回调（如 i =&gt; i.search）或官方名称字面量，需要 UI 编译插件；与 icon 二选一。</td
        ></tr
      >
      <tr
        ><td>size</td><td
          >fontSize.raw() 的输入，默认 _md；支持全部系统字号、18px、1.25rem、inherit
          等，不把非零数字转换成 px。</td
        ></tr
      >
      <tr
        ><td>color</td><td
          >color.raw() 的输入，默认 inherit；支持全部系统颜色 token、原始颜色和 CSS 关键字。</td
        ></tr
      >
      <tr
        ><td>strokeWidth</td><td
          >strokeWidth.raw() 的输入，默认 2；支持数字、长度和 CSS 关键字，直接生成描边声明。</td
        ></tr
      >
      <tr
        ><td>verticalAlign</td><td
          >verticalAlign.raw() 的输入，默认 -0.125em；例如 middle、baseline、0px。</td
        ></tr
      >
      <tr><td>class</td><td>CssInput；外部 css() 结果放在默认声明之后，合成一个类。</td></tr>
      <tr><td>style</td><td>根 SVG 的原生内联样式。</td></tr>
    </tbody>
  </table>
  <h2>可访问性</h2>
  <p>
    默认作为装饰图标隐藏，提供 aria-label 或 aria-labelledby 时自动赋予 img 角色。显式 aria-hidden
    优先。仅图标按钮把名称放在按钮上，图标本身不增加 Tab 停靠点。
  </p>
  <h2>主题与 class 定制</h2>
  <p>
    通用颜色与字号直接使用 UiCss 的系统 token。Icon 的描边、基线偏移和结构样式在组件内部定义，
    默认值就近写在 Svelte props 中。更细的外观定制通过 class 完成，无需额外的组件 token 配置。
  </p>
  <pre class={code}><code
      >{`<Icon icon={Search} class={css(s.fontSize.px(22), s.color._primary, s.strokeWidth.raw(1.5))} />`}</code
    ></pre>
  <p>
    class 优先传入同一宿主的 css() 结果，也接受 CSS 声明、嵌套数组和条件空项；
    不透传普通类名、多类名字符串或条件对象。同等层叠条件下，外部声明覆盖默认值。
  </p>
  <p>
    Icon 复用最近 Provider 的 Css 作者，颜色和字号从注入的主题对象读取。 应用通过 Provider 的 theme
    传入自定义对象。viewBox 来自图标数据；图形节点保留 SVG 命名空间，不修改共享资源。
  </p>
  <p>
    消费应用必须安装 @lucide/icons 并启用
    zerodep-css-svelte/vite。只导入实际使用的图标，组件库不登记全量图标表。
  </p>
</section>
