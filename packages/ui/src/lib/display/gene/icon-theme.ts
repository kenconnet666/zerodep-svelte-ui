import type { UiTheme } from '../../provider/theme/types.js';

/** 图标专属 token；不把描边和基线偏移提升为系统 token。 */
export interface IconTokens {
  readonly _sizeSm: string;
  readonly _sizeMd: string;
  readonly _sizeLg: string;
  readonly _colorText: string;
  readonly _colorMuted: string;
  readonly _colorTextDisabled: string;
  readonly _colorPrimary: string;
  readonly _colorInfo: string;
  readonly _colorSuccess: string;
  readonly _colorWarning: string;
  readonly _colorDanger: string;
  readonly _strokeWidth: number;
  readonly _verticalAlign: string;
}

/** 在当前 Provider 的系统主题下派生；不继承父级已计算的默认颜色。 */
export function createIconTokens(theme: UiTheme): IconTokens {
  return {
    _sizeSm: theme.fontSize._sm,
    _sizeMd: theme.fontSize._md,
    // 图标 large 为 24px；系统正文 lg 为 20px，二者是不同的尺寸角色。
    _sizeLg: theme.fontSize._xl,
    _colorText: theme.color._text,
    _colorMuted: theme.color._muted,
    _colorTextDisabled: theme.color._textDisabled,
    _colorPrimary: theme.color._primary,
    _colorInfo: theme.color._info,
    _colorSuccess: theme.color._success,
    _colorWarning: theme.color._warning,
    _colorDanger: theme.color._danger,
    _strokeWidth: 2,
    _verticalAlign: '-0.125em',
  };
}
