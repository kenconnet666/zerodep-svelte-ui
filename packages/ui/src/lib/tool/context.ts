import { getContext, setContext } from 'svelte';

/** 在模块顶层创建一次；各组件初始化时调用 optional/provide/use，共享键但不共享组件树中的值。 */
export function context<T>() {
  const key = Symbol();
  return {
    optional: () => getContext<T | undefined>(key),
    provide: (value: T) => setContext(key, value),
    use(): T {
      const value = getContext<T | undefined>(key);
      if (value === undefined) throw new Error('Required context was not provided.');
      return value;
    },
  };
}
