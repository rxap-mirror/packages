import {
  DataProperty,
  NormalizeDataProperty,
  NormalizeDataPropertyList,
  NormalizedDataProperty,
  NormalizedUpstreamOptions,
  NormalizeUpstreamOptions,
  UpstreamOptions,
} from '@rxap/ts-morph';
import {
  CoerceArrayItems,
  Normalized,
} from '@rxap/utilities';
import {
  AccordionIdentifier,
  NormalizeAccordionIdentifier,
  NormalizedAccordionIdentifier,
} from '../../accordion-identifier';
import {
  BackendOptions,
  NormalizeBackendOptions,
  NormalizedBackendOptions,
} from '../../backend/backend-options';
import { BackendTypes } from '../../backend/backend-types';
import {
  DataSourceOptions,
  NormalizeDataSourceOptions,
  NormalizedDataSourceOptions,
} from '../../data-source/data-source-options';
import {
  MethodOptions,
  NormalizedMethodOptions,
  NormalizeMethodOptions,
} from '../../method/method-options';
import {
  GuessColumnTypeType,
  TableColumnNameToPropertyPath,
  TableColumnNameToTitle,
} from '../../table/column/base-table-column';
import {
  NormalizedTableColumn,
  TableColumn,
} from '../../table/table-column';
import { TableColumnKind } from '../../table/table-column-kind';
import {
  NormalizedToFunction,
  NormalizeToFunction,
  ToFunction,
} from '../../utilities/to-function';
import { NormalizedBaseFormControl } from './base-form-control';

import { FormControlKinds } from './form-control-kind';
import {
  FormFieldFormControl,
  NormalizedFormFieldFormControl,
  NormalizeFormFieldFormControl,
} from './form-field-form-control';

export type TableSelectColumn = Pick<TableColumn, 'name' | 'title' | 'hasFilter' | 'kind'>
  & DataProperty
export type NormalizedTableSelectColumn =
  Pick<NormalizedTableColumn, 'name' | 'title' | 'hasFilter' | 'kind' | 'propertyPath'> & NormalizedDataProperty

export function NormalizeTableSelectColumn(
  column: TableSelectColumn,
): NormalizedTableSelectColumn {
  if (!column.name) {
    throw new Error('The column name is required');
  }
  const kind = column.kind ?? TableColumnKind.DEFAULT;
  const type = GuessColumnTypeType(kind, column.type ?? 'unknown');
  const propertyPath = TableColumnNameToPropertyPath(column.name);
  return Object.freeze({
    ...NormalizeDataProperty({
      ...column,
      type,
    }),
    propertyPath,
    title: column.title ?? TableColumnNameToTitle(column.name),
    hasFilter: column.hasFilter ?? false,
    kind,
  });
}

export function NormalizeTableSelectToFunction(
  toFunction: ToFunction | null | undefined,
  columnList: TableSelectColumn[],
  defaultType = 'unknown',
): NormalizedToFunction {
  if (!toFunction || Object.keys(toFunction).length === 0) {
    return NormalizeToFunction({
      property: NormalizeDataProperty(columnList[0].name, defaultType)
    }, defaultType)!;
  }
  return NormalizeToFunction(toFunction, defaultType)!;
}

export interface TableSelectFormControl extends FormFieldFormControl {
  backend?: BackendTypes | BackendOptions;
  title?: string;
  propertyList?: DataProperty[];
  columnList?: TableSelectColumn[];
  toDisplay?: ToFunction;
  toValue?: ToFunction;
  upstream?: UpstreamOptions;
  dataSource?: DataSourceOptions;
  resolver?: { upstream?: UpstreamOptions, method?: MethodOptions };
  options?: { method?: MethodOptions }
  identifier?: AccordionIdentifier;
}

