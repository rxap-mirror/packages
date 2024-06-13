import {
  DataProperty,
  NormalizeDataPropertyList,
  NormalizedDataProperty,
  NormalizedTypeImport,
  NormalizeTypeImportList,
  TypeImport,
} from '@rxap/ts-morph';
import { CoerceArrayItems } from '@rxap/utilities';
import { join } from 'path';
import { LoadHandlebarsTemplate } from '../../load-handlebars-template';
import { AccordionHeaderKinds } from '../accordion-header-kind';

export interface BaseAccordionHeader {
  importList?: TypeImport[];
  propertyList?: DataProperty[];
  template?: string;
  kind?: AccordionHeaderKinds;
}

export interface NormalizedBaseAccordionHeader {
  kind: AccordionHeaderKinds;
  importList: NormalizedTypeImport[];
  propertyList: NormalizedDataProperty[];
  template: string;
  handlebars?: Handlebars.TemplateDelegate<{ header: NormalizedBaseAccordionHeader }>;
}

function coerceBaseAccordionHeaderImportList(header: BaseAccordionHeader): TypeImport[] {
  const importList: TypeImport[] = header.importList ?? [];
  CoerceArrayItems(importList, [
    {
      name: 'NavigateBackButtonComponent',
      moduleSpecifier: '@rxap/components',
    },
  ], (a, b) => a.name === b.name);
  return importList;
}

export function NormalizeBaseAccordionHeader(header: BaseAccordionHeader, _propertyList?: DataProperty[]): NormalizedBaseAccordionHeader {
  const kind = header.kind ?? AccordionHeaderKinds.Default;
  const template = header.template ?? kind + '-accordion-header.hbs';
  const propertyList = header.propertyList ?? [];
  CoerceArrayItems(propertyList, _propertyList ?? [], (a, b) => a.name === b.name);
  return Object.freeze({
    propertyList: NormalizeDataPropertyList(propertyList),
    kind,
    template,
    handlebars: LoadHandlebarsTemplate(
      template, join(__dirname, '..', '..', '..', 'schematics', 'accordion', 'templates')),
    importList: NormalizeTypeImportList(coerceBaseAccordionHeaderImportList(header)),
  });
}
