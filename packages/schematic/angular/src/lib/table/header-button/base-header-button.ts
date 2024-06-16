import { Normalized } from '@rxap/utilities';
import { HeaderButtonKind } from '../header-button-kind';

export interface BaseHeaderButton {
  kind: HeaderButtonKind;
  permission?: string;
  icon?: string;
  svgIcon?: string;
  label?: string;
  refresh?: boolean;
  confirm?: boolean;
  tooltip?: string;
  errorMessage?: string;
  successMessage?: string;
}

export type NormalizedBaseHeaderButton = Readonly<Normalized<BaseHeaderButton>>;

export function NormalizeBaseHeaderButton(options: BaseHeaderButton, label?: string): NormalizedBaseHeaderButton {
  const kind = options.kind ?? HeaderButtonKind.DEFAULT;
  return Object.freeze({
    kind,
    permission: options.permission ?? null,
    icon: options.icon ?? null,
    svgIcon: options.svgIcon ?? null,
    label: options.label ?? label ?? null,
    refresh: options.refresh ?? false,
    confirm: options.confirm ?? false,
    tooltip: options.tooltip ?? null,
    errorMessage: options.errorMessage ?? null,
    successMessage: options.successMessage ?? null,
  });
}
