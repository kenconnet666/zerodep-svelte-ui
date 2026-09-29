import { parse } from 'svelte/compiler';
import MagicString from 'magic-string';
import {
  lucideIconNames,
  lucideDynamicIconImports,
  type LucideIconName,
} from '@lucide/icons/dynamic';

const names = new Set<string>(lucideIconNames);
const members = new Map<string, string>();
for (const name of [...lucideIconNames].sort()) {
  const member = name.replace(/-([a-z0-9])/g, (_, letter: string) => letter.toUpperCase());
  if (!members.has(member)) members.set(member, name);
}
type Node = { type: string; start?: number; end?: number; [key: string]: unknown };
const isNode = (value: unknown): value is Node =>
  typeof value === 'object' && value !== null && 'type' in value;

/** 只收集绑定位置，不能把对象解构的属性名或默认值表达式当成局部变量。 */
function bind(pattern: unknown, scope: Set<string>): void {
  if (!isNode(pattern)) return;
  if (pattern.type === 'Identifier') scope.add(pattern.name as string);
  else if (pattern.type === 'RestElement') bind(pattern.argument, scope);
  else if (pattern.type === 'AssignmentPattern') bind(pattern.left, scope);
  else if (pattern.type === 'ArrayPattern') {
    for (const item of pattern.elements as unknown[]) bind(item, scope);
  } else if (pattern.type === 'ObjectPattern') {
    for (const item of pattern.properties as Node[])
      bind(item.type === 'RestElement' ? item.argument : item.value, scope);
  }
}

function literal(value: unknown): string | undefined {
  if (Array.isArray(value)) return value.length === 1 ? literal(value[0]) : undefined;
  if (!isNode(value)) return;
  if (value.type === 'Text') return value.data as string;
  if (value.type === 'ExpressionTag' && isNode(value.expression)) {
    const expression = value.expression;
    if (expression.type === 'Literal' && typeof expression.value === 'string')
      return expression.value;
    if (expression.type === 'ArrowFunctionExpression' && !expression.async) {
      const parameters = expression.params as Node[];
      const body = expression.body;
      if (
        parameters.length === 1 &&
        parameters[0].type === 'Identifier' &&
        isNode(body) &&
        body.type === 'MemberExpression' &&
        !body.computed &&
        !body.optional &&
        isNode(body.object) &&
        body.object.type === 'Identifier' &&
        body.object.name === parameters[0].name &&
        isNode(body.property) &&
        body.property.type === 'Identifier'
      ) {
        const member = body.property.name as string;
        return members.get(member) ?? `成员 ${member}`;
      }
    }
  }
}

