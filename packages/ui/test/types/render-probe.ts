import type { ComponentProps } from 'svelte';
import type RenderProbe from '../fixtures/RenderProbe.svelte';

// 当前只有测试夹具；公共组件出现后在此目录增加其 props、绑定和 snippet 类型用例。
type Props = ComponentProps<typeof RenderProbe>;

export const validProps: Props = { label: '文本' };
// @ts-expect-error label 必须是字符串。
export const invalidLabel: Props = { label: 123 };
// @ts-expect-error 必填属性不能省略。
export const missingLabel: Props = {};
