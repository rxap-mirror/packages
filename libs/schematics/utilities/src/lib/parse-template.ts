import {
  ParsedElement,
  XmlParserService
} from '@rxap/xml-parser';
import { Constructor } from '@rxap/utilities';
import {
  chain,
  Rule,
  Tree
} from '@angular-devkit/schematics';

export function ParseTemplate<T extends ParsedElement>(host: Tree, template: string, ...elements: Array<Constructor<ParsedElement>>): T {
  const templateFile = host.read(template)?.toString('utf-8');

  const parser = new XmlParserService();

  parser.register(...elements);

  return parser.parseFromXml<T>(templateFile!);
}
