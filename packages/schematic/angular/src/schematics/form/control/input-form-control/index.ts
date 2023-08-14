import { chain } from '@angular-devkit/schematics';
import { ExecuteSchematic } from '@rxap/schematics-utilities';
import { Normalized } from '@rxap/utilities';
import { PrintAngularOptions } from '../../../../lib/angular-options';
import {
  NormalizedFormControlOptions,
  NormalizeFormControlOptions,
} from '../../form-control';
import { InputFormControlOptions } from './schema';

export function GuessInputType(type: string): string {
  switch (type) {
    case 'boolean':
      return 'checkbox';
    case 'number':
      return 'number';
    case 'date':
      return 'date';
    case 'string':
    default:
      return 'text';
  }
}

export type NormalizedInputFormControlOptions = Readonly<Normalized<InputFormControlOptions> & NormalizedFormControlOptions>


export function NormalizeInputFormControlOptions(
  options: InputFormControlOptions,
): NormalizedInputFormControlOptions {
  const normalizedOptions = NormalizeFormControlOptions(options);
  const { type } = normalizedOptions;
  const inputType = GuessInputType(type);
  return Object.seal({
    ...normalizedOptions,
    inputType,
  });
}

function printOptions(options: NormalizedInputFormControlOptions) {
  PrintAngularOptions('input-form-control', options);
}

export default function (options: InputFormControlOptions) {
  const normalizedOptions = NormalizeInputFormControlOptions(options);
  printOptions(normalizedOptions);
  return () => {
    return chain([
      () => console.group('\x1b[32m[@rxap/schematics-angular:input-form-control]\x1b[0m'),
      ExecuteSchematic('form-control', normalizedOptions),
      () => console.groupEnd(),
    ]);
  };
}
