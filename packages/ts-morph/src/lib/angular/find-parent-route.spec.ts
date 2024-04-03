import { SyntaxKind } from 'ts-morph';
import { CreateProject } from '../create-project';
import { FindParentRoute } from './find-parent-route';

describe('FindParentRoute', () => {

  it('should find route with path ""', () => {

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

    const initializer = sourceFile.getVariableDeclaration('ROUTES')!.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);
    const route = FindParentRoute(initializer, ['']);

    expect(route).toBeDefined();

  });

});
