import {
  NormalizeDataProperty,
  NormalizedDataProperty,
} from '@rxap/ts-morph';
import { NormalizedAccordionComponentOptions } from '../schematics/accordion/accordion-component/normalize-accordion-component-options';
import { AccordionItemKinds } from './accordion/accordion-item-kind';
import { IsNormalizedPropertyAccordionHeader } from './accordion/header/property-accordion-header';
import { IsNormalizedPropertyPersistent } from './persistent';

export function buildPropertyList(normalizedOptions: NormalizedAccordionComponentOptions): NormalizedDataProperty[] {
  const {
    persistent,
    itemList,
    header,
    identifier,
    propertyList,
  } = normalizedOptions;
  if (persistent && IsNormalizedPropertyPersistent(persistent)) {
    if (!propertyList.some((property) => property.name === persistent.property.name)) {
      propertyList.push(persistent.property);
    }
  }
  if (itemList.some(item => item.kind === AccordionItemKinds.Switch)) {
    for (const item of itemList) {
      if (item.kind === AccordionItemKinds.Switch) {
        propertyList.push(NormalizeDataProperty({
          name: (
            item as any
          ).switch.property.name,
          type: (
            item as any
          ).switch.property.type,
        }));
      }
    }
  }
  if (header && IsNormalizedPropertyAccordionHeader(header)) {
    if (!propertyList.some((property) => property.name === header.property.name)) {
      propertyList.push(header.property);
    }
  }
  if (identifier) {
    if (!propertyList.some((property) => property.name === identifier.property.name)) {
      propertyList.push(identifier.property);
    }
  }
  return propertyList;
}