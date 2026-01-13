import { Tree } from '@nx/devkit';
import {
  CoerceAppConfigProvider,
  CoerceImports,
  ProviderObject,
} from '@rxap/ts-morph';
import { TsMorphAngularProjectTransform } from '@rxap/workspace-ts-morph';
import { InitApplicationGeneratorSchema } from './schema';

export function coerceAppConfig(tree: Tree, projectName: string, options: InitApplicationGeneratorSchema,) {
  return TsMorphAngularProjectTransform(tree, {
    project: projectName,
  }, (_, [ sourceFile ]) => {
    const providers: Array<string | ProviderObject> = [
      'provideRouter(appRoutes, withEnabledBlockingInitialNavigation())',
      'provideAnimations()',
      'ProvideErrorHandler()',
      'ProvideEnvironment(environment)',
    ];
    const httpInterceptors = [
      'HttpErrorInterceptor',
    ];
    const importProvidersFrom: string[] = [];
    CoerceImports(sourceFile, [
      {
        moduleSpecifier: '@angular/platform-browser/animations',
        namedImports: [ 'provideAnimations' ],
      },
      {
        moduleSpecifier: '@angular/router',
        namedImports: [ 'provideRouter', 'withEnabledBlockingInitialNavigation' ],
      },
      {
        moduleSpecifier: './app.routes',
        namedImports: [ 'appRoutes' ],
      },
      {
        moduleSpecifier: '@rxap/ngx-error',
        namedImports: [ 'ProvideErrorHandler', 'HttpErrorInterceptor' ],
      },
      {
        moduleSpecifier: '@rxap/environment',
        namedImports: [ 'ProvideEnvironment' ],
      },
      {
        moduleSpecifier: '../environments/environment',
        namedImports: [ 'environment' ],
      },
    ]);
    if (options.monolithic) {
      providers.push('ProvidePubSub()');
      providers.push('ProvideChangelog()');
      providers.push('provideTheme()');
      providers.push('provideExternalApps()');
      providers.push('provideMarkdown()');
      CoerceImports(sourceFile, [
        {
          moduleSpecifier: '@rxap/ngx-changelog',
          namedImports: [ 'ProvideChangelog' ],
        },
        {
          moduleSpecifier: 'ngx-markdown',
          namedImports: [ 'provideMarkdown' ],
        },
        {
          moduleSpecifier: '@rxap/ngx-pub-sub',
          namedImports: [ 'ProvidePubSub' ],
        },
        {
          moduleSpecifier: '@rxap/ngx-theme',
          namedImports: [ 'provideTheme' ],
        },
        {
          moduleSpecifier: '@rxap/layout',
          namedImports: [ 'provideExternalApps' ],
        }
      ]);
    }
    if (options.oauth) {
      providers.push('provideOAuthClient()');
      providers.push('ProvideAuth()');
      httpInterceptors.push('BearerTokenInterceptor');
      CoerceImports(sourceFile, [
        {
          moduleSpecifier: 'angular-oauth2-oidc',
          namedImports: [ 'provideOAuthClient' ],
        },
        {
          moduleSpecifier: '@rxap/oauth',
          namedImports: [ 'ProvideAuth' ],
        },
        {
          moduleSpecifier: '@rxap/authentication',
          namedImports: [ 'BearerTokenInterceptor' ],
        },
      ]);
    }
    if (options.i18n) {
      httpInterceptors.push('LanguageInterceptor');
      CoerceImports(sourceFile, [
        {
          moduleSpecifier: '@rxap/ngx-localize',
          namedImports: [ 'LanguageInterceptor' ],
        },
      ]);
    }
    if (options.serviceWorker) {
      providers.push(
        `provideServiceWorker('ngsw-worker.js', { enabled: environment.serviceWorker, registrationStrategy: 'registerWhenStable:30000' })`);
      providers.push('ProvideServiceWorkerUpdater(withDialogUpdater())');
      CoerceImports(sourceFile, [
        {
          moduleSpecifier: '@angular/service-worker',
          namedImports: [ 'provideServiceWorker' ],
        },
        {
          moduleSpecifier: '@rxap/service-worker',
          namedImports: [ 'ProvideServiceWorkerUpdater', 'withDialogUpdater' ],
        },
      ]);
    }
    if (options.material) {
      providers.push('ProvideIconAssetPath()');
      CoerceImports(sourceFile, [
        {
          moduleSpecifier: '@rxap/icon',
          namedImports: [ 'ProvideIconAssetPath' ],
        },
      ]);
    }
    switch (options.authentication) {
      case 'oauth2-proxy':
        providers.push('provideOauth2Proxy()');
        CoerceImports(sourceFile, {
          moduleSpecifier: '@rxap/ngx-oauth2-proxy',
          namedImports: [ 'provideOauth2Proxy' ],
        });
        break;
    }
    CoerceAppConfigProvider(sourceFile, {
      overwrite: options.overwrite,
      providers,
      httpInterceptors,
      importProvidersFrom,
    });
  }, [ '/app/app.config.ts' ]);
}
