import { Constructor } from '@rxap/utilities';
import { ParsedElement } from '@rxap/xml-parser';
import { RoutingElement } from './routing.element';
import { RouteElement } from './route.element';
import { AuthRouteElement } from './routes/auth-route.element';
import { Routes } from './routes/routes';
import { ComponentFeatures } from './component-features/component-features';
import { RouteFeatures } from './route-features/route-features';
import { ComponentElement } from './component.element';
import { FeatureModuleElement } from './feature-module.element';
import { ModuleElement } from './module.element';
import { SchematicElement } from './schematic.element';

export const Elements: Array<Constructor<ParsedElement>> = [
  RoutingElement,
  RouteElement,
  ComponentElement,
  FeatureModuleElement,
  ModuleElement,
  SchematicElement,
  ...Routes,
  ...ComponentFeatures,
  ...RouteFeatures,
];
