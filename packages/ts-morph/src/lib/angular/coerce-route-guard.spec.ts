import {
  CoerceRouteGuard,
  CreateProject,
} from '@rxap/ts-morph';

describe('CoerceRouteGuard', () => {

  it('should add route guard to route with path ""', () => {

    const project = CreateProject();
    const sourceFile = project.createSourceFile('app.routes.ts', `
      export const ROUTES = [
  STATUS_CHECK_ROUTE, {
    path: 'authentication',
    loadChildren: () => import('@rxap/ngx-material-authentication').then((m) => m.AUTHENTICATION_ROUTE)
  }, {
    path: '',
    loadChildren: () => import('./layout.routes'),
  }, {
    path: '**',
    redirectTo: ''
  }];
    `);

    CoerceRouteGuard(sourceFile, [''], 'RxapAuthenticationGuard');

  });

});
