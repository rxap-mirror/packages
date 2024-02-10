import { SchematicsException } from '@angular-devkit/schematics';
import {
  capitalize,
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
}

export type NormalizedAccordionItem = Readonly<NonNullableSelected<Normalized<AccordionItem>, 'type'>>;

export function NormalizeAccordionItem(item: string | AccordionItem): NormalizedAccordionItem {
  let name: string;
  let type = 'panel';
  let modifiers: string[] = [];
  let title: string;
  let description: string | null = null;
  let permission: string | null = null;
  let additional: Record<string, any> = {};
  if (typeof item === 'string') {
    const fragments = item.split(':');
    name = fragments[0];
    type = fragments[1] ?? type;
    modifiers = fragments[2] ? fragments[2].split(/,(?![^(]*\))/g) : modifiers;
  } else {
    name = item.name;
    type = item.type ?? type;
    modifiers = item.modifiers ?? modifiers;
    title = item.title;
    description = item.description ?? description;
    permission = item.permission ?? permission;
    additional = item;
  }
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
  });
}

export function NormalizeAccordionItemList(itemList?: Array<string | AccordionItem>): ReadonlyArray<NormalizedAccordionItem> {
  return Object.freeze((
    itemList ?? []
  ).map(NormalizeAccordionItem));
}
