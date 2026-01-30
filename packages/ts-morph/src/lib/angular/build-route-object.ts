import {
  WriterFunction,
  Writers,
} from 'ts-morph';

/**
 * Interface representing an Angular route definition.
 */
export interface AngularRoute {
  /**
   * The path for the route.
   */
  path: string;
  /**
   * The component to use for the route.
   */
  component?: string;
  /**
   * Lazy loaded children routes.
   * Can be a string (import path) or object with import and then/property.
   */
  loadChildren?: string | { import: string, then: string };
  /**
   * Lazy loaded component.
   */
  loadComponent?: string | { import: string, then: string };
  /**
   * The outlet name for the route.
   */
  outlet?: string | null;
  /**
   * Static data for the route.
   */
  data?: Record<string, any> | null;
  /**
   * Configuration for loading a remote module (Module Federation).
   */
  loadRemoteModule?: string | { name: string, entry?: string };
}

/**
 * Builds an object literal expression for an Angular route.
 *
 * @param route - The route definition.
 * @returns A WriterFunction that writes the object literal.
 */
export function BuildRouteObject(route: AngularRoute) {
  const obj: Record<string, string | WriterFunction> = {
    path: w => w.quote(route.path),
  };
  if (route.loadChildren) {
    if (typeof route.loadChildren === 'string') {
      obj['loadChildren'] = `() => import('${ route.loadChildren }')`;
    } else {
      obj['loadChildren'] = `() => import('${ route.loadChildren.import }').then((m) => m.${ route.loadChildren.then })`;
    }
  }
  if (route.loadRemoteModule) {
    let entry = './routes';
    let name: string;
    if (typeof route.loadRemoteModule === 'string') {
      name = route.loadRemoteModule;
    } else {
      name = route.loadRemoteModule.name;
      entry = route.loadRemoteModule.entry ?? entry;
    }
    obj['loadChildren'] = `() => loadRemoteModule('${ name }', '${entry}')`;
  }
  if (route.loadComponent) {
    if (typeof route.loadComponent === 'string') {
      obj['loadComponent'] = `() => import('${ route.loadComponent }')`;
    } else {
      obj['loadComponent'] = `() => import('${ route.loadComponent.import }').then((m) => m.${ route.loadComponent.then })`;
    }
  } else if (route.component) {
    obj['component'] = route.component;
  }
  if (route.outlet) {
    obj['outlet'] = w => w.quote(route.outlet!);
  }
  if (route.data) {
    obj['data'] = Writers.object(Object.entries(route.data)
      .reduce((acc, [ key, value ]) => {
        if (['true', 'false'].includes(value) || typeof value === 'boolean') {
          if (typeof value === 'string') {
            acc[key] = w => w.quote(value);
          } else {
            acc[key] = value ? 'true' : 'false';
          }
        }
        if (typeof value === 'number') {
          acc[key] = value.toString();
        }
        if (!isNaN(Number(value))) {
          acc[key] = value;
        }
        acc[key] = w => w.quote(value);
        return acc;
      }, {} as Record<string, string | WriterFunction>));
  }
  return Writers.object(obj);
}
