import { SchematicsException } from '@angular-devkit/schematics';
import {
  capitalize,
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
  classify,
  CoerceArrayItems,
  NonNullableSelected,
  Normalized,
} from '@rxap/utilities';
import Handlebars from 'handlebars';
import { join } from 'path';
import {
  AccordionIdentifier,
  NormalizeAccordionIdentifier,
  NormalizedAccordionIdentifier,
} from '../../accordion-identifier';
import { LoadHandlebarsTemplate } from '../../load-handlebars-template';
import {
  IfTruthy,
  NormalizedIfTruthy,
  NormalizeIfTruthy,
} from '../../utilities/if-truthy';
import {
  AccordionItemKinds,
  IsAccordionItemKind,
} from '../accordion-item-kind';

export interface BaseAccordionItem {
  name: string;
  kind: AccordionItemKinds;
  modifiers: string[];
  title: string;
  description?: string;
  permission?: string;
  importList?: TypeImport[];
  template?: string;
  identifier?: AccordionIdentifier;
  upstream?: UpstreamOptions;
  propertyList?: DataProperty[];
  ifTruthy?: IfTruthy;
}

export interface NormalizedBaseAccordionItem extends Readonly<NonNullableSelected<Normalized<Omit<BaseAccordionItem, 'propertyList'>>, 'kind'>> {
  importList: NormalizedTypeImport[];
  handlebars: Handlebars.TemplateDelegate<{ item: NormalizedBaseAccordionItem }>,
  identifier: NormalizedAccordionIdentifier | null;
  upstream: NormalizedUpstreamOptions | null;
  propertyList: Array<NormalizedDataProperty>;
  ifTruthy: NormalizedIfTruthy | null;
}

export function NormalizeBaseAccordionItem(item: BaseAccordionItem): NormalizedBaseAccordionItem {
  let kind = AccordionItemKinds.Default;
  let modifiers: string[] = [];
  let title: string;
  let description: string | null = null;
  let permission: string | null = null;
  const name = item.name;
  kind = item.kind ?? kind;
  const template = item.template ?? kind + '-accordion-item.hbs';
  modifiers = item.modifiers ?? modifiers;
  title = item.title;
  description = item.description ?? description;
  permission = item.permission ?? permission;
  const importList: TypeImport[] = item.importList ?? [];
  title ??= dasherize(name).split('-').map(fragment => capitalize(fragment)).join(' ');
  if (!IsAccordionItemKind(kind)) {
    throw new SchematicsException(
      `The item type '${ kind }' for item '${ name }' is not supported`,
    );
  }
  const ifTruthy = NormalizeIfTruthy(item.ifTruthy);
  const propertyList = item.propertyList ?? [];
  const identifier = NormalizeAccordionIdentifier(item.identifier);
  if (identifier) {
    CoerceArrayItems(propertyList, [identifier.property], (a, b) => a.name === b.name, true);
  }
  return Object.freeze({
    ifTruthy,
    propertyList: NormalizeDataPropertyList(propertyList),
    upstream: NormalizeUpstreamOptions(item.upstream),
    identifier,
    title,
    description,
    name: dasherize(name),
    kind,
    modifiers,
    permission,
    importList: NormalizeTypeImportList(importList),
    template,
    handlebars: LoadHandlebarsTemplate(template, join(__dirname, '..', '..', '..', 'schematics', 'accordion', 'templates')),
  });
}
