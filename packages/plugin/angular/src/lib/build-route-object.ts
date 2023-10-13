import {
  WriterFunction,
  Writers,
} from 'ts-morph';

export interface AngularRoute {
  path: string;
  loadChildren?: string;
  loadComponent?: string;
}

export function BuildRouteObject(route: AngularRoute) {
  const obj: Record<string, string | WriterFunction> = {
    path: w => w.quote(route.path),
  };
  if (route.loadChildren) {
    obj.loadChildren = `() => import('${ route.loadChildren }')`;
  }
  if (route.loadComponent) {
    obj.loadComponent = `() => import('${ route.loadComponent }')`;
  }
  return Writers.object(obj);
}