export interface NormalizedTableSelectFormControl
  extends Readonly<Normalized<Omit<TableSelectFormControl, keyof NormalizedFormFieldFormControl | 'columnList' | 'propertyList' | 'formField' | 'role' | 'backend'>>>,
          NormalizedFormFieldFormControl {
  kind: FormControlKinds.TABLE_SELECT;
  backend: NormalizedBackendOptions;
  columnList: NormalizedTableSelectColumn[];
  propertyList: Array<NormalizedDataProperty>;
  toDisplay: NormalizedToFunction;
  toValue: NormalizedToFunction;
  upstream: NormalizedUpstreamOptions | null;
  resolver: { upstream: NormalizedUpstreamOptions | null, method: NormalizedMethodOptions | null } | null;
  options: { method: NormalizedMethodOptions | null } | null;
  identifier: NormalizedAccordionIdentifier;
  dataSource: NormalizedDataSourceOptions | null;
}

export function IsNormalizedTableSelectFormControl(template: NormalizedBaseFormControl): template is NormalizedTableSelectFormControl {
  return template.kind === FormControlKinds.TABLE_SELECT;
}

export function NormalizeTableSelectFormControlResolver(resolver: TableSelectFormControl['resolver']): NormalizedTableSelectFormControl['resolver'] {
  if (!resolver || Object.keys(resolver).length === 0) {
    return null;
  }
  return {
    upstream: NormalizeUpstreamOptions(resolver.upstream),
    method: NormalizeMethodOptions(resolver.method),
  };
}

export function NormalizeTableSelectFormControlOptions(options: TableSelectFormControl['options']): NormalizedTableSelectFormControl['options'] {
  if (!options || Object.keys(options).length === 0) {
    return null;
  }
  return {
    method: NormalizeMethodOptions(options.method),
  };
}

export function NormalizeTableSelectFormControl(
  control: TableSelectFormControl,
  backend: BackendOptions,
): NormalizedTableSelectFormControl {
  const importList = control.importList ?? [];
  CoerceArrayItems(importList, [
    {
      name: 'TableSelectControlModule',
      moduleSpecifier: '@rxap/ngx-material-table-select',
    }
  ], (a, b) => a.name === b.name);
  if (!control.columnList?.length) {
    throw new Error('The column list must not be empty');
  }
  const propertyList = NormalizeDataPropertyList(control.propertyList);
  const toDisplay = NormalizeTableSelectToFunction(control.toDisplay, control.columnList, 'string');
  const toValue = NormalizeTableSelectToFunction(control.toValue, control.columnList);
  CoerceArrayItems(propertyList, [ toDisplay.property, toValue.property ], (a, b) => a.name === b.name);
  const columnList = control.columnList.map(NormalizeTableSelectColumn);
  CoerceArrayItems(propertyList, columnList, (a, b) => a.name === b.name);
  const type = control.type ?? toValue.property.type;
  let identifier = NormalizeAccordionIdentifier(control.identifier);
  if (!identifier) {
    identifier = NormalizeAccordionIdentifier({
      property: { ...toValue.property },
    })!;
  }
  if (identifier) {
    CoerceArrayItems(propertyList, [identifier.property], (a, b) => a.name === b.name);
  }
  return Object.freeze({
    ...NormalizeFormFieldFormControl({
      ...control,
      type,
    }, importList, undefined, undefined, false, {
      label: control.label,
      directiveList: [
        {
          name: 'rxapTableSelectControl',
          namedImport: 'TableSelectControlModule',
          moduleSpecifier: '@rxap/ngx-material-table-select',
        },
      ],
    }, backend),
    identifier,
    dataSource: NormalizeDataSourceOptions(control.dataSource),
    resolver: NormalizeTableSelectFormControlResolver(control.resolver),
    options: NormalizeTableSelectFormControlOptions(control.options),
    kind: FormControlKinds.TABLE_SELECT,
    backend: NormalizeBackendOptions(control.backend ?? BackendTypes.NONE),
    title: control.title ?? null,
    columnList,
    toDisplay,
    toValue,
    propertyList,
    upstream: NormalizeUpstreamOptions(control.upstream),
  });
}
