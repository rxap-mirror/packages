import { Project } from 'ts-morph';
import { CreateProject } from '../create-project';
import { CoerceLayoutRoutes } from './coerce-layout-routes';

describe('CoerceLayoutRouters', () => {

  let project: Project;

  beforeEach(() => {
    project = CreateProject();
  });

  it('should coerce layout routers', () => {
    const sourceFile = project.createSourceFile('layout.routes.ts');
    CoerceLayoutRoutes(sourceFile);
    expect(sourceFile.getText()).toEqual(`import { Route } from '@angular/router';
import { LayoutComponent, NavigationService } from '@rxap/layout';
import { StatusCheckGuard } from '@rxap/ngx-status-check';
import { APP_NAVIGATION_PROVIDER } from './app.navigation';

export const ROUTES: Route[] = [
    {
      path: '',
      component: LayoutComponent,
      canActivateChild: [StatusCheckGuard],
      children: 
      [
        {
          path: '**',
          redirectTo: ''
        }
      ],
      providers: [
        APP_NAVIGATION_PROVIDER,
        NavigationService
      ]
    },
  {
    path: '**',
    redirectTo: ''
  }
  ];

export default ROUTES;
`);
  });

});
