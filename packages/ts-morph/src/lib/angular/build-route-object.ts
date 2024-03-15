import {
  WriterFunction,
  Writers,
} from 'ts-morph';

export interface AngularRoute {
  path: string;
  loadChildren?: string | { import: string, then: string };
  loadComponent?: string | { import: string, then: string };
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
  }
  return Writers.object(obj);
}
