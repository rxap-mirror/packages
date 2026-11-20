import {
  addProjectConfiguration,
  getProjects,
  joinPathFragments,
  readNxJson,
  Tree,
} from '@nx/devkit';
import {
  CoerceFile,
  CoerceIgnorePattern,
  UpdateTsConfigJson,
} from '@rxap/workspace-utilities';
import { InitGeneratorSchema } from './schema';

export function GetPrismAppRoot(tree: Tree, prismProject: string): string {
  const appsDir = readNxJson(tree)?.workspaceLayout?.appsDir ?? 'apps';
  return joinPathFragments(appsDir, prismProject);
}

function mainTs(prismProject: string) {
  return `import { bootstrapApplication } from '@angular/platform-browser';
import {
  enablePrismHmr,
  PrismShellComponent,
  providePrism,
} from '@ng-prism/core';
import config from 'ng-prism.config';
import { PRISM_RUNTIME_MANIFEST } from 'prism-manifest/${ prismProject }';
import { PRISM_HOST_PROVIDERS } from './providers';

const hot = (import.meta as ImportMeta & {
  hot?: {
    accept(dep: string, cb: (mod: { PRISM_RUNTIME_MANIFEST: typeof PRISM_RUNTIME_MANIFEST } | undefined) => void): void
  }
}).hot;

bootstrapApplication(PrismShellComponent, {
  providers: [ providePrism(PRISM_RUNTIME_MANIFEST, config), ...PRISM_HOST_PROVIDERS ],
}).then((appRef) => {
  hot?.accept('prism-manifest/${ prismProject }', (mod) => {
    if (mod) {
      enablePrismHmr(appRef, mod.PRISM_RUNTIME_MANIFEST);
    }
  });
});
`;
}

const PROVIDERS_TS = `import { provideHttpClient } from '@angular/common/http';
import {
  EnvironmentProviders,
  inject,
  provideAppInitializer,
  Provider,
} from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

const PLACEHOLDER_ICON = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="3"/></svg>',
);

/**
 * Providers of the styleguide application. A @Showcase can not declare providers, because the manifest is static.
 * Components that inject a token (e.g. RXAP_ENVIRONMENT) get their providers here.
 * The ng-prism.config.ts is also loaded in node without the tsconfig paths, therefore the providers
 * must not be added with appProviders in the config.
 */
export const PRISM_HOST_PROVIDERS: Array<Provider | EnvironmentProviders> = [
  provideHttpClient(),
  // the libraries use svg icons that are registered by the consuming application.
  // Every unknown svg icon is resolved to a placeholder
  provideAppInitializer(() => {
    const sanitizer = inject(DomSanitizer);
    inject(MatIconRegistry).addSvgIconResolver(() => sanitizer.bypassSecurityTrustResourceUrl(PLACEHOLDER_ICON));
  }),
];
`;

const INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>RxAP Styleguide</title>
  <style>* { margin: 0; padding: 0; box-sizing: border-box; } html, body { height: 100%; }</style>
</head>
<body>
  <prism-shell></prism-shell>
</body>
</html>
`;

const NG_PRISM_CONFIG = `import { defineConfig } from '@ng-prism/core/config';
import { jsDocPlugin } from '@ng-prism/plugin-jsdoc';

export default defineConfig({
  plugins: [ jsDocPlugin() ],
});
`;

/**
 * Creates the shared styleguide host application. The libraries do not bring their own
 * styleguide application. Each library target references this application through the
 * `prismProject` option.
 */
export async function initWorkspace(tree: Tree, options: InitGeneratorSchema) {
  console.log('init ng-prism workspace');

  const prismProject = options.prismProject!;
  const appRoot = GetPrismAppRoot(tree, prismProject);

  // the host application must be compiled with the same settings as the libraries that are rendered
  // in it. The workspace base tsconfig still uses the legacy node module resolution
  UpdateTsConfigJson(tree, tsConfig => {
    tsConfig.compilerOptions ??= {};
    tsConfig.compilerOptions.paths ??= {};
    tsConfig.compilerOptions.paths['ng-prism.config'] ??= [ './ng-prism.config.ts' ];
    tsConfig.compilerOptions.paths['prism-manifest/*'] ??= [ './ng-prism-cache/*/prism-manifest.ts' ];
  }, { basePath: '', infix: 'base' });

  CoerceIgnorePattern(tree, '.gitignore', [ 'ng-prism-cache' ]);

  CoerceFile(tree, 'ng-prism.config.ts', NG_PRISM_CONFIG, options.overwrite);
  CoerceFile(tree, joinPathFragments(appRoot, 'src/main.ts'), mainTs(prismProject), options.overwrite);
  CoerceFile(tree, joinPathFragments(appRoot, 'src/providers.ts'), PROVIDERS_TS);
  CoerceFile(tree, joinPathFragments(appRoot, 'src/index.html'), INDEX_HTML, options.overwrite);

  const depth = appRoot.split('/').length;
  const toRoot = Array(depth).fill('..').join('/');

  CoerceFile(tree, joinPathFragments(appRoot, 'tsconfig.app.json'), JSON.stringify({
    extends: `${ toRoot }/tsconfig.base.json`,
    compilerOptions: {
      outDir: `${ toRoot }/dist/out-tsc/${ prismProject }`,
      rootDir: toRoot,
      target: 'es2022',
      module: 'preserve',
      moduleResolution: 'bundler',
      lib: [ 'dom', 'es2022' ],
      useDefineForClassFields: false,
      types: [ '@angular/localize' ],
    },
    files: [ 'src/main.ts' ],
    include: [ 'src/**/*.d.ts', `${ toRoot }/ng-prism-cache/${ prismProject }/**/*.ts` ],
  }, null, 2), options.overwrite);

  if (!getProjects(tree).has(prismProject)) {
    addProjectConfiguration(tree, prismProject, {
      root: appRoot,
      sourceRoot: joinPathFragments(appRoot, 'src'),
      projectType: 'application',
      // the workspace nx plugins (docker, web3-storage) expect that every application has a tags array
      tags: [ 'prism' ],
      targets: {
        build: {
          executor: '@angular-devkit/build-angular:application',
          options: {
            outputPath: { base: `dist/${ prismProject }`, browser: '' },
            index: joinPathFragments(appRoot, 'src/index.html'),
            browser: joinPathFragments(appRoot, 'src/main.ts'),
            tsConfig: joinPathFragments(appRoot, 'tsconfig.app.json'),
            styles: [ 'node_modules/highlight.js/styles/base16/solarized-dark.min.css' ],
            polyfills: [ 'zone.js', '@angular/localize/init' ],
            allowedCommonJsDependencies: [ 'highlight.js', 'axe-core' ],
            preserveSymlinks: true,
          },
          configurations: {
            production: { outputHashing: 'all' },
            development: { outputHashing: 'none', optimization: false, sourceMap: true },
          },
          defaultConfiguration: 'production',
        },
        serve: {
          executor: '@angular-devkit/build-angular:dev-server',
          options: {
            buildTarget: `${ prismProject }:build:development`,
            port: 4400,
            hmr: true,
            liveReload: true,
          },
        },
      },
    });
  }

}
