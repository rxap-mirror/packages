import { SchematicsException } from '@angular-devkit/schematics';
import {
  DataProperty,
  NormalizeDataProperty,
  NormalizedDataProperty,
  NormalizeTypeImportList,
  TypeImport,
} from '@rxap/ts-morph';
import {
  CoerceArrayItems,
  CoercePrefix,
  dasherize,
  Normalized,
} from '@rxap/utilities';
import { NormalizeAccordionItemList } from '../accordion-item';
import {
  BaseAccordionItem,
  NormalizeBaseAccordionItem,
  NormalizedBaseAccordionItem,
} from './base-accordion-item';
import { AccordionItemKinds } from '../accordion-item-kind';

export interface SwitchAccordionItem extends BaseAccordionItem {
  switch: {
    property: DataProperty;
    case?: Array<{
      test: string;
      itemList: Array<Omit<BaseAccordionItem, 'type'> & Partial<BaseAccordionItem>>
    }>;
    defaultCase?: {
      itemList: Array<Omit<BaseAccordionItem, 'type'> & Partial<BaseAccordionItem>>
    }
  }
}

export function IsSwitchAccordionItem(item: BaseAccordionItem): item is SwitchAccordionItem {
  return item.kind === AccordionItemKinds.Switch;
}

export interface NormalizedSwitchAccordionItem extends Readonly<Normalized<Omit<SwitchAccordionItem, keyof BaseAccordionItem | 'switch'>> & NormalizedBaseAccordionItem> {
  kind: AccordionItemKinds.Switch;
  switch: Readonly<{
    property: NormalizedDataProperty;
    case: ReadonlyArray<{
      test: string;
      itemList: ReadonlyArray<NormalizedBaseAccordionItem>
    }>;
    defaultCase: Readonly<{
      itemList: ReadonlyArray<NormalizedBaseAccordionItem>
    }> | null;
  }>;
}

export function IsNormalizedSwitchAccordionItem(item: NormalizedBaseAccordionItem): item is NormalizedSwitchAccordionItem {
  return item.kind === AccordionItemKinds.Switch;
}

function flattenItemList(itemList: ReadonlyArray<NormalizedBaseAccordionItem>): NormalizedBaseAccordionItem[] {
  let flattenedList: NormalizedBaseAccordionItem[] = [];

  itemList.forEach(item => {
    flattenedList.push(item);

    if (IsNormalizedSwitchAccordionItem(item) && item.switch) {
      const { case: caseList, defaultCase } = item.switch;
      caseList.forEach(caseItem => {
        flattenedList = flattenedList.concat(flattenItemList(caseItem.itemList));
      });

      if (defaultCase) {
        flattenedList = flattenedList.concat(flattenItemList(defaultCase.itemList));
      }
    }
  });

  return flattenedList;
}

function flattenItemListFromSwitch(normalizeSwitch: NormalizedSwitchAccordionItem['switch']): NormalizedBaseAccordionItem[] {
  let flattenedList: NormalizedBaseAccordionItem[] = [];
  const { case: caseList, defaultCase } = normalizeSwitch;
  caseList.forEach(caseItem => {
    flattenedList = flattenedList.concat(flattenItemList(caseItem.itemList));
  });

  if (defaultCase) {
    flattenedList = flattenedList.concat(flattenItemList(defaultCase.itemList));
  }

  return flattenedList;
}

export function NormalizeSwitchAccordionItem(item: Readonly<SwitchAccordionItem>): NormalizedSwitchAccordionItem {
  const base = NormalizeBaseAccordionItem(item);
  const { name } = base;
  const { switch: switchOptions } = item;
  const { property, case: caseList = [], defaultCase } = switchOptions;
  const normalizedProperty = NormalizeDataProperty(property, 'string');
  const normalizeSwitch = Object.freeze({
    property: normalizedProperty,
    case: Object.freeze(caseList.map((item) => ({
      test: normalizedProperty.name === 'string' ? `'${item.test}'` : item.test,
      itemList: NormalizeAccordionItemList(item.itemList.map((item) => ({
        ...item,
        name: CoercePrefix(dasherize(item.name), dasherize(name) + '-'),
      }) as BaseAccordionItem)),
    }))),
    defaultCase: defaultCase && Object.keys(defaultCase).length ? {
      itemList: NormalizeAccordionItemList(defaultCase.itemList.map((item) => ({
        ...item,
        name: CoercePrefix(dasherize(item.name), dasherize(name) + '-'),
      }) as BaseAccordionItem)),
    } : null,
  });
  if (normalizeSwitch.case.length === 0 && !normalizeSwitch.defaultCase) {
    throw new SchematicsException(
      `The switch '${ name }' has no cases or default case. At least one case or default case is required.`,
    );
  }
  const importList: TypeImport[] = item.importList ?? [];
  const accordionImportList = item.accordionImportList ?? [];
  const itemList = flattenItemListFromSwitch(normalizeSwitch);
  for (const innerItem of itemList) {
    CoerceArrayItems(importList, innerItem.importList, (a, b) => a.name === b.name);
    CoerceArrayItems(accordionImportList, innerItem.accordionImportList, (a, b) => a.name === b.name);
  }
  CoerceArrayItems(accordionImportList, [{
    name: 'NgSwitch',
    moduleSpecifier: '@angular/common',
  }], (a, b) => a.name === b.name);
  if (normalizeSwitch.defaultCase) {
    CoerceArrayItems(accordionImportList, [{
      name: 'NgSwitchDefault',
      moduleSpecifier: '@angular/common',
    }], (a, b) => a.name === b.name);
  }
  if (normalizeSwitch.case.length) {
    CoerceArrayItems(accordionImportList, [{
      name: 'NgSwitchCase',
      moduleSpecifier: '@angular/common',
    }], (a, b) => a.name === b.name);
  }
  return Object.freeze({
    ...base,
    accordionImportList: NormalizeTypeImportList(accordionImportList),
    importList: NormalizeTypeImportList(importList),
    kind: AccordionItemKinds.Switch,
    switch: normalizeSwitch,
  });
}
