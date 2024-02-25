import {
  chain,
  noop,
  Rule,
} from '@angular-devkit/schematics';
import { CoerceFormDefinitionControl } from '@rxap/schematics-ts-morph';
import {
  dasherize,
  ExecuteSchematic,
} from '@rxap/schematics-utilities';
import { Normalized } from '@rxap/utilities';
import {
  NormalizeAngularOptions,
  NormalizedAngularOptions,
  PrintAngularOptions,
} from '../../../lib/angular-options';
import { FormControlKinds } from '../../../lib/form-control';
import {
  NormalizedFormDefinitionControl,
  NormalizeFormDefinitionControl,
} from '../../../lib/form-definition-control';
import { FormControlOptions } from './schema';
import 'colors';

export interface NormalizedFormControlOptions
  extends Readonly<Normalized<FormControlOptions> & NormalizedAngularOptions & NormalizedFormDefinitionControl> {
  controllerName: string;
}

export function NormalizeFormControlOptions(
  options: Readonly<FormControlOptions>,
): NormalizedFormControlOptions {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  const normalizedFormDefinitionControl = NormalizeFormDefinitionControl(options);
  const formName = dasherize(options.formName);
  const controllerName = options.controllerName ?? formName;
  return Object.freeze({
    ...normalizedAngularOptions,
    ...normalizedFormDefinitionControl,
    formName,
    controllerName,
    context: options.context ? dasherize(options.context) : null,
  });
}

function printOptions(options: NormalizedFormControlOptions) {
  PrintAngularOptions('form-control', options);
  console.log(`=== form: ${options.formName}`.blue);
}

function formControlKind(normalizedOptions: NormalizedFormControlOptions): Rule {
  switch (normalizedOptions.kind) {

    case FormControlKinds.INPUT:
      return ExecuteSchematic('input-form-control', normalizedOptions);

    case FormControlKinds.SELECT:
      return ExecuteSchematic('select-form-control', normalizedOptions);

    case FormControlKinds.TABLE_SELECT:
      return ExecuteSchematic('table-select-form-control', normalizedOptions);

    default:
      return () => console.log(`No schematic for form control kind: ${normalizedOptions.kind}`.yellow);

  }

  return noop();
}

export default function (options: FormControlOptions) {
  const normalizedOptions = NormalizeFormControlOptions(options);
  const {
    name,
    project,
    feature,
    directory,
    formName,
    type,
    isArray,
    state,
    isRequired,
    validatorList,
  } = normalizedOptions;
  printOptions(normalizedOptions);

  return () => {
    return chain([
      () => console.group('\x1b[32m[@rxap/schematics-angular:form-control]\x1b[0m'),
      () => console.log('Coerce control in form definition class ...'),
      CoerceFormDefinitionControl({
        project,
        feature,
        directory,
        formName,
        name,
        type,
        isArray,
        state,
        isRequired,
        validatorList,
      }),
      formControlKind(normalizedOptions),
      () => console.groupEnd(),
    ]);
  };
}
