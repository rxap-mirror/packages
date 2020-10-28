import { NgModule } from '@angular/core';
import {
  RouterModule,
  Routes,
  ExtraOptions,
  Route
} from '@angular/router';
import {
  LayoutComponent,
  LayoutModule,
  Navigation
} from '@rxap/layout';
import { DocumentationComponentModule } from './documentation/documentation.component.module';
import { OverviewComponentModule } from './overview/overview.component.module';
import { OverviewComponent } from './overview/overview.component';
import { DocumentationComponent } from './documentation/documentation.component';

interface Package {
  name: string;
  storybook?: boolean;
  compodoc?: boolean;
  coverage?: boolean;
  schematics?: boolean;
  notion?: string;
}

const PACKAGES: Package[] = [
  {
    name:      'authentication',
    storybook: true,
    compodoc:  true
  },
  {
    name:      'components',
    storybook: true,
    compodoc:  true
  }
];

function BuildRoutes(packages: Package[]): Routes {
  return packages.map(packageDef => {
    const route: Route = ({
      path:      packageDef.name,
      component: DocumentationComponent,
      data:      {
        tabs: {}
      },
      children:  [
        {
          path:      'test',
          component: DocumentationComponent
        },
        {
          path:      'test2',
          component: DocumentationComponent
        }
      ]
    });

    if (packageDef.compodoc) {
      route.data!.tabs.compodoc = `https://rxap-${packageDef.name}-compodoc-dot-reactive-application-platform.appspot.com`;
    }

    if (packageDef.storybook) {
      route.data!.tabs.storybook = `https://rxap-${packageDef.name}-storybook-dot-reactive-application-platform.appspot.com`;
    }

    if (packageDef.coverage) {
      route.data!.tabs.coverage = `https://rxap-${packageDef.name}-coverage-dot-reactive-application-platform.appspot.com`;
    }

    if (packageDef.schematics) {
      route.data!.tabs.schematics = `https://rxap-${packageDef.name}-schematics-dot-reactive-application-platform.appspot.com`;
    }

    if (packageDef.notion) {
      route.data!.tabs.notion = packageDef.notion;
    }

    return route;
  });
}

function BuildNavigation(packages: string[]): Navigation {
  return packages.map(packageName => ({
    icon:       { icon: 'folder' },
    label:      `@rxap/${packageName}`,
    routerLink: [ '/', packageName ],
    children:   [
      {
        icon:       { icon: 'folder' },
        label:      'test',
        routerLink: [ '/', packageName, 'test' ],
        children:   [
          {
            // icon:       { icon: 'folder' },
            label:      'test',
            routerLink: [ '/', packageName, 'test', 'test' ]
          },
          {
            icon:       { icon: 'folder' },
            label:      'test2',
            routerLink: [ '/', packageName, 'test2', 'test2' ]
          }
        ]
      },
      {
        icon:       { icon: 'folder' },
        label:      'test2',
        routerLink: [ '/', packageName, 'test2' ]
      }
    ]
  }));
}

export const APP_ROUTES: Routes = [
  {
    path:      '',
    component: LayoutComponent,
    children:  [
      {
        path:      'overview',
        component: OverviewComponent
      },
      ...BuildRoutes(PACKAGES),
      {
        path:       '**',
        redirectTo: 'overview'
      }
    ]
  },
  {
    path:       '**',
    redirectTo: ''
  }
];

export const APP_ROUTER_CONFIG: ExtraOptions = {};

@NgModule({
  exports: [ RouterModule ],
  imports: [
    RouterModule.forRoot(APP_ROUTES, APP_ROUTER_CONFIG),
    LayoutModule.withNavigation([
      {
        label:      '@rxap/*',
        icon:       { icon: 'home' },
        routerLink: [ '/', 'overview' ]
      },
      ...BuildNavigation(PACKAGES.map(packageDef => packageDef.name))
    ]),
    DocumentationComponentModule,
    OverviewComponentModule
  ]
})
export class AppRoutingModule {}
