import { ElementChildParser } from './decorators/element-child';
import { ElementChildrenParser } from './decorators/element-children';
import { ParsedElement } from './elements/parsed-element';
import { getParentParsers } from './get-parent-parsers';

export function linkToParent<Element extends ParsedElement>(
  instance: Element,
  parent: ParsedElement,
) {
  instance.__parent = parent;
  const possibleParentParsers = getParentParsers(instance, parent);
  if (possibleParentParsers.length > 1) {
    console.warn(
      `The parent element ${parent.__tag} has multiple possible parent parsers. Non will be used.`,
    );
  } else if (possibleParentParsers.length === 0) {
    throw new Error(
      `The parent element ${parent.__tag} has no possible parent parser for ${instance.__tag}.`,
    );
  } else {
    const parser = possibleParentParsers[0];
    if (parser) {
      if (parser instanceof ElementChildParser) {
        Reflect.set(parent, parser.propertyKey, instance);
      } else if (parser instanceof ElementChildrenParser) {
        const array = Reflect.get(parent, parser.propertyKey) ?? [];
        array.push(instance);
        Reflect.set(parent, parser.propertyKey, array);
      }
    }
  }
}
