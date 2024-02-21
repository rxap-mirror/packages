import { SchematicsException } from '@angular-devkit/schematics';
import {
  NormalizedTypeImport,
  NormalizeTypeImport,
  TypeImport,
} from '@rxap/ts-morph';
import {
  capitalize,
  classify,
  dasherize,
  NonNullableSelected,
  Normalized,
} from '@rxap/utilities';
import {
  AccordionItemTypes,
  IsAccordionItemType,
} from './accordion-itme-types';

export interface AccordionItem {
  name: string;
  type: AccordionItemTypes;
  modifiers: string[];
  title: string;
  description?: string;
  permission?: string;
  importList?: TypeImport[];
}

export interface NormalizedAccordionItem extends Readonly<NonNullableSelected<Normalized<AccordionItem>, 'type'>> {
  importList: NormalizedTypeImport[];
}

function coerceAccordionItemImportList(item: AccordionItem): TypeImport[] {
  const importList: TypeImport[] = item.importList ?? [];
  importList.push({
    name: `${classify(item.name)}PanelComponent`,
    moduleSpecifier: `./${dasherize(item.name)}-panel/${dasherize(item.name)}-panel.component`
  });
  return importList;
}

export function NormalizeAccordionItem(item: AccordionItem): NormalizedAccordionItem {
  let type = 'panel';
  let modifiers: string[] = [];
  let title: string;
  let description: string | null = null;
  let permission: string | null = null;
  let additional: Record<string, any> = {};
  const name = item.name;
  type = item.type ?? type;
  modifiers = item.modifiers ?? modifiers;
  title = item.title;
  description = item.description ?? description;
  permission = item.permission ?? permission;
  additional = item;
  const importList = coerceAccordionItemImportList(item);
  title ??= dasherize(name).split('-').map(fragment => capitalize(fragment)).join(' ');
  if (!IsAccordionItemType(type)) {
    throw new SchematicsException(
      `The item type '${ type }' for item '${ name }' is not supported`,
    );
  }
  return Object.freeze({
    ...additional,
    title,
    description,
    name: dasherize(name),
    type,
    modifiers,
    permission,
    importList: importList.map(NormalizeTypeImport),
  });
}

export function NormalizeAccordionItemList(itemList?: Array<AccordionItem>): ReadonlyArray<NormalizedAccordionItem> {
  return Object.freeze((
    itemList ?? []
  ).map(NormalizeAccordionItem));
}
