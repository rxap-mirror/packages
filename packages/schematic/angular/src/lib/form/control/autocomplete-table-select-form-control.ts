import {
  NormalizeDataPropertyList,
  NormalizeUpstreamOptions,
} from '@rxap/ts-morph';
import { CoerceArrayItems } from '@rxap/utilities';
import { NormalizeAccordionIdentifier } from '../../accordion-identifier';
import { BackendTypes } from '../../backend-types';
import { NormalizedBaseFormControl } from './base-form-control';

import { FormControlKinds } from './form-control-kind';
import { NormalizeFormFieldFormControl } from './form-field-form-control';
import {
  NormalizedTableSelectFormControl,
  NormalizeTableSelectColumn,
  NormalizeTableSelectToFunction,
  TableSelectFormControl,
} from './table-select-form-control';


export type AutocompleteTableSelectFormControl = TableSelectFormControl

export type NormalizedAutocompleteTableSelectFormControl = NormalizedTableSelectFormControl

export function IsNormalizedAutocompleteTableSelectFormControl(template: NormalizedBaseFormControl): template is NormalizedAutocompleteTableSelectFormControl {
  return template.kind === FormControlKinds.AUTOCOMPLETE_TABLE_SELECT;
}

export function NormalizeAutocompleteTableSelectFormControl(
  control: AutocompleteTableSelectFormControl,
): NormalizedAutocompleteTableSelectFormControl {
  const importList = control.importList ?? [];
  CoerceArrayItems(importList, [], (a, b) => a.name === b.name);
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
  CoerceArrayItems(importList, [
    {
      name: 'MatInputModule',
      moduleSpecifier: '@angular/material/input',
    },
    {
      name: 'MatAutocompleteModule',
      moduleSpecifier: '@angular/material/autocomplete',
    }
  ], (a, b) => a.name === b.name);
  return Object.freeze({
    ...NormalizeFormFieldFormControl(control, importList),
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
