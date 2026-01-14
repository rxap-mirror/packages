import { chain } from '@angular-devkit/schematics';
import { AddPackageJsonDependencyRule } from '@rxap/schematics-utilities';
import { PrintAngularOptions } from '../../../lib/print-angular-options';
import { actionListRule } from '../../../lib/rules/table-action-rule';
import { cellComponentRule } from '../../../lib/rules/table-cell-component-rule';
import { TableFilterColumnRule } from '../../../lib/rules/table-filter-column-rule';
import { headerButtonRule } from '../../../lib/rules/table-header-button-rule';
import { tableInterfaceRule } from '../../../lib/rules/table-interface-rule';
import { backendRule } from './backend/backend-rule';
import { componentRule } from './component-rule';
import {
  NormalizedTableComponentOptions,
  NormalizeTableComponentOptions,
} from './normalize-table-component-options';
import { TableComponentOptions } from './schema';
import { selectColumnRule } from './select-column-rule';

function printOptions(options: NormalizedTableComponentOptions) {
  PrintAngularOptions('table-component', options);
  if (options.columnList.length) {
    console.log(`=== columns: \x1b[34m${ options.columnList.map((item) => item.name).join(', ') }\x1b[0m`);
  } else {
    console.log('=== columns: \x1b[31mempty\x1b[0m');
  }
  if (options.actionList.length > 0) {
    console.log(`=== actions: \x1b[34m${ options.actionList.map((c) => c.type).join(', ') }\x1b[0m`);
  } else {
    console.log('=== actions: \x1b[31mempty\x1b[0m');
  }
}

export default function (options: TableComponentOptions) {
  const normalizedOptions = NormalizeTableComponentOptions(options);
  printOptions(normalizedOptions);

  return function () {
    return chain([
      () => console.group('\x1b[32m[@rxap/schematics-angular:table-component]\x1b[0m'),
      tableInterfaceRule(normalizedOptions),
      componentRule(normalizedOptions),
      headerButtonRule(normalizedOptions),
      TableFilterColumnRule(normalizedOptions),
      backendRule(normalizedOptions),
      cellComponentRule(normalizedOptions),
      actionListRule(normalizedOptions),
      selectColumnRule(normalizedOptions),
      AddPackageJsonDependencyRule('@rxap/material-table-system', 'latest', { soft: true }),
      AddPackageJsonDependencyRule('@rxap/material-form-system', 'latest', { soft: true }),
      AddPackageJsonDependencyRule('@rxap/form-system', 'latest', { soft: true }),
      AddPackageJsonDependencyRule('@rxap/window-system', 'latest', { soft: true }),
      AddPackageJsonDependencyRule('@rxap/nest-dto', 'latest', { soft: true }),
      () => console.groupEnd(),
    ]);
  };
}
