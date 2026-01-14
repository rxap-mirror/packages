import {
  chain,
  Tree,
} from '@angular-devkit/schematics';
import { PrintAngularOptions } from '../../../../lib/print-angular-options';
import { AssertTableComponentExists } from '../../../../lib/rules/assert-table-component-exists';
import { backendRule } from './backend-rule';
import {
  NormalizedOperationTableActionOptions,
  NormalizeOperationTableActionOptions,
} from './normalize-operation-table-action-options';
import { OperationTableActionOptions } from './schema';

function printOptions(options: NormalizedOperationTableActionOptions) {
  PrintAngularOptions('operation-table-action', options);
}

export default function (options: OperationTableActionOptions) {
  const normalizedOptions = NormalizeOperationTableActionOptions(options);

  printOptions(normalizedOptions);

  return (host: Tree) => {

    AssertTableComponentExists(host, normalizedOptions);

    return chain([
      () => console.group('\x1b[32m[@rxap/schematics-angular:operation-table-action]\x1b[0m'),
      backendRule(normalizedOptions),
      () => console.groupEnd(),
    ]);

  };
}
