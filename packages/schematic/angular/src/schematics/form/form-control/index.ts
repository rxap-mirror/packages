import { chain } from '@angular-devkit/schematics';
import { CoerceFormDefinitionControl } from '@rxap/schematics-ts-morph';
import { dasherize } from '@rxap/schematics-utilities';
import { Normalized } from '@rxap/utilities';
import {
  NormalizeAngularOptions,
  NormalizedAngularOptions,
  PrintAngularOptions,
} from '../../../lib/angular-options';
import {
  NormalizedFormDefinitionControl,
  NormalizeFormDefinitionControl,
} from '../../../lib/form-definition-control';
import { FormControlOptions } from './schema';

export interface NormalizedFormControlOptions
  extends Readonly<Normalized<FormControlOptions> & NormalizedAngularOptions & NormalizedFormDefinitionControl> {
  controllerName: string;
}

export function NormalizeFormControlOptions(
  options: Readonly<FormControlOptions>,
): NormalizedFormControlOptions {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  const normalizedFormDefinitionControl = NormalizeFormDefinitionControl(options);
  const { nestModule } = normalizedAngularOptions;
  const formName = dasherize(options.formName);
  let directory = options.directory ?? '';
  if (!directory.endsWith('/' + formName + '-form')) {
    directory += '/' + formName + '-form';
  }
  const controllerName = options.controllerName ?? formName;
  return Object.seal({
    ...normalizedAngularOptions,
    ...normalizedFormDefinitionControl,
    formName,
    directory,
    controllerName,
    context: options.context ? dasherize(options.context) : null,
  });
}

function printOptions(options: NormalizedFormControlOptions) {
  PrintAngularOptions('form-control', options);
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
      () => console.groupEnd(),
    ]);
  };
}
