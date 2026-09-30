<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import {
    Provider,
    Flex,
    Grid,
    Container,
    Divider,
    Card,
    Button,
    type UiTheme,
  } from '../../src/lib/index.js';
  let {
    theme,
    flex = {},
    grid = {},
    container = {},
    card = {},
    divider = {},
  }: {
    theme?: UiTheme;
    flex?: Partial<ComponentProps<typeof Flex>>;
    grid?: Partial<ComponentProps<typeof Grid>>;
    container?: Partial<ComponentProps<typeof Container>>;
    card?: Partial<ComponentProps<typeof Card>>;
    divider?: Partial<ComponentProps<typeof Divider>>;
  } = $props();
  let clicks = $state(0);
</script>

<Provider {theme}>
  <div style="width:600px;max-width:100%">
    <Container data-testid="container" maxWidth="400px" paddingInline="_lg" {...container}>
      <Grid data-testid="grid" columns="repeat(2, minmax(0, 1fr))" gap="_lg" {...grid}>
        <Card title={'long-title-'.repeat(12)} data-testid="long-card" />
        <Card title="另一张卡片" />
      </Grid>
    </Container>
  </div>
  <Flex data-testid="flex" {...flex}
    ><span data-testid="first">第一项</span><span data-testid="second">第二项</span></Flex
  >
  <Divider data-testid="horizontal" {...divider} />
  <Flex align="center" style="height:40px"
    ><span>左</span><Divider orientation="vertical" data-testid="vertical" /><span>右</span></Flex
  >
  <Card data-testid="card" title="预览" description="说明文字" divided {...card}>
    <Button onclick={() => clicks++}>正文操作</Button>
    {#snippet actions()}<Button onclick={() => clicks++}>头部操作</Button>{/snippet}
    {#snippet footer()}<Button onclick={() => clicks++}>底部操作</Button>{/snippet}
  </Card>
  <Card data-testid="header-only" title="仅标题" />
  <output aria-label="操作次数">{clicks}</output>
</Provider>
