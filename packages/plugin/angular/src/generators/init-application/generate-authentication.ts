import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  CoerceAppRoutes,
  CoerceImports,
  CoerceRouteGuard,
} from '@rxap/ts-morph';
import { TsMorphAngularProjectTransform } from '@rxap/workspace-ts-morph';
import {
  AddPackageJsonDependency,
  CoerceTarget,
  GetProject,
  UpdateJsonFile,
} from '@rxap/workspace-utilities';
import { parseDocument } from 'yaml';
import { InitApplicationGeneratorSchema } from './schema';

async function defaultAuthentication(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitApplicationGeneratorSchema) {

  console.log('default authentication');

  await AddPackageJsonDependency(tree, '@rxap/ngx-material-authentication', 'latest', { soft: true });

  TsMorphAngularProjectTransform(tree, {
    project: projectName,
  }, (_, [ appSourceFile ]) => {
    CoerceAppRoutes(appSourceFile, {
      itemList: [
        {
          route: {
            path: 'authentication',
            loadChildren: {
              import: '@rxap/ngx-material-authentication',
              then: 'AUTHENTICATION_ROUTE'
            }
          }
        }
      ]
    });
    CoerceRouteGuard(appSourceFile, [''], 'RxapAuthenticationGuard', { routeArrayName: 'appRoutes' });
    CoerceImports(appSourceFile, {
      namedImports: ['RxapAuthenticationGuard'],
      moduleSpecifier: '@rxap/authentication',
    });
  }, [ 'app/app.routes.ts?' ]);
}

async function oauth2ProxyAuthentication(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitApplicationGeneratorSchema) {

  console.log('oauth2-proxy authentication');

  await AddPackageJsonDependency(tree, '@rxap/ngx-oauth2-proxy', 'latest', { soft: true });

  TsMorphAngularProjectTransform(tree, {
    project: projectName,
  }, (_, [ appSourceFile ]) => {
    CoerceRouteGuard(appSourceFile, [''], 'oauth2ProxyGuard', { routeArrayName: 'appRoutes' });
    CoerceImports(appSourceFile, {
      namedImports: ['oauth2ProxyGuard'],
      moduleSpecifier: '@rxap/ngx-oauth2-proxy',
    });
  }, [ 'app/app.routes.ts?' ]);

  if (tree.exists('docker-compose.yml')) {
    const dockerComposeContent = tree.read('docker-compose.yml', 'utf-8')!;
    const dockerCompose = parseDocument(dockerComposeContent);
    if (dockerCompose.hasIn(['services', 'rxap-service-user'])) {
      if (!dockerCompose.hasIn(['services', 'rxap-service-user', 'labels'])) {
        dockerCompose.setIn(['services', 'rxap-service-user', 'labels'], [
          'traefik.http.routers.user.middlewares=oauth-signin@docker,oauth-verify@docker'
        ]);
      }
    }
  }

  if (tree.exists('shared/angular/proxy.conf.json')) {
    UpdateJsonFile(tree, proxyConf => {
      proxyConf['/oauth2'] ??= {
        "target": "https://127-0-0-1.nip.io:8443",
        "secure": false
      };
    }, 'shared/angular/proxy.conf.json');
  }

  const workspaceProject = GetProject(tree, 'workspace');
  if (workspaceProject.targets && 'docker-compose' in workspaceProject.targets) {
    CoerceTarget(workspaceProject, 'docker-compose', {
      options: {
        options: {
          middlewares: [
            'oauth-signin@docker',
            'oauth-verify@docker',
          ],
        },
      },
    });
  }

}

export async function generateAuthentication(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitApplicationGeneratorSchema) {

  console.log('generate authentication');

  switch (options.authentication) {

    default:
    case true:
      return defaultAuthentication(tree, projectName, project, options);

    case 'oauth2-proxy':
      return oauth2ProxyAuthentication(tree, projectName, project, options);

  }



}
