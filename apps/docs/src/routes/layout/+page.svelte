<script lang="ts">
  import {
    Flex,
    Grid,
    Container,
    Divider,
    Card,
    Text,
    Button,
    Checkbox,
    Select,
    Provider,
    useCss,
    lightTheme,
    darkTheme,
  } from 'zerodep-svelte-ui';
  import { css } from 'zerodep-css-svelte';
  const s = useCss();
  let dark = $state(false);
  let divided = $state(true);
  let columns = $state('repeat(auto-fit, minmax(min(100%, 18rem), 1fr))');
  let count = $state(0);
  const code = css(s.whiteSpace.preWrap, s.overflowWrap.anywhere);
</script>

<svelte:head><title>布局与 Card · zerodep svelte ui</title></svelte:head>
<p class="eyebrow">布局与展示</p>
<h1>布局与 Card</h1>
<p class="lead">
  Flex、Grid、Container 管理排列和空间，Card 复用 Text 与 Divider 组织内容。所有外观都通过现有 CSS
  工具生成。
</p>
<Flex align="center" wrap="wrap" gap="_lg" class={css(s.marginBlock.raw(s.theme.space._xl))}>
  <Checkbox bind:checked={dark}>深色主题</Checkbox>
  <Checkbox bind:checked={divided}>卡片分隔线</Checkbox>
  <label class="demo-label"
    >列布局 <Select bind:value={columns}>
      <option value="repeat(auto-fit, minmax(min(100%, 18rem), 1fr))">自适应</option>
      <option value="repeat(2, minmax(0, 1fr))">固定两列</option>
      <option value="minmax(0, 1fr)">单列</option>
    </Select></label
  >
</Flex>

<Provider theme={dark ? darkTheme : lightTheme}>
  <Container maxWidth="64rem" paddingInline={0} data-layout-container>
    <Grid {columns} gap="_lg" data-layout-grid>
      <Card
        title="交互预览"
        description="标题与操作区允许换行，正文保持自身交互。"
        {divided}
        data-layout-card
        slotProps={{ title: { as: 'h2' }, body: { class: css(s.minHeight.px(80)) } }}
      >
        <Button data-card-action onclick={() => count++}>增加计数</Button>
        {#snippet actions()}<Button onclick={() => (count = 0)}>重置计数</Button>{/snippet}
        {#snippet footer()}<Text>操作次数：<output aria-label="卡片操作次数">{count}</output></Text
          >{/snippet}
      </Card>
      <Card
        title="LongTitleWithoutSpacesForNarrowLayoutTesting"
        description="标题可断行；正文通过 slotProps 自行选择断行方式。"
        {divided}
        data-layout-card
        slotProps={{ title: { as: 'h2' }, body: { class: css(s.overflowWrap.anywhere) } }}
      >
        <Text>{'long-content-'.repeat(12)}</Text>
      </Card>
      <Card
        title="仅标题"
        description="没有正文或底部时，不创建空区域和多余分隔线。"
        data-layout-card
        slotProps={{ title: { as: 'h2' } }}
      />
    </Grid>
  </Container>
</Provider>

<section class="prose">
  <h2>Flex 与 Grid</h2>
  <pre class={code}><code
      >{`<Flex direction="row" gap="_md" align="center" wrap="wrap">
  <Button>保存</Button><Button>取消</Button>
</Flex>

<Grid columns="repeat(auto-fit, minmax(min(100%, 18rem), 1fr))" gap="_lg">
  <Card title="第一项">...</Card>
  <Card title="第二项">...</Card>
</Grid>`}</code
    ></pre>
  <p>
    Flex 默认 row、nowrap、stretch、flex-start；Grid 默认单列 minmax(0, 1fr)，均默认
    gap="_md"（12px）。方向、列、行、对齐和间距直接接收对应 CSS raw() 类型，支持 0、主题间距和原始
    CSS 值。响应式通过 CSS repeat/minmax 或 class 的媒体查询实现。
  </p>
  <p>
    根节点允许收缩，不改动子项的字号或最小尺寸。原生子项如长 pre 仍需按内容选择
    min-width:0、换行或滚动；组件不会用 overflow:hidden 隐藏溢出问题。
  </p>
  <p>
    Grid 默认 align="stretch" 会让同排卡片等高，与 Card 是否有正文无关；需要各自保持内容高度时使用
    align="start"。
  </p>

  <h2>Container</h2>
  <pre class={code}><code
      >{`<Container maxWidth="72rem" paddingInline="_xl">
  页面内容
</Container>`}</code
    ></pre>
  <p>
    宽度为父容器的 100%，通过 margin-inline:auto 居中，maxWidth 包含内边距。默认根字号 16px
    时外框上限 1152px，两侧各 24px，内容上限 1104px。文档站传入 1148px，保持原有 1100px
    的正文上限。布局组件不提供隐式缩放子组件的 size。
  </p>

  <h2>Divider</h2>
  <Flex align="center" class={css(s.height.px(40))}>
    <Text>左侧</Text><Divider orientation="vertical" aria-label="竖向分隔" /><Text>右侧</Text>
  </Flex>
  <Divider aria-label="横向分隔" class={css(s.marginBlock.raw(s.theme.space._lg))} />
  <p>
    默认水平、_divider 颜色和 _thin（1px）粗细，不额外添加 margin。竖线在横向 Flex
    中沿交叉轴拉伸，独立使用时需通过 class/style 给定高度。默认 role="separator"，纯装饰使用
    decorative；Card 内的分隔线已设置为装饰。
  </p>

  <h2>Card 的组合与定制</h2>
  <pre class={code}><code
      >{`<Card title="组件预览" description="修改参数后查看效果" divided
  padding="_lg" radius="_lg" shadow="none"
  slotProps={{ title: { as: 'h2' }, body: { class: css(s.padding._xl) } }}>
  <Checkbox bind:checked>启用</Checkbox>
  {#snippet actions()}<Button onclick={reset}>重置</Button>{/snippet}
  {#snippet footer()}<Text color="_muted">只影响当前示例</Text>{/snippet}
</Card>`}</code
    ></pre>
  <p>
    默认各区域内边距 16px、圆角 10px、1px 边框、无阴影；外框不重复加 padding。标题默认 Text
    span，不假定文档层级，可通过 slotProps.title.as 改为 h2/h3。Card
    自然撑高，内容区域不裁剪，不添加点击语义或 Tab 停靠点。
  </p>
  <p>
    slotProps.header/actions/footer 转发 Flex 参数；title/description 转发 Text 参数；body 转发 div
    属性与 class；divider 转发颜色、粗细及 class。显式值优先，class
    在对应默认声明之后组合。children、actions、footer 是内容 snippet，不替换底层实现。
  </p>
  <p>
    需要固定高度和覆盖式滚动条时，后续组合 ScrollArea；当前 Card 不自动添加滚动。现有
    spacing、radius、border、shadow 与颜色 token 已满足本批组件，没有建立组件专属 token 配置。
  </p>
</section>
