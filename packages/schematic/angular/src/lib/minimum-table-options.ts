import {
  CoerceSuffix,
  Normalized,
} from '@rxap/utilities';
import { MergeWithColumnList } from './merge-with-column-list';
import {
  NormalizedTableAction,
  NormalizeTableActionList,
  TableAction,
} from './table-action';
import {
  NormalizedTableColumn,
  NormalizeTableColumnList,
  TableColumn,
} from './table-column';
import {
  NormalizeTableHeaderButton,
  TableHeaderButton,
} from './table-header-button';
import {
  NormalizedDataProperty,
  NormalizeDataPropertyList,
  DataProperty,
} from '@rxap/ts-morph';
import { ToTitle } from './to-title';

export enum MinimumTableModifiers {
  OVERWRITE = 'overwrite',
}

export function IsMinimumTableModifiers(value: string): value is MinimumTableModifiers {
  return value in MinimumTableModifiers;
}

export interface MinimumTableOptions {
  headerButton?: string | TableHeaderButton;
  columnList: Array<TableColumn>;
  actionList: Array<string | TableAction>;
  propertyList: Array<string | DataProperty>;
  modifiers?: string[];
  title?: string;
  componentName?: string;
}

export interface NormalizedMinimumTableOptions<MODIFIER extends string = string>
  extends Readonly<Omit<Normalized<MinimumTableOptions>, 'columnList' | 'actionList' | 'propertyList' | 'modifiers'>> {
  componentName: string;
  columnList: ReadonlyArray<NormalizedTableColumn>;
  actionList: ReadonlyArray<NormalizedTableAction>;
  propertyList: ReadonlyArray<NormalizedDataProperty>;
  modifiers: Array<MODIFIER>;
}

export function NormalizeMinimumTableOptions<MODIFIER extends string = string>(
  options: Readonly<MinimumTableOptions>,
  name: string,
  isModifier: (value: string) => value is MODIFIER,
  suffix = '-table',
): NormalizedMinimumTableOptions<MODIFIER> {
  const componentName = options.componentName ?? CoerceSuffix(name, suffix);
  const actionList = NormalizeTableActionList(options.actionList);
  const columnList = NormalizeTableColumnList(options.columnList);
  const propertyList = NormalizeDataPropertyList(options.propertyList);
  const headerButton = NormalizeTableHeaderButton(options.headerButton, name);
  const modifiers = options.modifiers ?? [];
  const title = options.title ?? ToTitle(name);
  if (!modifiers.every(isModifier)) {
    throw new Error(`Invalid table modifier for table: ${ componentName } - [ ${ modifiers.join(', ') } ]`);
  }
  return Object.freeze({
    componentName,
    actionList,
    columnList,
    headerButton,
    modifiers,
    title,
    propertyList: MergeWithColumnList(propertyList, columnList),
  });
}
