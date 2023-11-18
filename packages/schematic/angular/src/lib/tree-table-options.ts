import { Normalized } from '@rxap/utilities';
import {
  ExistingMethod,
  NormalizeExistingMethod,
} from './existing-method';
import {
  MinimumTableOptions,
  NormalizedMinimumTableOptions,
  NormalizeMinimumTableOptions,
} from './minimum-table-options';
import { NormalizedTableAction } from './table-action';
import { NormalizedTableColumn } from './table-column';
import { NormalizedTableProperty } from './table-property';

export interface TreeTableOptions extends MinimumTableOptions {
  tableRootMethod?: ExistingMethod;
  tableChildMethod?: ExistingMethod;
}

export interface NormalizedTreeTableOptions extends Readonly<Normalized<TreeTableOptions>>,
                                                    NormalizedMinimumTableOptions {
  componentName: string;
  columnList: NormalizedTableColumn[];
  actionList: NormalizedTableAction[];
  propertyList: NormalizedTableProperty[];
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
