import { Normalized } from '@rxap/utilities';
import {
  ExistingMethod,
  NormalizedExistingMethod,
  NormalizeExistingMethod,
} from './existing-method';
import {
  MinimumTableOptions,
  NormalizedMinimumTableOptions,
  NormalizeMinimumTableOptions,
} from './minimum-table-options';
import { NormalizedTableAction } from './table-action';
import { NormalizedTableColumn } from './table-column';
import { NormalizedDataProperty } from '@rxap/ts-morph';

export interface TreeTableOptions extends MinimumTableOptions {
  tableRootMethod?: ExistingMethod;
  tableChildMethod?: ExistingMethod;
}

export interface NormalizedTreeTableOptions
  extends Omit<Readonly<Normalized<TreeTableOptions> & NormalizedMinimumTableOptions>, 'columnList' | 'actionList' | 'propertyList' | 'tableRootMethod' | 'tableChildMethod'> {
  componentName: string;
  columnList: ReadonlyArray<NormalizedTableColumn>;
  actionList: ReadonlyArray<NormalizedTableAction>;
  propertyList: ReadonlyArray<NormalizedDataProperty>;
  tableRootMethod: NormalizedExistingMethod | null;
  tableChildMethod: NormalizedExistingMethod | null;
}

export function NormalizeTreeTableOptions(
  options: Readonly<TreeTableOptions>,
  name: string,
): NormalizedTreeTableOptions {
  const normalizedOptions = NormalizeMinimumTableOptions(options, name, '-tree-table');
  const tableRootMethod = NormalizeExistingMethod(options.tableRootMethod);
  const tableChildMethod = NormalizeExistingMethod(options.tableRootMethod) ?? tableRootMethod;
  return Object.freeze({
    ...normalizedOptions,
    tableRootMethod,
    tableChildMethod,
  });
}
