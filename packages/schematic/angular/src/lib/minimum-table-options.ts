import {
  DataProperty,
  NormalizeDataPropertyList,
  NormalizedDataProperty,
  NormalizedUpstreamOptions,
  NormalizeUpstreamOptions,
  UpstreamOptions,
} from '@rxap/ts-morph';
import {
  CoerceArrayItems,
  CoerceSuffix,
  Normalized,
} from '@rxap/utilities';
import {
  AccordionIdentifier,
  NormalizeAccordionIdentifier,
  NormalizedAccordionIdentifier,
} from './accordion-identifier';
import {
  CssClass,
  NormalizeCssClass,
  NormalizedCssClass,
} from './css-class';
import {
  NormalizedTableAction,
  NormalizeTableActionList,
  TableAction,
} from './table-action';
import {
  NormalizeTableHeaderButton,
  TableHeaderButton,
} from './table-header-button';
import {
  NormalizedTableColumn,
  NormalizeTableColumnList,
  TableColumn,
} from './table/table-column';
import { ToTitle } from './to-title';

export enum MinimumTableModifiers {
  OVERWRITE = 'overwrite',
  NAVIGATION_BACK_HEADER = 'navigation-back-header',
  WITHOUT_TITLE = 'without-title',
  WITH_HEADER = 'with-header',
}

export function IsMinimumTableModifiers(value: string): value is MinimumTableModifiers {
  return Object.values(MinimumTableModifiers).includes(value as MinimumTableModifiers);
}

export interface MinimumTableOptions {
  headerButton?: string | TableHeaderButton;
  columnList: Array<TableColumn>;
  actionList: Array<string | TableAction>;
  propertyList: Array<string | DataProperty>;
  modifiers?: string[];
  title?: string;
  componentName?: string;
  cssClass?: CssClass;
  identifier?: AccordionIdentifier;
  hasPaginator?: boolean;
  upstream?: UpstreamOptions;
  sortable?: boolean;
}

export interface NormalizedMinimumTableOptions<MODIFIER extends string = string>
  extends Readonly<Omit<Normalized<MinimumTableOptions>, 'columnList' | 'actionList' | 'propertyList' | 'modifiers'>> {
  componentName: string;
  columnList: ReadonlyArray<NormalizedTableColumn>;
  actionList: ReadonlyArray<NormalizedTableAction>;
  propertyList: Array<NormalizedDataProperty>;
  modifiers: Array<MODIFIER>;
  cssClass: NormalizedCssClass;
  identifier: NormalizedAccordionIdentifier | null;
  upstream: NormalizedUpstreamOptions | null;
  withHeader: boolean;
}

export function NormalizeMinimumTableOptions<MODIFIER extends string = string>(
  options: Readonly<MinimumTableOptions>,
  name: string,
  isModifier: (value: string) => value is MODIFIER,
  suffix = '-table',
): NormalizedMinimumTableOptions<MODIFIER> {
  const componentName = options.componentName ?? CoerceSuffix(name, suffix);
  const actionList = NormalizeTableActionList(options.actionList);
  let sortable = options.sortable ?? true;
  for (const column of options.columnList) {
    column.sortable ??= sortable;
  }
  const columnList = NormalizeTableColumnList(options.columnList);
  sortable = sortable || columnList.some(column => column.sortable);
  const propertyList = NormalizeDataPropertyList(options.propertyList);
  const headerButton = NormalizeTableHeaderButton(options.headerButton, name);
  const modifiers = options.modifiers ?? [];
  if (!columnList.some(column => column.filterControl)) {
    CoerceArrayItems(modifiers, [MinimumTableModifiers.WITH_HEADER]);
  }
  if (sortable) {
    CoerceArrayItems(modifiers, [MinimumTableModifiers.WITH_HEADER]);
  }
  const title = options.title ?? ToTitle(name);
  if (!modifiers.every(isModifier)) {
    throw new Error(`Invalid table modifier for table: ${ componentName } - [ ${ modifiers.join(', ') } ] with function: ${ isModifier.name }`);
  }
  // TODO : map the columnList to a propertyList
  CoerceArrayItems(propertyList, columnList.filter(column => !column.synthetic), (a, b) => a.name === b.name);
  const identifier = NormalizeAccordionIdentifier(options.identifier);
  if (identifier) {
    CoerceArrayItems(propertyList, [identifier.property], (a, b) => a.name === b.name);
  }
  return Object.freeze({
    componentName,
    actionList,
    columnList,
    headerButton,
    modifiers,
    title,
    propertyList,
    cssClass: NormalizeCssClass(options.cssClass),
    identifier,
    hasPaginator: options.hasPaginator ?? true,
    upstream: NormalizeUpstreamOptions(options.upstream),
    sortable,
    withHeader: options.modifiers?.includes(MinimumTableModifiers.WITH_HEADER) ?? false,
  });
}
