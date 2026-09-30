<script lang="ts">
  import { Provider, Container, Grid, Card, Flex, Divider, Text } from 'zerodep-svelte-ui';
</script>

<Provider>
  <Container maxWidth="40rem">
    <Grid>
      <Card title="标题 <内容>" description="说明" divided slotProps={{ title: { as: 'h2' } }}>
        <Text>正文</Text>
        {#snippet actions()}<button type="button">操作</button>{/snippet}
        {#snippet footer()}<Flex><Text>底部</Text></Flex>{/snippet}
      </Card>
    </Grid>
    <Divider aria-label="结束分隔" />
  </Container>
</Provider>
