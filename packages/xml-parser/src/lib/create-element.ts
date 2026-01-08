import { getMetadata } from '@rxap/reflect-metadata';
import { Constructor } from '@rxap/utilities';
import { ElementChildParser } from './decorators/element-child';
import { ElementChildrenParser } from './decorators/element-children';
import { applyElementNamespaceMetadata } from './decorators/element-namespace';
import { ElementParserMetaData } from './decorators/metadata-keys';
import { GetAllElementParserInstances } from './decorators/utilities';
import { ParsedElement } from './elements/parsed-element';
import { linkToParent } from './link-to-parent';
import { isParsedElement } from './utilities/is-parsed-element';

export function createElement<Element extends ParsedElement>(
  element: Element | Constructor<Element>
): Element;
export function createElement<Element extends ParsedElement>(
  element: Element | Constructor<Element>,
  parent: ParsedElement | null
): Element
export function createElement<Element extends ParsedElement>(
  element: Element | Constructor<Element>,
  properties: Partial<{ [K in keyof Element]: Element[K] | null | undefined }>,
  parent?: ParsedElement | null
): Element
export function createElement<Element extends ParsedElement>(
  element: Element | Constructor<Element>,
  propertiesOrParent?: Partial<{ [K in keyof Element]: Element[K] | null | undefined }> | ParsedElement | null,
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
    linkToParent(instance, parent);
  }

  const parsers = GetAllElementParserInstances(constructor);

  for (const [key, value] of Object.entries(properties ?? {}).filter(([, value]) => value !== null && value !== undefined)) {
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
