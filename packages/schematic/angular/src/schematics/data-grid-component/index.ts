import { chain } from '@angular-devkit/schematics';
import { PrintAngularOptions } from '../../lib/print-angular-options';
import { backendRule } from './backend/backend-rule';
import { componentRule } from './component-rule';
import { modeRule } from './mode-rule';
import {
  NormalizeDataGridComponentOptions,
  NormalizedDataGridComponentOptions,
} from './normalize-data-grid-component-options';
import { DataGridComponentOptions } from './schema';

function printOptions(options: NormalizedDataGridComponentOptions) {
  PrintAngularOptions('data-grid-component', options);
  if (options.itemList.length) {
    console.log(`=== items: \x1b[34m${ options.itemList.map((item) => item.name).join(', ') }\x1b[0m`);
  } else {
    console.log('=== items: \x1b[31mempty\x1b[0m');
  }
}

export default function (options: DataGridComponentOptions) {
  const normalizedOptions = NormalizeDataGridComponentOptions(options);
  printOptions(normalizedOptions);
  return () => {
    return chain([
      componentRule(normalizedOptions),
      modeRule(normalizedOptions),
      backendRule(normalizedOptions),
    ]);
  };
}
