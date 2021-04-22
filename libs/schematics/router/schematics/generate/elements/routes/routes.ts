import { Constructor } from '@rxap/utilities';
import { ParsedElement } from '@rxap/xml-parser';
import { AuthRouteElement } from './auth-route.element';
import { SsoRouteElement } from './sso-route.element';

export const Routes: Array<Constructor<ParsedElement>> = [
  AuthRouteElement,
  SsoRouteElement,
];
