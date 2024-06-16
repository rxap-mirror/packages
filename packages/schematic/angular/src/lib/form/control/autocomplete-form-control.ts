import {
  DataProperty,
  NormalizeDataPropertyList,
  NormalizedUpstreamOptions,
  NormalizeUpstreamOptions,
  UpstreamOptions,
} from '@rxap/ts-morph';
import { CoerceArrayItems } from '@rxap/utilities';
import {
  AccordionIdentifier,
  NormalizeAccordionIdentifier,
  NormalizedAccordionIdentifier,
} from '../../accordion-identifier';
import { BackendTypes } from '../../backend/backend-types';
import {
  NormalizeBackendOptions,
  NormalizedBackendOptions,
} from '../../backend/backend-options';
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


export interface AutocompleteFormControl extends FormFieldFormControl {
  backend?: BackendTypes;
  propertyList?: DataProperty[];
  toDisplay?: ToFunction;
  toValue?: ToFunction;
  upstream?: UpstreamOptions;
  resolver?: { upstream?: UpstreamOptions };
  identifier?: AccordionIdentifier;
}

export interface NormalizedAutocompleteFormControl extends Readonly<Omit<AutocompleteFormControl, keyof NormalizedFormFieldFormControl | 'resolver' | 'toValue' | 'toDisplay' | 'backend' | 'identifier' | 'upstream'> & NormalizedFormFieldFormControl> {
  kind: FormControlKinds.AUTOCOMPLETE;
  backend: NormalizedBackendOptions;
  identifier: NormalizedAccordionIdentifier | null;
  upstream: NormalizedUpstreamOptions | null;
  toDisplay: NormalizedToFunction | null;
  toValue: NormalizedToFunction | null;
  resolver: { upstream: NormalizedUpstreamOptions | null } | null;
}

export function IsNormalizedAutocompleteFormControl(template: NormalizedBaseFormControl): template is NormalizedAutocompleteFormControl {
  return template.kind === FormControlKinds.AUTOCOMPLETE;
}

export function NormalizeAutocompleteFormControl(
  control: AutocompleteFormControl,
): NormalizedAutocompleteFormControl {
  const importList = control.importList ?? [];
  CoerceArrayItems(importList, [], (a, b) => a.name === b.name);
  const propertyList = NormalizeDataPropertyList(control.propertyList);
  const toDisplay = NormalizeToFunction(control.toDisplay, 'string');
  const toValue = NormalizeToFunction(control.toValue);
  if (toDisplay) {
    CoerceArrayItems(propertyList, [ toDisplay.property ], (a, b) => a.name === b.name);
  }
  if (toValue) {
    CoerceArrayItems(propertyList, [ toValue.property ], (a, b) => a.name === b.name);
    control.type ??= toValue.property.type;
  }
  let identifier = NormalizeAccordionIdentifier(control.identifier);
  if (!identifier && toValue) {
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
    },
    {
      name: 'AutocompleteOptionsFormMethodDirective',
      moduleSpecifier: 'autocomplete-table-select',
    }
  ], (a, b) => a.name === b.name);
  return Object.freeze({
    ...NormalizeFormFieldFormControl(control, importList),
    identifier,
    resolver: control.resolver ? { upstream: NormalizeUpstreamOptions(control.resolver.upstream) } : null,
    kind: FormControlKinds.AUTOCOMPLETE,
    backend: NormalizeBackendOptions(control.backend ?? BackendTypes.NONE),
    toDisplay,
    toValue,
    propertyList,
    upstream: NormalizeUpstreamOptions(control.upstream),
  });
}
