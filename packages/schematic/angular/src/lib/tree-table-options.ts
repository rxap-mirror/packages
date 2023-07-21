import { NormalizedTableColumn } from './table-column';
import { NormalizedTableAction } from './table-action';
import { Normalized } from '@rxap/utilities';
import {
  MinimumTableOptions,
  NormalizedMinimumTableOptions,
  NormalizeMinimumTableOptions,
} from './minimum-table-options';
import {
  ExistingMethod,
  NormalizeExistingMethod,
} from './existing-method';

export interface TreeTableOptions extends MinimumTableOptions {
  tableRootMethod?: ExistingMethod;
  tableChildMethod?: ExistingMethod;
}

export interface NormalizedTreeTableOptions extends Readonly<Normalized<TreeTableOptions>>,
                                                    NormalizedMinimumTableOptions {
  componentName: string;
  columnList: NormalizedTableColumn[];
  actionList: NormalizedTableAction[];
}

export function NormalizeTreeTableOptions(
  options: Readonly<TreeTableOptions>,
  name: string,
): NormalizedTreeTableOptions {
  const normalizedOptions = NormalizeMinimumTableOptions(options, name);
  const tableRootMethod = NormalizeExistingMethod(options.tableRootMethod);
  const tableChildMethod = NormalizeExistingMethod(options.tableRootMethod) ?? tableRootMethod;
  return Object.seal({
    ...normalizedOptions,
    tableRootMethod,
    tableChildMethod,
  });
}