export async function transformLucide(source: string, filename: string) {
  if (!source.includes('lucide') || !source.includes('zerodep-svelte-ui')) return;
  const ast = parse(source, { modern: true, filename });
  const imports = new Map<string, string>();
  // 只识别实例脚本的显式包导入；不推断跨文件再导出或动态组件。
  for (const statement of ast.instance?.content.body ?? []) {
    if (
      statement.type !== 'ImportDeclaration' ||
      statement.source.value !== 'zerodep-svelte-ui' ||
      ('importKind' in statement && statement.importKind === 'type')
    )
      continue;
    for (const specifier of statement.specifiers) {
      if (specifier.type === 'ImportNamespaceSpecifier')
        imports.set(`${specifier.local.name}.Icon`, specifier.local.name);
      else if (
        specifier.type === 'ImportSpecifier' &&
        (!('importKind' in specifier) || specifier.importKind !== 'type') &&
        (specifier.imported.type === 'Identifier'
          ? specifier.imported.name
          : specifier.imported.value) === 'Icon'
      )
        imports.set(specifier.local.name, specifier.local.name);
    }
  }
  if (!imports.size) return;
  const output = new MagicString(source);
  const used = new Map<string, string>();
  let serial = 0;
  function fail(message: string, at: Node): never {
    const before = source.slice(0, at.start);
    const line = before.split('\n').length;
    const column = before.length - before.lastIndexOf('\n');
    throw new Error(`${filename}:${line}:${column}: [zerodep-ui-lucide] ${message}`);
  }
  function visit(value: unknown, scope: Set<string>): void {
    if (Array.isArray(value)) {
      for (const item of value) visit(item, scope);
      return;
    }
    if (!isNode(value)) return;
    if (value.type === 'Fragment') {
      const nested = new Set(scope);
      for (const child of value.nodes as Node[]) {
        if (child.type === 'ConstTag' && isNode(child.declaration)) {
          for (const declaration of child.declaration.declarations as Node[])
            bind(declaration.id, nested);
        } else if (child.type === 'SnippetBlock') bind(child.expression, nested);
      }
      visit(value.nodes, nested);
      return;
    }
    if (value.type === 'EachBlock') {
      const nested = new Set(scope);
      bind(value.context, nested);
      if (typeof value.index === 'string') nested.add(value.index);
      visit(value.body, nested);
      visit(value.fallback, scope);
      return;
    }
    if (value.type === 'SnippetBlock') {
      const nested = new Set(scope);
      for (const parameter of value.parameters as unknown[]) bind(parameter, nested);
      visit(value.body, nested);
      return;
    }
    if (value.type === 'AwaitBlock') {
      visit(value.pending, scope);
      const thenScope = new Set(scope);
      bind(value.value, thenScope);
      visit(value.then, thenScope);
      const catchScope = new Set(scope);
      bind(value.error, catchScope);
      visit(value.catch, catchScope);
      return;
    }
    if (value.type === 'Component') {
      const owner = imports.get(value.name as string);
      if (owner && !scope.has(owner)) {
        const attributes = value.attributes as Node[];
        const lucide = attributes.find((a) => a.type === 'Attribute' && a.name === 'lucide');
        if (lucide) {
          if (attributes.some((a) => a.type === 'SpreadAttribute'))
            fail('lucide 不支持属性 spread；请使用 icon={数据}。', lucide);
          if (attributes.some((a) => a.name === 'icon'))
            fail('icon 与 lucide 必须二选一。', lucide);
          const name = literal(lucide.value);
          if (name === undefined)
            fail(
              'lucide 只接受字符串字面量或 i => i.search 这样的直接成员选择；动态选择请使用 icon={数据}。',
              lucide,
            );
          if (!names.has(name))
            fail(`未知 Lucide 名称 ${JSON.stringify(name)}；加号的官方名称为 plus。`, lucide);
          let identifier = used.get(name);
          if (!identifier) {
            // 包括模板局部变量，避免注入名称被用户绑定遮蔽。
            do {
              identifier = `__zerodepLucide${serial++}`;
            } while (source.includes(identifier));
            used.set(name, identifier);
          }
          output.overwrite(lucide.start!, lucide.end!, `icon={${identifier}}`);
        }
      }
    }
    // 旧式 slot 的 let 只影响子内容，不影响当前组件自身的属性。
    const nested = new Set(scope);
    for (const attribute of (value.attributes as Node[] | undefined) ?? []) {
      if (attribute.type === 'LetDirective') {
        if (attribute.expression) bind(attribute.expression, nested);
        else nested.add(attribute.name as string);
      }
    }
    for (const [key, child] of Object.entries(value)) {
      if (key !== 'attributes') visit(child, key === 'fragment' ? nested : scope);
    }
  }
  visit(ast.fragment, new Set());
  if (!used.size) return;
  // 官方别名可能没有同名文件；只在构建进程加载用到的数据，取得其规范名称。
  const declarations = (
    await Promise.all(
      [...used].map(async ([name, identifier]) => {
        const { default: data } = await lucideDynamicIconImports[name as LucideIconName]();
        if (!data.name || !names.has(data.name)) throw new Error('Lucide 图标缺少有效的规范名称');
        return `import ${identifier} from ${JSON.stringify(`@lucide/icons/icons/${data.name}`)};`;
      }),
    )
  ).join('\n');
  output.appendLeft(
    (ast.instance!.content as unknown as { start: number }).start,
    `\n${declarations}\n`,
  );
  return {
    code: output.toString(),
    map: output.generateMap({ source: filename, includeContent: true, hires: true }),
  };
}
