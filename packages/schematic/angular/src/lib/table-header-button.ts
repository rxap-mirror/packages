import { capitalize } from '@rxap/schematics-utilities';
import { Normalized } from '@rxap/utilities';

export interface TableHeaderButton {
  role?: string;
  permission?: string;
  icon?: string;
  svgIcon?: string;
  label?: string;
  options?: Record<string, any>;
}

export function NormalizeTableHeaderButton(
  tableHeaderButton: Readonly<TableHeaderButton> | string | undefined,
  name: string,
): Readonly<Normalized<TableHeaderButton>> | null {
  if (!tableHeaderButton) {
    return null;
  }
  let role: string | null = null;
  let icon: string | null = null;
  let svgIcon: string | null = null;
  let permission: string | null = null;
  let label: string | null = null;
  let options: Record<string, any> | null = null;
  if (typeof tableHeaderButton === 'string') {
    // role:modifier1,modifier2
    // create:icon(add),permission(create)
    const fragments = tableHeaderButton.split(':');
    role = fragments[0];
    if (fragments[1]) {
      const modifiers = fragments[1].split(/,(?![^(]*\))/g);
      if (modifiers.some((m) => m.match(/icon\(.+\)/))) {
        icon = modifiers
          .find((m) => m.match(/icon\(.+\)/))!
          .replace(/^icon\(/, '')
          .replace(/\)$/, '');
      }
      if (modifiers.some((m) => m.match(/svgIcon\(.+\)/))) {
        svgIcon = modifiers
          .find((m) => m.match(/svgIcon\(.+\)/))!
          .replace(/^svgIcon\(/, '')
          .replace(/\)$/, '');
      }
      if (modifiers.some((m) => m.match(/permission\(.+\)/))) {
        permission = modifiers
          .find((m) => m.match(/permission\(.+\)/))!
          .replace(/^permission\(/, '')
          .replace(/\)$/, '');
      }
    }
  } else if (tableHeaderButton) {
    role = tableHeaderButton.role ?? role;
    icon = tableHeaderButton.icon ?? icon;
    svgIcon = tableHeaderButton.svgIcon ?? svgIcon;
    permission = tableHeaderButton.permission ?? permission;
    label = tableHeaderButton.label ?? label;
    options = tableHeaderButton.options ?? options;
  }
  options ??= {};
  return {
    role,
    icon,
    svgIcon,
    permission,
    options,
    label: label || ((role === 'form' ? 'Create ' : '') + capitalize(name)),
  };
}
