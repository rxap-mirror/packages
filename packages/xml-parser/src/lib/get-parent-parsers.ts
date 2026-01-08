import { Constructor } from '@rxap/utilities';
import { ElementChildParser } from './decorators/element-child';
import { ElementChildrenParser } from './decorators/element-children';
import {
  GetAllElementParserInstances,
  ParsedElementType,
} from './decorators/utilities';
import { ParsedElement } from './elements/parsed-element';
import { isTypeOf } from './utilities/is-type-of';

export function getParentParsers<Element extends ParsedElement>(
  instance: Element | ParsedElementType<Element>,
  parent: ParsedElement,
) {
  const parsers = GetAllElementParserInstances(parent.constructor as Constructor<ParsedElement>);
  return parsers.filter((parser) => {
    if (
      parser instanceof ElementChildParser ||
      parser instanceof ElementChildrenParser
    ) {
      const elementType = parser.elementType;
      return (
        elementType &&
        isTypeOf(
          typeof instance === 'function' ? instance : instance.constructor as ParsedElementType<Element>,
          elementType,
        )
      );
    }
    return false;
  });
}
