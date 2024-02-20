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

export enum TreeTableModifiers {
  OVERWRITE = 'overwrite',
}

export function IsTreeTableModifiers(value: string): value is TreeTableModifiers {
  return value in TreeTableModifiers;
}

export interface TreeTableOptions extends MinimumTableOptions {
  tableRootMethod?: ExistingMethod;
  tableChildMethod?: ExistingMethod;
}

export interface NormalizedTreeTableOptions
  extends Omit<Readonly<Normalized<TreeTableOptions> & NormalizedMinimumTableOptions<TreeTableModifiers>>, 'columnList' | 'actionList' | 'propertyList' | 'tableRootMethod' | 'tableChildMethod'> {
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
  const normalizedOptions = NormalizeMinimumTableOptions(options, name, IsTreeTableModifiers, '-tree-table');
  const tableRootMethod = NormalizeExistingMethod(options.tableRootMethod);
  const tableChildMethod = NormalizeExistingMethod(options.tableRootMethod) ?? tableRootMethod;
  return Object.freeze({
    ...normalizedOptions,
    tableRootMethod,
    tableChildMethod,
  });
}
