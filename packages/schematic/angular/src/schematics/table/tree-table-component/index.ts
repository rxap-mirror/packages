import { chain } from '@angular-devkit/schematics';
import { PrintAngularOptions } from '../../../lib/print-angular-options';
import { actionListRule } from '../../../lib/rules/table-action-rule';
import { cellComponentRule } from '../../../lib/rules/table-cell-component-rule';
import { TableFilterColumnRule } from '../../../lib/rules/table-filter-column-rule';
import { headerButtonRule } from '../../../lib/rules/table-header-button-rule';
import { tableInterfaceRule } from '../../../lib/rules/table-interface-rule';
import { backendRule } from './backend/backend-rule';
import { componentRule } from './component-rule';
import { NormalizedTreeTableComponentOptions } from './normalized-tree-table-component-options';
import { TreeTableComponentOptions } from './schema';
import { treeTableMethodRule } from './tree-table-method-rule';

function printOptions(options: NormalizedTreeTableComponentOptions) {
  PrintAngularOptions('tree-table-component', options);
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

export default function (options: TreeTableComponentOptions) {
  const normalizedOptions = NormalizedTreeTableComponentOptions(options);
  printOptions(normalizedOptions);

  return () => {
    return chain([
      tableInterfaceRule(normalizedOptions, { operationName: 'get-root', typePath: '[number]' }),
      componentRule(normalizedOptions),
      TableFilterColumnRule(normalizedOptions, 'tree-table'),
      actionListRule(normalizedOptions),
      cellComponentRule(normalizedOptions),
      headerButtonRule(normalizedOptions),
      backendRule(normalizedOptions),
      treeTableMethodRule(normalizedOptions),
    ]);
  };
}
