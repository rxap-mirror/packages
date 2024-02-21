import {
  DataProperty,
  NormalizeDataProperty,
  NormalizedDataProperty,
  NormalizedTypeImport,
  NormalizeTypeImport,
  TypeImport,
} from '@rxap/ts-morph';

export interface BaseAccordionHeader {
  importList?: TypeImport[];
}

export interface StaticAccordionHeader extends BaseAccordionHeader {
  title: string;
}

export interface PropertyAccordionHeader extends BaseAccordionHeader {
  property: DataProperty;
}

export type AccordionHeader = StaticAccordionHeader | PropertyAccordionHeader;

export interface NormalizedBaseAccordionHeader {
  importList: NormalizedTypeImport[];
}

export interface NormalizedStaticAccordionHeader extends NormalizedBaseAccordionHeader {
  title: string;
}

export interface NormalizedPropertyAccordionHeader extends NormalizedBaseAccordionHeader {
  property: NormalizedDataProperty;
}

export type NormalizedAccordionHeader = NormalizedStaticAccordionHeader | NormalizedPropertyAccordionHeader;

export function IsStaticAccordionHeader(header: AccordionHeader): header is StaticAccordionHeader {
  return (header as StaticAccordionHeader).title !== undefined;
}

export function IsPropertyAccordionHeader(header: AccordionHeader): header is PropertyAccordionHeader {
  return (header as PropertyAccordionHeader).property !== undefined;
}

export function IsNormalizedStaticAccordionHeader(header: NormalizedAccordionHeader): header is NormalizedStaticAccordionHeader {
  return (header as NormalizedStaticAccordionHeader).title !== undefined;
}

export function IsNormalizedPropertyAccordionHeader(header: NormalizedAccordionHeader): header is NormalizedPropertyAccordionHeader {
  return (header as NormalizedPropertyAccordionHeader).property !== undefined;
}

function coerceBaseAccordionHeaderImportList(header: BaseAccordionHeader): TypeImport[] {
  const importList: TypeImport[] = header.importList ?? [];
  importList.push({
    name: 'AccordionHeaderComponent',
    moduleSpecifier: './accordion-header/accordion-header.component'
  });
  return importList;
}

export function NormalizeBaseAccordionHeader(header: BaseAccordionHeader): NormalizedBaseAccordionHeader {
  return Object.freeze({
    importList: coerceBaseAccordionHeaderImportList(header).map(NormalizeTypeImport)
  });
}

export function NormalizeAccordionHeader(header?: AccordionHeader): NormalizedAccordionHeader | null {
  if (header) {
    if (IsStaticAccordionHeader(header)) {
      return Object.freeze({
        ...NormalizeBaseAccordionHeader(header),
        title: header.title,
      });
    } else if (IsPropertyAccordionHeader(header)) {
      return Object.freeze({
        ...NormalizeBaseAccordionHeader(header),
        property: NormalizeDataProperty(header.property, 'string'),
      });
    }
  }
  return null;
}

