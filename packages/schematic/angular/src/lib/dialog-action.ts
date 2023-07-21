import {
  NonNullableSelected,
  Normalized,
} from '@rxap/utilities';
import { capitalize } from '@rxap/schematics-utilities';

export interface DialogAction {
  role: string;
  label?: string;
  color?: string;
}

export type NormalizedDialogAction = Readonly<NonNullableSelected<Normalized<DialogAction>, 'label'>>;

export function NormalizeDialogAction(
  action: string | DialogAction,
): NormalizedDialogAction {
  let role: string;
  let label: string | null = null;
  let color: string | null = null;
  if (typeof action === 'string') {
    const fragments = action.split(':');
    role = fragments[0];
    label = fragments[1] || null;
  } else {
    role = action.role;
    label = action.label ?? label;
    color = action.color ?? color;
  }
  label ??= capitalize(role);
  return Object.seal({
    role,
    label,
    color,
  });
}

export function NormalizeDialogActionList(
  actionList?: Array<string | DialogAction>,
): Array<NormalizedDialogAction> {
  return Object.seal(actionList?.map(NormalizeDialogAction) ?? []);
}
