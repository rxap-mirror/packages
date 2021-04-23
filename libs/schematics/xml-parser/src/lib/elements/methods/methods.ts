import { Constructor } from '@rxap/utilities';
import { ParsedElement } from '@rxap/xml-parser';
import { MethodElement } from './method.element';
import { OpenApiRemoteMethodElement } from './open-api-remote-method.element';

export const Methods: Array<Constructor<ParsedElement>> = [
  MethodElement,
  OpenApiRemoteMethodElement
];
