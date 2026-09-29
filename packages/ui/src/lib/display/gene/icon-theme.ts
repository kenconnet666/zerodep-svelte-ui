import type { UiTheme } from '../../provider/theme/types.js';

/** 图标专属 token；不把描边和基线偏移提升为系统 token。 */
export interface IconTokens {
  readonly sizeSm: string;
  readonly sizeMd: string;
  readonly sizeLg: string;
  readonly colorText: string;
  readonly colorMuted: string;
  readonly colorTextDisabled: string;
  readonly colorPrimary: string;
  readonly colorInfo: string;
  readonly colorSuccess: string;
  readonly colorWarning: string;
  readonly colorDanger: string;
  readonly strokeWidth: number;
  readonly verticalAlign: string;
}

/** 在当前 Provider 的系统主题下派生；不继承父级已计算的默认颜色。 */
export function createIconTokens(theme: UiTheme): IconTokens {
  return {
    sizeSm: theme.fontSize.sm,
    sizeMd: theme.fontSize.md,
    // 图标 large 为 24px；系统正文 lg 为 20px，二者是不同的尺寸角色。
    sizeLg: theme.fontSize.xl,
    colorText: theme.color.text,
    colorMuted: theme.color.muted,
    colorTextDisabled: theme.color.textDisabled,
    colorPrimary: theme.color.primary,
    colorInfo: theme.color.info,
    colorSuccess: theme.color.success,
    colorWarning: theme.color.warning,
    colorDanger: theme.color.danger,
    strokeWidth: 2,
    verticalAlign: '-0.125em',
  };
}
