import { capitalize } from '@rxap/schematics-utilities';
import { Normalized } from '@rxap/utilities';

export interface TableHeaderButton<Options extends Record<string, any> = Record<string, any>> {
  role?: string;
  permission?: string;
  icon?: string;
  svgIcon?: string;
  label?: string;
  options: Options;
  refresh?: boolean;
  confirm?: boolean;
  tooltip?: string;
  errorMessage?: string;
  successMessage?: string;
}

export type NormalizedTableHeaderButton<Options extends Record<string, any> = Record<string, any>> = Readonly<Normalized<TableHeaderButton<Options>>>

export function NormalizeTableHeaderButton<Options extends Record<string, any> = Record<string, any>>(
  tableHeaderButton: Readonly<TableHeaderButton<Options>> | string | undefined,
  name: string,
): NormalizedTableHeaderButton<Options> | null {
  if (!tableHeaderButton) {
    return null;
  }
  let role: string | null = null;
  let icon: string | null = null;
  let svgIcon: string | null = null;
  let permission: string | null = null;
  let label: string | null = null;
  let options: Options | null = null;
  let refresh = false;
  let confirm = false;
  let tooltip: string | null = null;
  let errorMessage: string | null = null;
  let successMessage: string | null = null;
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
    refresh = tableHeaderButton.refresh ?? refresh;
    confirm = tableHeaderButton.confirm ?? confirm;
    tooltip = tableHeaderButton.tooltip ?? tooltip;
    errorMessage = tableHeaderButton.errorMessage ?? errorMessage;
    successMessage = tableHeaderButton.successMessage ?? successMessage;
  }
  options ??= {} as Options;
  const normalized: Normalized<TableHeaderButton> = {
    role,
    icon,
    svgIcon,
    permission,
    options,
    refresh,
    confirm,
    tooltip,
    errorMessage,
    successMessage,
    label: label || ((role === 'form' ? 'Create ' : '') + capitalize(name)),
  };
  return normalized as any as NormalizedTableHeaderButton<Options>;
}
