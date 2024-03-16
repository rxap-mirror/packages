import {
  WriterFunction,
  Writers,
} from 'ts-morph';

export interface AngularRoute {
  path: string;
  component?: string;
  loadChildren?: string | { import: string, then: string };
  loadComponent?: string | { import: string, then: string };
  outlet?: string | null;
  data?: Record<string, any> | null;
}

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
