import { Constructor } from '@rxap/utilities';
import { ParsedElement } from '@rxap/xml-parser';
import { AuthGuardElement } from './auth-guard.element';
import { ComponentGenerateSchematicElement } from './component-generate-schematic.element';
import { FormComponentGenerateSchematicElement } from './form-component-generate-schematic.element';
import { TableGenerateSchematicElement } from './table-generate-schematic.element';
import { EmptyRouterOutletElement } from './empty-router-outlet.element';
import { SsoGuardElement } from './sso-guard.element';

export const RouteFeatures: Array<Constructor<ParsedElement>> = [
  AuthGuardElement,
  ComponentGenerateSchematicElement,
  FormComponentGenerateSchematicElement,
  TableGenerateSchematicElement,
  EmptyRouterOutletElement,
  SsoGuardElement,
];
