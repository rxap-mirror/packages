import {
  DataProperty,
  NormalizeDataProperty,
  NormalizeDataPropertyList,
  NormalizedDataProperty,
  NormalizedUpstreamOptions,
  NormalizeTypeImportList,
  NormalizeUpstreamOptions,
  UpstreamOptions,
} from '@rxap/ts-morph';
import {
  capitalize,
  CoerceArrayItems,
  dasherize,
  Normalized,
} from '@rxap/utilities';
import { BackendTypes } from '../../backend-types';
import {
  GuessColumnTypeType,
  NormalizedTableColumn,
  TableColumn,
  TableColumnKind,
  TableColumnNameToPropertyPath,
} from '../../table-column';
import {
  BaseFormControl,
  NormalizeBaseFormControl,
  NormalizedBaseFormControl,
} from './base-form-control';

import { FormControlKinds } from './form-control-kind';
import {
  FormField,
  FormFieldFormControl,
  NormalizedFormFieldFormControl,
  NormalizeFormField,
} from './form-field-form-control';

export type TableSelectColumn = Pick<TableColumn, 'name' | 'title' | 'hasFilter' | 'kind' | 'propertyPath'>
  & DataProperty
export type NormalizedTableSelectColumn =
  Pick<NormalizedTableColumn, 'name' | 'title' | 'hasFilter' | 'kind' | 'propertyPath'> & NormalizedDataProperty

export function NormalizeTableSelectColumn(
  column: TableSelectColumn,
): NormalizedTableSelectColumn {
  const {
    name,
    propertyPath,
  } = TableColumnNameToPropertyPath(column.name, column.propertyPath);
  const kind = column.kind ?? TableColumnKind.DEFAULT;
  const type = GuessColumnTypeType(kind, column.type ?? 'unknown');
  return Object.freeze({
    ...NormalizeDataProperty({
      ...column,
      name,
      type,
    }),
    title: column.title ?? dasherize(name).split('-').map(part => capitalize(part)).join(' '),
    hasFilter: column.hasFilter ?? false,
    kind,
    propertyPath,
  });
}

// region ToFunction
export interface TableSelectToFunction {
  property: DataProperty;
}

export interface NormalizedTableSelectToFunction extends Readonly<Normalized<TableSelectToFunction>> {
  property: NormalizedDataProperty;
}

export function NormalizeTableSelectToFunction(
  toFunction: TableSelectToFunction | null | undefined,
  columnList: TableSelectColumn[],
  defaultType = 'unknown',
): NormalizedTableSelectToFunction {
  if (!toFunction || Object.keys(toFunction).length === 0) {
    return Object.freeze({
      property: NormalizeDataProperty(columnList[0].name, defaultType),
    });
  }
  return Object.freeze({
    property: NormalizeDataProperty(toFunction.property, defaultType),
  });
}

export interface TableSelectFormControl extends BaseFormControl, FormFieldFormControl {
  backend?: BackendTypes;
  formField?: FormField;
  title?: string;
  propertyList?: DataProperty[];
  columnList?: TableSelectColumn[];
  toDisplay?: TableSelectToFunction;
  toValue?: TableSelectToFunction;
  upstream?: UpstreamOptions;
  resolver?: { upstream?: UpstreamOptions };
}

export interface NormalizedTableSelectFormControl
  extends Readonly<Normalized<Omit<TableSelectFormControl, 'type' | 'importList' | 'columnList' | 'propertyList' | 'formField'>>>,
          NormalizedBaseFormControl, NormalizedFormFieldFormControl {
  kind: FormControlKinds.TABLE_SELECT;
  backend: BackendTypes;
  columnList: NormalizedTableSelectColumn[];
  propertyList: Array<NormalizedDataProperty>;
  toDisplay: NormalizedTableSelectToFunction;
  toValue: NormalizedTableSelectToFunction;
  upstream: NormalizedUpstreamOptions | null;
  resolver: { upstream: NormalizedUpstreamOptions | null } | null;
}

export function IsNormalizedTableSelectFormControl(template: NormalizedBaseFormControl): template is NormalizedTableSelectFormControl {
  return template.kind === FormControlKinds.TABLE_SELECT;
}

export function NormalizeTableSelectFormControl(
  control: TableSelectFormControl,
): NormalizedTableSelectFormControl {
  const importList = control.importList ?? [];
  importList.push({
    name: 'TableSelectControlModule',
    moduleSpecifier: '@digitaix/eurogard-table-select',
  });
  if (!control.columnList?.length) {
    throw new Error('The column list must not be empty');
  }
  const propertyList = NormalizeDataPropertyList(control.propertyList);
  const toDisplay = NormalizeTableSelectToFunction(control.toDisplay, control.columnList, 'string');
  const toValue = NormalizeTableSelectToFunction(control.toValue, control.columnList);
  CoerceArrayItems(propertyList, [ toDisplay.property, toValue.property ], (a, b) => a.name === b.name);
  const formField = NormalizeFormField(
    control.formField ?? {},
    importList,
    {
      label: control.label,
      directiveList: [
        {
          name: 'eurogardTableSelectControl',
          namedImport: 'TableSelectControlModule',
          moduleSpecifier: '@digitaix/eurogard-table-select',
        },
      ],
    },
  );
  const columnList = control.columnList.map(NormalizeTableSelectColumn);
  CoerceArrayItems(propertyList, columnList, (a, b) => a.name === b.name);
  control.type ??= toValue.property.type;
  return Object.freeze({
    ...NormalizeBaseFormControl(control),
    resolver: control.resolver ? { upstream: NormalizeUpstreamOptions(control.resolver.upstream) } : null,
    importList: NormalizeTypeImportList(importList),
    kind: FormControlKinds.TABLE_SELECT,
    formField,
    backend: control.backend ?? BackendTypes.NONE,
    title: control.title ?? null,
    columnList,
    toDisplay,
    toValue,
    propertyList,
    upstream: NormalizeUpstreamOptions(control.upstream),
  });
}
