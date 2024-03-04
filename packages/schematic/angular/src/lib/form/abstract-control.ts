import { SchematicsException } from '@angular-devkit/schematics';
import {
  DataProperty,
  NormalizeDataProperty,
  NormalizedDataProperty,
  NormalizedTypeImport,
  NormalizeTypeImportList,
  TypeImport,
} from '@rxap/ts-morph';
import {
  CoerceArrayItems,
  Normalized,
} from '@rxap/utilities';
import Handlebars from 'handlebars';
import { join } from 'path';
import { LoadHandlebarsTemplate } from '../load-handlebars-template';

export enum AbstractControlRolls {
  CONTROL = 'control',
  GROUP = 'group',
  ARRAY = 'array',
}

export interface AbstractControl extends DataProperty {
  isDisabled?: boolean;
  validatorList?: string[];
  importList?: TypeImport[];
  state?: string;
  isRequired?: boolean;
  role?: AbstractControlRolls;
  isReadonly?: boolean;
  kind?: string;
  template?: string;
}

export interface NormalizedAbstractControl extends Readonly<Normalized<Omit<AbstractControl, 'type'>>>, NormalizedDataProperty {
  importList: NormalizedTypeImport[];
  handlebars: Handlebars.TemplateDelegate<{ control: NormalizedAbstractControl }>,
  role: AbstractControlRolls;
}

export function NormalizeAbstractControl<Kind extends string>(
  control: AbstractControl,
  kind: Kind,
  importList: TypeImport[] = [],
  validatorList: string[] = [],
  defaultType: TypeImport | string = 'unknown',
  defaultIsArray = false
): NormalizedAbstractControl & { kind: Kind } {
  if (!control.name) {
    throw new SchematicsException('The control name is required');
  }
  const role = control.role ?? AbstractControlRolls.CONTROL;
  const isReadonly: boolean = control.isReadonly ?? false;
  const isDisabled: boolean = control.isDisabled ?? false;
  CoerceArrayItems(validatorList, control.validatorList ?? []);
  const template = control.template ?? `${ kind }-form-${ role }.hbs`;
  CoerceArrayItems(importList, control.importList ?? [], (a, b) => a === b);
  const state: string | null = control.state ?? null;
  const isRequired: boolean = control.isRequired ?? false;
  return Object.freeze({
    ...NormalizeDataProperty(control, defaultType, defaultIsArray),
    isRequired,
    state,
    kind,
    template,
    isReadonly,
    isDisabled,
    validatorList,
    importList: NormalizeTypeImportList(importList),
    handlebars: LoadHandlebarsTemplate(template, join(__dirname, '..', '..', 'schematics', 'form', 'templates')),
    role,
  });
}
