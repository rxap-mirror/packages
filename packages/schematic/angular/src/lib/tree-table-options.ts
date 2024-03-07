import { NormalizedDataProperty } from '@rxap/ts-morph';
import {
  CoerceArrayItems,
  Normalized,
} from '@rxap/utilities';
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
import {
  NormalizedTableColumn,
  TableColumnKind,
  TableColumnSticky,
} from './table-column';

export enum TreeTableModifiers {
  OVERWRITE = 'overwrite',
  NAVIGATION_BACK_HEADER = 'navigation-back-header',
  WITHOUT_TITLE = 'without-title',
}

export function IsTreeTableModifiers(value: string): value is TreeTableModifiers {
  return Object.values(TreeTableModifiers).includes(value as TreeTableModifiers);
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
  propertyList: Array<NormalizedDataProperty>;
  tableRootMethod: NormalizedExistingMethod | null;
  tableChildMethod: NormalizedExistingMethod | null;
}

export function NormalizeTreeTableOptions(
  options: Readonly<TreeTableOptions>,
  name: string,
): NormalizedTreeTableOptions {
  const columnList = options.columnList ?? [];
  CoerceArrayItems(columnList, [{
    name: 'tree',
    hidden: true,
    kind: TableColumnKind.TREE,
    sticky: TableColumnSticky.START,
    synthetic: true,
    importList: [
      { name: 'TreeControlCellComponent', moduleSpecifier: '@rxap/material-table-system' }
    ],
  }], { compareTo: (a, b) => a.name === b.name, unshift: true, merge: true });
  CoerceArrayItems(columnList, [{
    name: 'spinner',
    hidden: true,
    kind: TableColumnKind.SPINNER,
    sticky: TableColumnSticky.END,
    synthetic: true,
    importList: [
      { name: 'MatProgressSpinnerModule', moduleSpecifier: '@angular/material/progress-spinner' },
      { name: 'NgIf', moduleSpecifier: '@angular/common' },
      { name: 'AsyncPipe', moduleSpecifier: '@angular/common' }
    ],
  }], { compareTo: (a, b) => a.name === b.name, merge: true });
  const normalizedOptions = NormalizeMinimumTableOptions({
    ...options,
    columnList,
  }, name, IsTreeTableModifiers, '-tree-table');
  const tableRootMethod = NormalizeExistingMethod(options.tableRootMethod);
  const tableChildMethod = NormalizeExistingMethod(options.tableRootMethod) ?? tableRootMethod;
  return Object.freeze({
    ...normalizedOptions,
    tableRootMethod,
    tableChildMethod,
  });
}
