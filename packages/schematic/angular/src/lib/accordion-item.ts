import {
  AccordionItemTypes,
  IsAccordionItemType,
} from './accordion-itme-types';
import {
  dasherize,
  NonNullableSelected,
  Normalized,
} from '@rxap/utilities';
import { SchematicsException } from '@angular-devkit/schematics';

export interface AccordionItem {
  name: string;
  type: AccordionItemTypes;
  modifiers: string[];
}

export type NormalizedAccordionItem = Readonly<NonNullableSelected<Normalized<AccordionItem>, 'type'>>;

export function NormalizeAccordionItem(item: string | AccordionItem): NormalizedAccordionItem {
  let name: string;
  let type = 'panel';
  let modifiers: string[] = [];
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
    additional = item;
  }
  if (!IsAccordionItemType(type)) {
    throw new SchematicsException(
      `The item type '${ type }' for item '${ name }' is not supported`,
    );
  }
  return Object.seal({
    ...additional,
    name: dasherize(name),
    type,
    modifiers,
  });
}

export function NormalizeAccordionItemList(itemList?: Array<string | AccordionItem>): NormalizedAccordionItem[] {
  return Object.seal((itemList ?? []).map(NormalizeAccordionItem));
}
