import { Css, createCssContext } from 'zerodep-css-svelte';

// 模块级只保存上下文键；作者实例由根布局按请求创建。
export const { provideCss, useCss } = createCssContext<Css>();
