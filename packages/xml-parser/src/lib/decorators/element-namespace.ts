import {
  addToMetadata,
  getMetadata,
  hasMetadata,
  setMetadata,
} from '@rxap/reflect-metadata';
import { ParsedElementType } from './utilities';

export const ELEMENT_NAMESPACE = Symbol('ELEMENT_NAMESPACE');

export function ElementNamespace(...namespaceList: string[]): any;
export function ElementNamespace(map: Record<string, string>): any;
export function ElementNamespace(...namespaceList: [string | Record<string, string>, ...string[]]) {
  return (target: any) => {
    if (namespaceList.length) {
      const first = namespaceList[0];
      let map: Record<string, string>;
      if (typeof first === 'object') {
        map = first;
      } else {
        map = (namespaceList as string[])
          .map(ns => ns.split(':'))
          .filter(ns => ns.length > 1)
          .map(([name, ...rest]) => ({ [name]: rest.join(':') }))
          .reduce((acc, ns) => ({ ...acc, ...ns }), {} as Record<string, string>);
      }
      setMetadata(ELEMENT_NAMESPACE, map, target);
    }
  };
}

export function hasElementNamespaceMetadata(element: ParsedElementType<any>) {
  return hasMetadata(ELEMENT_NAMESPACE, element) && Object.keys(getMetadata<Record<string, string>>(ELEMENT_NAMESPACE, element)!).length > 0;
}

export function getElementNamespaceMetadata(element: ParsedElementType<any>): Record<string, string> {
  if (!hasElementNamespaceMetadata(element)) {
    throw new Error(`The element ${ element.name } does not have a namespace`);
  }
  return getMetadata<Record<string, string>>(ELEMENT_NAMESPACE, element)!;
}
