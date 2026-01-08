import { ElementChildParser } from './decorators/element-child';
import { ElementChildrenParser } from './decorators/element-children';
import { ParsedElement } from './elements/parsed-element';
import { getParentParsers } from './get-parent-parsers';

export function unlinkFromParent<Element extends ParsedElement>(
  instance: Element,
) {
  if (!instance.__parent) {
    throw new Error(
      `The element ${instance.__tag} is not linked to a parent element`,
    );
  }
  const parent = instance.__parent;
  const possibleParentParsers = getParentParsers(instance, parent);
  for (const parser of possibleParentParsers) {
    if (parser instanceof ElementChildParser) {
      if (Reflect.get(parent, parser.propertyKey) === instance) {
        Reflect.set(parent, parser.propertyKey, null);
      }
    } else if (parser instanceof ElementChildrenParser) {
      const array: any[] = Reflect.get(parent, parser.propertyKey) ?? [];
      array.splice(array.indexOf(instance), 1);
      Reflect.set(parent, parser.propertyKey, array);
    }
  }
  instance.__parent = undefined;
}
