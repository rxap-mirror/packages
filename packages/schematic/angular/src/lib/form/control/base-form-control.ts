import { SchematicsException } from '@angular-devkit/schematics';
import {
  DataProperty,
  NormalizeDataProperty,
  NormalizedDataProperty,
  NormalizedTypeImport,
  NormalizeTypeImportList,
  TypeImport,
} from '@rxap/ts-morph';
import { Normalized } from '@rxap/utilities';
import Handlebars from 'handlebars';
import { join } from 'path';
import { LoadHandlebarsTemplate } from '../../load-handlebars-template';

import { FormControlKinds } from './form-control-kind';

export interface BaseFormControl extends DataProperty {
  state?: string;
  isRequired?: boolean;
  isReadonly?: boolean;
  isDisabled?: boolean;
  validatorList?: string[];
  importList?: TypeImport[];
  kind: FormControlKinds;
  template?: string;
  label?: string;
}

export interface NormalizedBaseFormControl extends Readonly<Normalized<BaseFormControl> & NormalizedDataProperty> {
  type: NormalizedTypeImport;
  importList: NormalizedTypeImport[];
  handlebars: Handlebars.TemplateDelegate<{ control: NormalizedBaseFormControl }>,
}

export function NormalizeBaseFormControl(
  control: BaseFormControl,
): NormalizedBaseFormControl {
  if (!control.name) {
    throw new SchematicsException('The control name is required');
  }
  const state: string | null = control.state ?? null;
  const isRequired: boolean = control.isRequired ?? false;
  const validatorList: string[] = control.validatorList ?? [];
  const importList = (
    control.importList ?? []
  );
  const isReadonly: boolean = control.isReadonly ?? false;
  const isDisabled: boolean = control.isDisabled ?? false;
  const kind = control.kind ?? FormControlKinds.DEFAULT;
  const template = control.template ?? kind + '-form-control.hbs';
  return Object.freeze({
    ...NormalizeDataProperty(control),
    isRequired,
    state,
    isReadonly,
    isDisabled,
    validatorList,
    importList: NormalizeTypeImportList(importList),
    kind,
    template,
    handlebars: LoadHandlebarsTemplate(template, join(__dirname, '..', 'schematics', 'form', 'templates')),
    label: control.label ?? null,
  });
}
