import { SchematicsException } from '@angular-devkit/schematics';
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
import { BackendTypes } from '../../backend-types';
import {
  GuessColumnTypeType,
  NormalizedTableColumn,
  TableColumn,
  TableColumnKind,
  TableColumnNameToPropertyPath,
  TableColumnNameToTitle,
} from '../../table-column';
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
    throw new SchematicsException('The column name is required');
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

export interface TableSelectFormControl extends FormFieldFormControl {
  backend?: BackendTypes;
  title?: string;
  propertyList?: DataProperty[];
  columnList?: TableSelectColumn[];
  toDisplay?: TableSelectToFunction;
  toValue?: TableSelectToFunction;
  upstream?: UpstreamOptions;
  resolver?: { upstream?: UpstreamOptions };
  identifier?: AccordionIdentifier;
}

export interface NormalizedTableSelectFormControl
  extends Readonly<Normalized<Omit<TableSelectFormControl, keyof NormalizedFormFieldFormControl | 'columnList' | 'propertyList' | 'formField' | 'role'>>>,
          NormalizedFormFieldFormControl {
  kind: FormControlKinds.TABLE_SELECT;
  backend: BackendTypes;
  columnList: NormalizedTableSelectColumn[];
  propertyList: Array<NormalizedDataProperty>;
  toDisplay: NormalizedTableSelectToFunction;
  toValue: NormalizedTableSelectToFunction;
  upstream: NormalizedUpstreamOptions | null;
  resolver: { upstream: NormalizedUpstreamOptions | null } | null;
  identifier: NormalizedAccordionIdentifier;
}

export function IsNormalizedTableSelectFormControl(template: NormalizedBaseFormControl): template is NormalizedTableSelectFormControl {
  return template.kind === FormControlKinds.TABLE_SELECT;
}

export function NormalizeTableSelectFormControl(
  control: TableSelectFormControl,
): NormalizedTableSelectFormControl {
  const importList = control.importList ?? [];
  CoerceArrayItems(importList, [
    {
      name: 'TableSelectControlModule',
      moduleSpecifier: '@digitaix/eurogard-table-select',
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
  control.type ??= toValue.property.type;
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
    ...NormalizeFormFieldFormControl(control, importList, undefined, undefined, false, {
      label: control.label,
      directiveList: [
        {
          name: 'eurogardTableSelectControl',
          namedImport: 'TableSelectControlModule',
          moduleSpecifier: '@digitaix/eurogard-table-select',
        },
      ],
    }),
    identifier,
    resolver: control.resolver ? { upstream: NormalizeUpstreamOptions(control.resolver.upstream) } : null,
    kind: FormControlKinds.TABLE_SELECT,
    backend: control.backend ?? BackendTypes.NONE,
    title: control.title ?? null,
    columnList,
    toDisplay,
    toValue,
    propertyList,
    upstream: NormalizeUpstreamOptions(control.upstream),
  });
}
