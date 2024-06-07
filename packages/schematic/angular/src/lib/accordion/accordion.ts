import { BuildNestControllerName } from '@rxap/schematics-ts-morph';
import {
  CoerceSuffix,
  dasherize,
} from '@rxap/schematics-utilities';
import {
  DataProperty,
  NormalizeDataPropertyList,
  NormalizedDataProperty,
  NormalizedTypeImport,
  NormalizedUpstreamOptions,
  NormalizeTypeImportList,
  NormalizeUpstreamOptions,
  TypeImport,
  UpstreamOptions,
} from '@rxap/ts-morph';
import {
  CoerceArrayItems,
  Normalized,
} from '@rxap/utilities';
import {
  AccordionIdentifier,
  NormalizeAccordionIdentifier,
  NormalizedAccordionIdentifier,
} from '../accordion-identifier';
import {
  AssertAngularOptionsNameProperty,
  NormalizeAngularOptions,
} from '../angular-options';
import {
  NormalizedPersistent,
  NormalizePersistent,
  Persistent,
} from '../persistent';
import {
  AccordionHeader,
  NormalizeAccordionHeader,
  NormalizedAccordionHeader,
} from './accordion-header';
import {
  AccordionItem,
  NormalizeAccordionItemList,
  NormalizedAccordionItem,
} from './accordion-item';
import { AccordionItemKinds } from './accordion-item-kind';

export interface Accordion {
  name: string;
  itemList?: Array<AccordionItem>;
  multiple?: boolean;
  persistent?: Persistent;
  header?: AccordionHeader;
  identifier?: AccordionIdentifier;
  upstream?: UpstreamOptions;
  propertyList?: DataProperty[];
  importList?: TypeImport[];
}

export interface NormalizedAccordion extends Readonly<Normalized<Omit<Accordion, 'itemList'>>> {
  name: string;
  itemList: ReadonlyArray<NormalizedAccordionItem>;
  persistent: NormalizedPersistent | null;
  withPermission: boolean;
  header: NormalizedAccordionHeader | null;
  identifier: NormalizedAccordionIdentifier | null;
  propertyList: NormalizedDataProperty[];
  upstream: NormalizedUpstreamOptions | null;
  importList: NormalizedTypeImport[];
}

function hasItemWithPermission(itemList: ReadonlyArray<NormalizedAccordionItem>): boolean {
  return itemList.some((item) => {
    if (item.permission) {
      return true;
    }
    if (item.kind === AccordionItemKinds.Switch) {
      return hasItemWithPermission((item as any).switch.case?.flatMap((item: { itemList: NormalizedAccordionItem[] }) => item.itemList) ?? []) ||
             hasItemWithPermission((item as any).switch.defaultCase?.itemList ?? []);
    }
    return false;
  });
}

export function NormalizeAccordion(options: Readonly<Accordion>): NormalizedAccordion {
  const itemList = NormalizeAccordionItemList(options.itemList);
  const propertyList = options.propertyList ?? [];
  const importList = options.importList ?? [];
  const header = NormalizeAccordionHeader(options.header);
  if (header) {
    CoerceArrayItems(propertyList, header.propertyList, (a, b) => a.name === b.name, true);
    CoerceArrayItems(importList, header.importList, (a, b) => a.name === b.name);
  }
  for (const item of itemList) {
    if (item.ifTruthy) {
      CoerceArrayItems(propertyList, [item.ifTruthy.property], (a, b) => a.name === b.name, true);
      CoerceArrayItems(importList, [{ name: 'NgIf', moduleSpecifier: '@angular/common' }], (a, b) => a.name === b.name);
    }
  }
  const identifier = NormalizeAccordionIdentifier(options.identifier);
  if (identifier) {
    CoerceArrayItems(propertyList, [identifier.property], (a, b) => a.name === b.name, true);
  }
  return Object.freeze({
    importList: NormalizeTypeImportList(importList),
    itemList,
    name: options.name,
    multiple: options.multiple ?? false,
    persistent: options.persistent ? NormalizePersistent(options.persistent) : null,
    withPermission: hasItemWithPermission(itemList),
    header,
    identifier,
    upstream: NormalizeUpstreamOptions(options.upstream),
    propertyList: NormalizeDataPropertyList(propertyList),
  });
}
