import {
  chain,
  Tree,
} from '@angular-devkit/schematics';
import { CoerceTableHeaderButtonMethodRule } from '@rxap/schematics-ts-morph';
import {
  CoerceSuffix,
  dasherize,
} from '@rxap/schematics-utilities';
import { Normalized } from '@rxap/utilities';
import {
  AngularOptions,
  NormalizeAngularOptions,
  NormalizedAngularOptions,

} from '../../../lib/angular-options';
import { AssertTableComponentExists } from '../../../lib/rules/assert-table-component-exists';
import { PrintAngularOptions } from '../../../lib/print-angular-options';
import {
  HeaderButton,
  NormalizedHeaderButton,
  NormalizeHeaderButton,
} from '../../../lib/table/table-header-button';
import { TableHeaderButtonOptions } from './schema';

export type NormalizedTableHeaderButtonOptions = Readonly<Normalized<Omit<TableHeaderButtonOptions, keyof AngularOptions | keyof HeaderButton>> & NormalizedAngularOptions & NormalizedHeaderButton>

export function NormalizeTableHeaderButtonOptions(
  options: Readonly<TableHeaderButtonOptions>,
): NormalizedTableHeaderButtonOptions {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  const normalizedTableHeaderButton = NormalizeHeaderButton(options, options.tableName);
  if (!normalizedTableHeaderButton) {
    throw new Error('FATAL: should never happen');
  }
  const tableName = CoerceSuffix(dasherize(options.tableName), '-table');
  return Object.freeze({
    ...normalizedTableHeaderButton,
    ...normalizedAngularOptions,
    tableName,
  });
}

function printOptions(options: NormalizedTableHeaderButtonOptions) {
  PrintAngularOptions('table-header-button', options);
}

export default function (options: TableHeaderButtonOptions) {
  const normalizedOptions = NormalizeTableHeaderButtonOptions(options);
  const {
    refresh,
    confirm,
    tooltip,
    errorMessage,
    successMessage,
    tableName,
    project,
    feature,
    shared,
    directory,
    overwrite,
  } = normalizedOptions;

  printOptions(normalizedOptions);

  return (host: Tree) => {

    AssertTableComponentExists(host, normalizedOptions);

    return chain([
      () => console.group('\x1b[32m[@rxap/schematics-angular:table-header-button]\x1b[0m'),
      () => console.log('Coerce table header button method ...'),
      CoerceTableHeaderButtonMethodRule({
        project,
        feature,
        shared,
        directory,
        overwrite,
        tableName,
        refresh,
        confirm,
        tooltip,
        errorMessage,
        successMessage,
      }),
      () => console.groupEnd(),
    ]);
  };
}
