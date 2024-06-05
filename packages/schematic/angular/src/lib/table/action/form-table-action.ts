import { LoadFromTableActionOptions } from '@rxap/schematics-ts-morph';
import {
  CoerceSuffix,
  dasherize,
  Normalized,
} from '@rxap/utilities';
import {
  FormComponent,
  NormalizedFormComponent,
  NormalizeFormComponent,
} from '../../form/form-component';
import { TableActionKind } from '../table-action-kind';
import {
  BaseTableAction,
  NormalizeBaseTableAction,
  NormalizedBaseTableAction,
} from './base-table-action';


export interface FormTableAction extends BaseTableAction {
  loadFrom?: LoadFromTableActionOptions;
  customComponent?: boolean;
  formInitial?: Record<string, any> | boolean;
  formComponent?: string;
  form?: FormComponent;
}

export interface NormalizedFormTableAction
  extends Readonly<Normalized<Omit<FormTableAction, keyof BaseTableAction | 'form'>> & NormalizedBaseTableAction> {
  kind: TableActionKind.FORM;
  formComponent: string;
  formInitial: Record<string, any> | boolean;
  form: NormalizedFormComponent | null;
}

function NormalizeFormInitial(formInitial?: Record<string, any> | boolean): Record<string, any> | boolean {
  if (!formInitial) {
    return false;
  }
  if (typeof formInitial === 'boolean') {
    return formInitial;
  }
  if (Object.keys(formInitial).length === 0) {
    return false;
  }
  return formInitial;
}

export function NormalizeFormTableAction(
  tableAction: Readonly<FormTableAction>,
): NormalizedFormTableAction {
  const loadFrom = tableAction.loadFrom ?? null;
  return Object.freeze({
    ...NormalizeBaseTableAction(tableAction),
    kind: TableActionKind.FORM,
    formInitial: NormalizeFormInitial(tableAction.formInitial),
    form: tableAction.form ? NormalizeFormComponent(tableAction.form) : null,
    formComponent: CoerceSuffix(dasherize(tableAction.formComponent ?? tableAction.type), '-form'),
    loadFrom: Object.keys(loadFrom ?? {}).length ? loadFrom : null,
    customComponent: tableAction.customComponent ?? !tableAction.form,
  });
}
