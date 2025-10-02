import { getMetadata } from '@rxap/reflect-metadata';
import { Constructor } from '@rxap/utilities';
import {
  applyElementNamespaceMetadata,
  ElementChildParser,
  ElementChildrenParser,
  ElementParserMetaData,
  GetAllElementParserInstances,
  ParsedElement,
} from '@rxap/xml-parser';
import { isParsedElement } from './utilities/is-parsed-element';
import { isTypeOf } from './utilities/is-type-of';

export function createElement<Element extends ParsedElement>(
  element: Element | Constructor<Element>
): Element;
export function createElement<Element extends ParsedElement>(
  element: Element | Constructor<Element>,
  parent: ParsedElement | null
): Element
export function createElement<Element extends ParsedElement>(
  element: Element | Constructor<Element>,
  properties: Partial<{ [K in keyof Element]: Element[K] }>,
  parent?: ParsedElement | null
): Element
export function createElement<Element extends ParsedElement>(
  element: Element | Constructor<Element>,
  propertiesOrParent?: Partial<{ [K in keyof Element]: Element[K] }> | ParsedElement | null,
  _parent?: ParsedElement | null
): Element {
  const constructor: Constructor<Element> =
    typeof element === 'function'
    ? element
    : (element.constructor as Constructor<Element>);
  const tag = getMetadata<string>(ElementParserMetaData.NAME, constructor);
  if (!tag) {
    throw new Error(
      `The element ${constructor.name} is not annotated with @ElementDef`
    );
  }
  const instance = typeof element === 'function' ? new element() : element;
  const properties = (isParsedElement(propertiesOrParent) || propertiesOrParent === null ? {} : propertiesOrParent) as Partial<{ [K in keyof Element]: Element[K] }> | undefined;
  const parent = isParsedElement(propertiesOrParent) ? propertiesOrParent : _parent;

  instance.__tag ??= tag;
  instance.__xmlns ??= new Map();
  applyElementNamespaceMetadata(instance);
  if (parent) {
    instance.__parent = parent;
    const parsers = GetAllElementParserInstances(parent.constructor as any);
    const possibleParentParsers = parsers.filter(parser => {
      if (parser instanceof ElementChildParser || parser instanceof ElementChildrenParser) {
        const elementType = parser.elementType//??;
        if (elementType) {
          return isTypeOf(constructor, elementType)
        }
      }
      return false;
    });
    if (possibleParentParsers.length > 1) {
      console.warn(`The parent element ${parent.__tag} has multiple possible parent parsers. Non will be used.`)
    } else if (possibleParentParsers.length === 0) {
      console.warn(`The parent element ${parent.__tag} has no possible parent parser for ${instance.__tag}.`)
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

  const parsers = GetAllElementParserInstances(constructor);

  for (const [key, value] of Object.entries(properties ?? {})) {
    const parser = parsers.find((p) => p.propertyKey === key);
    Reflect.set(instance, key, value);
    if (
      parser &&
      (parser instanceof ElementChildParser ||
       parser instanceof ElementChildrenParser)
    ) {
      if (Array.isArray(value)) {
        value.forEach((v) => Reflect.set(v, '__parent', instance));
      } else {
        Reflect.set(value, '__parent', instance);
      }
    }
  }

  return instance;
}
