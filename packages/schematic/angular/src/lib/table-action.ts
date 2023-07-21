import { Normalized } from '@rxap/utilities';
import {
  NormalizeTableRowAction,
  TableRowAction,
} from './table-row-action';

export interface TableAction extends TableRowAction {
  role: string;
  icon?: string | null;
  svgIcon?: string | null;
  permission?: string | null;
}

export type NormalizedTableAction = Readonly<Normalized<TableAction>>;

export function NormalizeTableAction(
  tableAction: Readonly<TableAction> | string,
): NormalizedTableAction {
  let type: string;
  let checkFunction: string | undefined = undefined;
  let tooltip: string | undefined = undefined;
  let errorMessage: string | undefined = undefined;
  let successMessage: string | undefined = undefined;
  let refresh = false;
  let confirm = false;
  let priority: number | undefined = undefined;
  let role: string;
  let icon: string | null = null;
  let svgIcon: string | null = null;
  let permission: string | null = null;
  let inHeader = false;
  if (typeof tableAction === 'string') {
    // type:role:modifier1,modifier2
    // edit:form:refresh,confirm
    const fragments = tableAction.split(':');
    type = fragments[0];
    role = fragments[1];
    if (fragments[2]) {
      const modifiers = fragments[2].split(/,(?![^(]*\))/g);
      refresh = modifiers.includes('refresh');
      confirm = modifiers.includes('confirm');
      inHeader = modifiers.includes('header');
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
      if (modifiers.some((m) => m.match(/checkFunction\(.+\)/))) {
        checkFunction = modifiers
          .find((m) => m.match(/checkFunction\(.+\)/))!
          .replace(/^checkFunction\(/, '')
          .replace(/\)$/, '');
      }
    }
  } else {
    type = tableAction.type;
    checkFunction = tableAction.checkFunction ?? checkFunction;
    tooltip = tableAction.tooltip ?? tooltip;
    errorMessage = tableAction.errorMessage ?? errorMessage;
    successMessage = tableAction.successMessage ?? successMessage;
    refresh = tableAction.refresh ?? refresh;
    confirm = tableAction.confirm ?? confirm;
    priority = tableAction.priority ?? priority;
    role = tableAction.role;
    inHeader = tableAction.inHeader ?? inHeader;
    icon = tableAction.icon ?? icon;
    svgIcon = tableAction.svgIcon ?? svgIcon;
    permission = tableAction.permission ?? permission;
  }
  return Object.seal({
    ...NormalizeTableRowAction({
      type,
      checkFunction,
      tooltip,
      errorMessage,
      successMessage,
      refresh,
      confirm,
      priority,
      inHeader,
    }),
    role,
    icon,
    svgIcon,
    permission,
  });
}

export function NormalizeTableActionList(
  tableActionList?: Array<Readonly<TableAction> | string>,
): Array<NormalizedTableAction> {
  return Object.seal(tableActionList?.map(NormalizeTableAction) ?? []);
}
