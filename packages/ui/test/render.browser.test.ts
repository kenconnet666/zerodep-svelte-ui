import { afterEach, expect, test } from 'vitest';
import { cleanup, render } from 'vitest-browser-svelte';
import RenderProbe from './fixtures/RenderProbe.svelte';

afterEach(cleanup);

// 只验证测试环境与 npm CSS 接入；正式组件的行为用例随组件添加。
test('浏览器挂载 Svelte 组件并应用 npm CSS 样式', async () => {
  const screen = await render(RenderProbe, { label: '样式已挂载' });
  await expect.element(screen.getByText('样式已挂载')).toHaveStyle({ color: 'rgb(255, 0, 0)' });
});

test('更新 props 后重新渲染，文本保持转义', async () => {
  const screen = await render(RenderProbe, { label: '原始文本' });
  await screen.rerender({ label: '<strong>新文本</strong>' });
  await expect.element(screen.getByText('<strong>新文本</strong>', { exact: true })).toBeVisible();
  await expect.element(screen.getByText('原始文本', { exact: true })).not.toBeInTheDocument();
});
