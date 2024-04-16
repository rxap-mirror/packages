import {
  formatFiles,
  generateFiles,
  getProjects,
  ProjectConfiguration,
  readNxJson,
  Tree,
  updateNxJson,
  updateProjectConfiguration,
} from '@nx/devkit';
import {
  ApplicationInitProject,
  ApplicationInitWorkspace,
} from '@rxap/plugin-application';
import { GenerateGitlabCi } from '@rxap/plugin-gitlab-ci';
import { LocalazyGitlabCiGenerator } from '@rxap/plugin-localazy';
import {
  CoerceAppConfigProvider,
  CoerceAppRoutes,
  CoerceComponentImport,
  CoerceDefaultExport,
  CoerceImports,
  CoerceLayoutRoutes,
  CoerceVariableDeclaration,
  GetComponentDecoratorObject,
  ProviderObject,
  RemoveComponentImport,
  RemoveRoute,
} from '@rxap/ts-morph';
import {
  classify,
  CoerceArrayItems,
  dasherize,
  DeleteEmptyProperties,
  DeleteProperties,
  unique,
} from '@rxap/utilities';
import { TsMorphAngularProjectTransform } from '@rxap/workspace-ts-morph';
import {
  AddPackageJsonDependency,
  AddPackageJsonDevDependency,
  CoerceAssets,
  CoerceFilesStructure,
  CoerceIgnorePattern,
  CoerceNxJsonCacheableOperation,
  CoerceProjectTags,
  CoerceTarget,
  CoerceTargetDefaultsDependency,
  CoerceTargetDefaultsInput,
  CoerceTargetDefaultsOutput,
  GenerateSerializedSchematicFile,
  GetProjectPrefix,
  GetProjectRoot,
  GetProjectSourceRoot,
  SkipNonAngularProject,
  SkipNonApplicationProject,
  Strategy,
  UpdateTsConfigJson,
} from '@rxap/workspace-utilities';
import {
  join,
  relative,
} from 'path';
import {
  SourceFile,
  Statement,
  SyntaxKind,
  WriterFunction,
  Writers,
} from 'ts-morph';
import { coerceTestSetup } from '../../lib/coerce-test-setup';
import { InitGeneratorSchema } from '../init/schema';
import { CoerceProjects } from './coerce-project';
import { generateAuthentication } from './generate-authentication';
import { generateMonolithic } from './generate-monolithic';
import { InitApplicationGeneratorSchema } from './schema';

function skipProject(tree: Tree, options: InitGeneratorSchema, project: ProjectConfiguration, projectName: string) {

  if (SkipNonAngularProject(tree, options, project, projectName)) {
    return true;
  }

  if (SkipNonApplicationProject(tree, options, project, projectName)) {
    return true;
  }

  return false;

}

interface ProjectI18nConfiguration {
  sourceLocale?: string;
  locales?: Record<string, { translation: string, baseHref: string }>;
}

function updateProjectTargets(
  projectName: string,
  project: ProjectConfiguration & { i18n?: ProjectI18nConfiguration },
  options: InitApplicationGeneratorSchema,
) {
  project.targets ??= {};

  if (!project.targets['build']) {
    throw new Error(`The project '${ project.name }' has no build target`);
  }

  if (!options.skipDocker) {
    if (project.targets['docker']) {
      project.targets['docker'].options ??= {};
      project.targets['docker'].options.dockerfile ??= options.moduleFederation === 'remote' ?
                                                       join(project.sourceRoot!, 'Dockerfile') :
                                                       'shared/angular/Dockerfile';
    }
  }

  CoerceTarget(project, 'serve', {
    options: {
      proxyConfig: 'shared/angular/proxy.conf.json',
    },
  }, Strategy.OVERWRITE);

  if (project.targets['extract-i18n']) {
    if (options.i18n) {
      options.languages ??= [];
      if (options.languages.length === 0) {
        options.languages.push('en');
      }
      project.targets['build'].configurations ??= {};
      if (options.overwrite) {
        project.targets['build'].configurations.production.localize = options.languages;
      } else {
        project.targets['build'].configurations.production.localize ??= [];
        project.targets['build'].configurations.production.localize.push(...options.languages);
        project.targets['build'].configurations.production.localize
          = project.targets['build'].configurations.production.localize.filter(unique());
      }
      project.i18n ??= {};
      project.i18n.sourceLocale ??= 'en-US';
      project.i18n.locales ??= {};
      for (const language of options.languages) {
        project.i18n.locales[language] ??= {
          translation: `${ project.sourceRoot }/i18n/${ language }.xlf`,
          baseHref: `${ language }/`,
        };
      }
    }
    if (!project.sourceRoot) {
      throw new Error(`The project ${ project.name } has no source root`);
    }
    project.targets['extract-i18n'].options ??= {};
    project.targets['extract-i18n'].options.format = 'xliff2';
    project.targets['extract-i18n'].options.outputPath = join(project.sourceRoot, 'i18n');
    if (options.localazy) {
      project.targets['localazy-download'] ??= {
        executor: '@rxap/plugin-localazy:download',
        options: DeleteEmptyProperties({
          readKey: options.localazyReadKey,
          workingDirectory: project.root,
        }),
      };
      project.targets['localazy-upload'] ??= {
        executor: '@rxap/plugin-localazy:upload',
        options: {
          extractTarget: `${ project.name }:extract-i18n`,
        },
      };
    }
  }
  CoerceTarget(project, 'build', {
    options: {
      sourceMap: true,
    },
    configurations: {
      production: {
        fileReplacements: [
          {
            replace: `${ project.sourceRoot }/environments/environment.ts`,
            with: `${ project.sourceRoot }/environments/environment.prod.ts`,
          },
        ],
      },
    },
  }, Strategy.OVERWRITE);
  project.targets['build'].options ??= {};
  project.targets['build'].options.sourceMap = true;
  project.targets['build'].options.assets ??= [];
  project.targets['build'].options.scripts ??= [];
  if (options.moduleFederation !== 'remote') {
    if (!project.targets['build'].options.scripts.includes('node_modules/marked/marked.min.js')) {
      project.targets['build'].options.scripts.push('node_modules/marked/marked.min.js');
    }
  }
  CoerceAssets(project.targets['build'].options.assets, [
    {
      glob: '*',
      input: 'shared/angular/assets/',
      output: '.',
    },
    {
      glob: 'mdi.svg',
      input: './node_modules/@mdi/angular-material',
      output: '.',
    },
  ]);
  // ensure the property polyfills are defined
  project.targets['build'].options.polyfills ??= [];
  if (!Array.isArray(project.targets['build'].options.polyfills)) {
    // ensure the property is an array
    project.targets['build'].options.polyfills = [ 'zone.js' ];
  }
  // always add the localize init polyfill as some rxap components use the i18n directive
  CoerceAssets(project.targets['build'].options.polyfills, [ '@angular/localize/init' ]);
  if (options.serviceWorker) {
    if (!project.sourceRoot) {
      throw new Error(`The project ${ project.name } has no source root`);
    }
    CoerceAssets(project.targets['build'].options.assets, [
      join(project.sourceRoot, 'manifest.webmanifest'),
    ]);
    project.targets['build'].configurations ??= {};
    project.targets['build'].configurations.production ??= {};
    project.targets['build'].configurations.production.serviceWorker = true;
    project.targets['build'].configurations.production.ngswConfigPath ??= 'shared/angular/ngsw-config.json';
  }
  project.targets['build'].configurations ??= {};
  project.targets['build'].configurations.production ??= {};
  project.targets['build'].configurations.production.budgets ??= [];
  const budget = project.targets['build'].configurations.production.budgets.find((b: any) => b.type === 'initial');
  const defaultWarning = '2mb';
  const defaultError = '5mb';
  if (!budget) {
    project.targets['build'].configurations.production.budgets.push({
      type: 'initial',
      maximumWarning: defaultWarning,
      maximumError: defaultError,
    });
  } else {
    if (options.overwrite) {
      budget.maximumWarning = defaultWarning;
      budget.maximumError = defaultError;
    } else {
      if (compareBudget(budget.maximumWarning, defaultWarning) === -1) {
        budget.maximumWarning = defaultWarning;
      }
      if (compareBudget(budget.maximumError, defaultError) === -1) {
        budget.maximumError = defaultError;
      }
    }
  }

  if (options.incrementalBuild) {
    project.targets['build'].executor = '@nx/angular:webpack-browser';
    project.targets['build'].options.buildLibsFromSource = false;
    CoerceTarget(project, 'serve-static', {
      executor: '@nx/web:file-server',
      options: {
        proxyUrl: 'https://127-0-0-1.nip.io:8443'
      },
      configurations: {
        production: {
          buildTarget: `${projectName}:build:production`
        },
        development: {
          buildTarget: `${projectName}:build:development`
        }
      }
    });
  }

  if (options.deploy) {
    switch (options.deploy) {
      case 'web3-storage':
        if (options.i18n) {
          CoerceTarget(project, 'i18n-index-html', {});
        }
        CoerceTarget(project, 'deploy', {
          executor: '@rxap/plugin-web3-storage:deploy',
          outputs: [ 'dist/{projectRoot}/ipfs-cid.txt' ],
        }, Strategy.OVERWRITE);
        break;
    }
  }
}

/**
 * Compare two budget strings
 *
 * @param a
 * @param b
 * @returns -1 if a < b, 0 if a === b, 1 if a > b
 */
function compareBudget(a: string, b: string): -1 | 0 | 1 {
  const aUnit = a.slice(-2);
  const bUnit = b.slice(-2);
  const aNumber = Number(a.slice(0, -2));
  const bNumber = Number(b.slice(0, -2));
  if (aUnit === bUnit) {
    return aNumber < bNumber ? -1 : aNumber > bNumber ? 1 : 0;
  }
  if (aUnit === 'kb') {
    return bUnit === 'mb' ? -1 : 1;
  }
  if (aUnit === 'mb') {
    return bUnit === 'kb' ? 1 : -1;
  }
  return 0;
}

function updateTargetDefaults(tree: Tree, options: InitApplicationGeneratorSchema) {
  const nxJson = readNxJson(tree);

  if (!nxJson) {
    throw new Error('NxJson not found');
  }

  if (options.localazy) {
    CoerceTargetDefaultsDependency(nxJson, 'build', 'localazy-download');
    CoerceTargetDefaultsDependency(nxJson, 'localazy-upload', 'extract-i18n');
    CoerceTargetDefaultsInput(
      nxJson,
      'localazy-upload',
      '{projectRoot}/src/i18n/messages.xlf',
    );
    CoerceTargetDefaultsInput(
      nxJson,
      'localazy-download',
      { runtime: 'date' },
      { env: 'CI_COMMIT_TIMESTAMP' },
      { env: 'CI_COMMIT_SHA' },
      { env: 'CI_JOB_ID' },
      { env: 'CI_PIPELINE_ID' },
    );
    CoerceTargetDefaultsOutput(
      nxJson,
      'localazy-download',
      '{projectRoot}/src/i18n',
    );
  }

  CoerceTargetDefaultsDependency(nxJson, 'build', '^generate-open-api');
  CoerceTargetDefaultsDependency(nxJson, 'serve', '^generate-open-api');

  CoerceNxJsonCacheableOperation(nxJson, 'localazy-download', 'localazy-upload', 'extract-i18n', 'i18n-index-html');

  CoerceTargetDefaultsInput(nxJson, 'deploy', '{workspaceRoot}/dist/{projectRoot}');
  CoerceTargetDefaultsDependency(nxJson, 'deploy', 'i18n-index-html');
  CoerceTarget(nxJson, 'i18n-index-html', {
    dependsOn: [ 'build' ],
    executor: '@rxap/plugin-application:i18n',
    outputs: [ 'dist/{projectRoot}/index.html' ],
    inputs: [ '{workspaceRoot}/{projectRoot}/project.json' ],
  });

  updateNxJson(tree, nxJson);
}

function updateGitIgnore(project: ProjectConfiguration, tree: Tree, options: InitApplicationGeneratorSchema) {

  if (options.i18n) {

    if (!project.sourceRoot) {
      throw new Error(`The project ${ project.name } has no source root`);
    }

    const gitIgnorePath = join(project.sourceRoot, '.gitignore');
    CoerceIgnorePattern(tree, gitIgnorePath, [
      '/i18n',
    ]);
  }

}

function updateTags(project: ProjectConfiguration, options: InitApplicationGeneratorSchema) {
  const tags = [ 'frontend', 'user-interface' ];

  if (options.i18n) {
    tags.push('i18n');
  }

  if (options.localazy) {
    tags.push('localazy');
  }

  if (options.serviceWorker) {
    tags.push('service-worker');
  }

  if (options.sentry) {
    tags.push('sentry');
  }

  if (options.moduleFederation) {
    tags.push('module-federation');
    tags.push(`mfe:${ options.moduleFederation }`);
  }

  CoerceProjectTags(project, tags);
}

const MAIN_BOOTSTRAP_STATEMENT = `application.bootstrap().catch((err) => console.error(err));`;
const MAIN_LOGGER_STATEMENT = `application.importProvidersFrom(LoggerModule.forRoot({
  serverLoggingUrl: '/api/logs',
  level: NgxLoggerLevel.DEBUG,
  serverLogLevel: NgxLoggerLevel.ERROR,
}));`;
const MAIN_APP_CREATION_STATEMENT = `const application = new StandaloneApplication(
  environment,
  AppComponent,
  appConfig,
);`;
const REMOTE_MAIN_APP_CREATION_STATEMENT = `const application = new StandaloneApplication(
  environment,
  RemoteEntryComponent,
  appConfig,
);`;

function assertMainStatements(sourceFile: SourceFile, options: InitApplicationGeneratorSchema) {
  const statements: string[] = [];

  statements.push('const application = new StandaloneApplication(');
  statements.push('application.importProvidersFrom(LoggerModule.forRoot({');
  const existingStatements = sourceFile.getStatements().map(s => s.getText()) ?? [];
  for (const statement of statements) {
    if (!existingStatements.includes(statement)) {
      console.error(`Missing statement from angular main.ts:  ${ statement }`);
      sourceFile.set({
        statements: [
          options.moduleFederation === 'remote' ? REMOTE_MAIN_APP_CREATION_STATEMENT : MAIN_APP_CREATION_STATEMENT,
          MAIN_LOGGER_STATEMENT,
          MAIN_BOOTSTRAP_STATEMENT,
        ],
      });
      CoerceImports(sourceFile, [
        {
          moduleSpecifier: './app/app.config',
          namedImports: [ 'appConfig' ],
        },
        {
          moduleSpecifier: './environments/environment',
          namedImports: [ 'environment' ],
        },
        {
          moduleSpecifier: 'ngx-logger',
          namedImports: [ 'LoggerModule', 'NgxLoggerLevel' ],
        },
        {
          moduleSpecifier: '@rxap/ngx-bootstrap',
          namedImports: [ 'StandaloneApplication' ],
        },
      ]);
      if (options.moduleFederation === 'remote') {
        CoerceImports(sourceFile, [
          {
            moduleSpecifier: './app/remote-entry/entry.component',
            namedImports: [ 'RemoteEntryComponent' ],
          },
        ]);
      } else {
        CoerceImports(sourceFile, [
          {
            moduleSpecifier: './app/app.component',
            namedImports: [ 'AppComponent' ],
          },
        ]);
      }
      return;
    }
  }
}

function cleanup(tree: Tree, projectName: string, options: InitApplicationGeneratorSchema) {

  const sourceRoot = GetProjectSourceRoot(tree, projectName);

  const deleteFiles = [
    'app/app.component.spec.ts',
    'app/nx-welcome.component.ts',
    'app/remote-entry/nx-welcome.component.ts',
    'app/nx-welcome.component.cy.ts',
  ];

  for (const file of deleteFiles) {
    if (tree.exists(join(sourceRoot, file))) {
      tree.delete(join(sourceRoot, file));
    }
  }

  if (tree.exists(join(sourceRoot, 'app/app.component.html'))) {
    const content = tree.read(join(sourceRoot, 'app/app.component.html'), 'utf-8')!
      .replace(/<.+-nx-welcome><\/.+-nx-welcome> /, '')
      .replace(/<ul class="remote-menu">[\s\S]*<\/ul>/, '');
    tree.write(join(sourceRoot, 'app/app.component.html'), content);
  }

  if (options.moduleFederation !== 'remote') {

    TsMorphAngularProjectTransform(tree, {
      project: projectName,
    }, (_, [ appRoutes, appComponent ]) => {
      RemoveRoute(appRoutes, {
        component: 'NxWelcomeComponent',
        name: 'appRoutes'
      });
      appRoutes.getImportDeclaration('./nx-welcome.component')?.remove();
      appComponent.getClass('AppComponent')?.getProperty('title')?.remove();
      RemoveComponentImport(appComponent, 'NxWelcomeComponent');
    }, [ 'app/app.routes.ts', 'app/app.component.ts' ]);

  }

  if (options.moduleFederation === 'remote') {

    // region module-federation config
    const projectRoot = GetProjectRoot(tree, projectName);
    let content = tree.read(join(projectRoot, 'module-federation.config.js'), 'utf-8')!;
    content = content.replace('./Routes', './routes');
    tree.write(join(projectRoot, 'module-federation.config.js'), content);
    // endregion

    // region tsconfig.base.json
    UpdateTsConfigJson(tree, tsConfig => {
      tsConfig.compilerOptions ??= {};
      tsConfig.compilerOptions.paths ??= {};
      if (tsConfig.compilerOptions.paths[`${projectName}/Routes`]) {
        delete tsConfig.compilerOptions.paths[`${projectName}/Routes`];
      }
    }, { infix: 'base' });
    // endregion

    TsMorphAngularProjectTransform(tree, {
      project: projectName,
    }, (_, [ entryRoutes ]) => {
      CoerceDefaultExport(entryRoutes.getVariableStatement('remoteRoutes')!.getDeclarations()[0]);
    }, [
      'app/remote-entry/entry.routes.ts',
    ]);
    if (tree.exists(join(sourceRoot, 'app/remote-entry/entry.component.ts'))) {
      TsMorphAngularProjectTransform(tree, {
        project: projectName,
      }, (_, [ entryComponent ]) => {
        entryComponent.getImportDeclaration('./nx-welcome.component')?.remove();
        RemoveComponentImport(entryComponent, 'NxWelcomeComponent');
        RemoveComponentImport(entryComponent, 'CommonModule');
        const componentOptions = GetComponentDecoratorObject(entryComponent);
        const templateProp = componentOptions.getProperty('template');
        if (templateProp && templateProp.asKindOrThrow(SyntaxKind.PropertyAssignment).getInitializer()?.getText().match(
          /<.+nx-welcome><\/.+nx-welcome>/)) {
          templateProp.remove();
          componentOptions.addPropertyAssignment({
            name: 'template',
            initializer: w => w.quote('<router-outlet></router-outlet>'),
          });
          CoerceComponentImport(entryComponent, {
            name: 'RouterModule',
            moduleSpecifier: '@angular/router'
          });
        }
      }, [
        'app/remote-entry/entry.component.ts',
      ]);
    }
    if (options.host) {
      TsMorphAngularProjectTransform(tree, {
        project: options.host,
      }, (_, [ appRoutes ]) => {
        RemoveRoute(appRoutes, {
          loadRemoteModule: {
            name: projectName,
            entry: './Routes',
          },
          name: 'appRoutes'
        });
        appRoutes.organizeImports();
      }, [ 'app/app.routes.ts' ]);
    }
  }

}

function updateMainFile(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitApplicationGeneratorSchema) {
  TsMorphAngularProjectTransform(tree, {
    project: projectName,
    // directory: '..' // to move from the apps/demo/src/app folder into the apps/demo/src folder
  }, (project, [ sourceFile, mainSourceFile ]) => {

    assertMainStatements(sourceFile, options);

    const importDeclarations = [];
    const statements: string[] = [];

    if (options.serviceWorker) {
      importDeclarations.push({
        moduleSpecifier: '@rxap/service-worker',
        namedImports: [ 'UnregisterServiceWorker' ],
      });
      statements.push('application.before(() => UnregisterServiceWorker(environment));');
    }

    if (options.openApi) {
      importDeclarations.push({
        moduleSpecifier: '@rxap/open-api',
        namedImports: [ 'OpenApiInit' ],
      });
      if (options.openApiLegacy) {
        statements.push('application.before(() => OpenApiInit(environment, { load: true }));');
      } else {
        statements.push('application.before(() => OpenApiInit(environment));');
      }
    }

    if (options.sentry) {
      importDeclarations.push({
        moduleSpecifier: '@rxap/ngx-sentry',
        namedImports: [ 'SentryInit' ],
      });
      statements.push('application.before(() => SentryInit(environment));');
    }

    CoerceImports(sourceFile, importDeclarations);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const lastStatement = i > 0 ? statements[i - 1] : null;
      const nestStatement = i < statements.length - 1 ? statements[i + 1] : null;
      const existingStatements: string[] = sourceFile.getStatements().map((s: Statement) => s.getText()) ?? [];
      if (!existingStatements.includes(statement)) {
        let index: number;
        if (lastStatement) {
          index = existingStatements.findIndex(s => s.includes(lastStatement)) + 1;
        } else if (nestStatement) {
          index = existingStatements.findIndex(s => s.includes(nestStatement));
        } else {
          index = existingStatements.findIndex(s => s.includes(MAIN_BOOTSTRAP_STATEMENT));
        }
        console.log(`insert statement: ${ statement } at index ${ index }`);
        sourceFile.insertStatements(index, statement);
      }
    }

    if (options.moduleFederation === 'host') {
      mainSourceFile.set({
        statements: [
          `import {
  setRemoteDefinitions,
  setRemoteUrlResolver
} from '@nx/angular/mf';
import type { Environment } from '@rxap/environment';
import { environment } from './environments/environment';

export async function SetupDynamicMfe(environment: Environment) {

  const manifest = environment.moduleFederation?.manifest;

  if (!manifest) {
    const release = environment.tag || environment.branch || 'latest';
    setRemoteUrlResolver((remoteName: string) => \`\${ location.origin }/__mfe/\${ release }/\${ remoteName }\`);
  } else {

    let definitions: Record<string, string>;

    if (typeof manifest === 'object') {
      definitions = manifest;
    } else {
      definitions = await fetch(manifest).then((res) => res.json());
    }

    setRemoteDefinitions(definitions);

  }

}

SetupDynamicMfe(environment).then(() => import('./bootstrap').catch((err) => console.error(err)));
`,
        ]
      });
    }

  }, [
    options.moduleFederation ? 'bootstrap.ts' : 'main.ts',
    'main.ts'
  ]);
}

function coerceEnvironmentFiles(tree: Tree, options: InitApplicationGeneratorSchema & { project: string }) {

  TsMorphAngularProjectTransform(
    tree,
    {
      project: options.project,
    },
    (project, [ sourceFile, prodSourceFile ]) => {

      CoerceImports(sourceFile, {
        moduleSpecifier: '@rxap/environment',
        namedImports: [ 'Environment' ],
      });
      CoerceImports(prodSourceFile, {
        moduleSpecifier: '@rxap/environment',
        namedImports: [ 'Environment' ],
      });

      const baseEnvironment: Record<string, WriterFunction | string> = {
        name: w => w.quote('development'),
        production: 'false',
        app: w => w.quote(options.project),
      };

      // region dev environment

      if (options.serviceWorker) {
        baseEnvironment['serviceWorker'] = 'false';
      }

      if (options.sentry) {
        baseEnvironment['sentry'] = Writers.object({
          enabled: 'false',
          debug: 'false',
        });
      }

      if (options.moduleFederation === 'host') {
        baseEnvironment['moduleFederation'] = Writers.object({
          manifest: w => w.quote('/assets/module-federation.manifest.json'),
        });
      }

      const normal = CoerceVariableDeclaration(sourceFile, 'environment', {
        type: 'Environment',
        initializer: Writers.object(baseEnvironment),
      });

      if (options.overwrite) {
        normal.set({ initializer: Writers.object(baseEnvironment) });
      }

      // region

      // region prod environment

      if (options.moduleFederation === 'host') {
        delete baseEnvironment['moduleFederation'];
      }

      if (options.serviceWorker) {
        baseEnvironment['serviceWorker'] = 'true';
      }

      if (options.sentry) {
        baseEnvironment['sentry'] = Writers.object({
          enabled: 'true',
          debug: 'false',
        });
      }

      baseEnvironment['name'] = w => w.quote('production');
      baseEnvironment['production'] = 'true';

      const prod = CoerceVariableDeclaration(prodSourceFile, 'environment', {
        type: 'Environment',
        initializer: Writers.object(baseEnvironment),
      });

      if (options.overwrite) {
        prod.set({ initializer: Writers.object(baseEnvironment) });
      }

      // endregion

    },
    [
      '/environments/environment.ts?',
      '/environments/environment.prod.ts?',
    ],
  );

}

function coerceLocalazyConfigFile(tree: Tree, project: ProjectConfiguration) {
  const projectRoot = project.root;
  const localazyConfigPath = join(projectRoot, 'localazy.json');
  if (!tree.exists(localazyConfigPath)) {
    tree.write(localazyConfigPath, JSON.stringify({
      upload: {
        type: 'xliff',
        deprecate: 'file',
        features: [
          'use_defined_lang_for_source',
          'dont_parse_target',
        ],
        files: 'src/i18n/messages.xlf',
      },
      download: {
        files: 'src/i18n/${languageCode}.xlf',
      },
    }, null, 2));
  }
}

function updateTsConfig(tree: Tree, projectName: string) {

  const projectRoot = GetProjectRoot(tree, projectName);
  for (const tsConfigName of [ 'app', 'editor', 'spec' ]) {
    UpdateTsConfigJson(tree, tsConfig => {
      tsConfig.compilerOptions ??= {};
      tsConfig.compilerOptions.types ??= [];
      if (!tsConfig.compilerOptions.types.includes('@angular/localize')) {
        tsConfig.compilerOptions.types.push('@angular/localize');
      }
      if ([ 'app', 'spec' ].includes(tsConfigName)) {
        tsConfig.exclude ??= [];
        CoerceArrayItems(tsConfig.exclude, [
          'src/**/*.stories.ts',
          'src/**/*.cy.ts',
        ]);
      }
    }, { infix: tsConfigName, basePath: projectRoot });
  }

}

function linkMfeRemoteWithHost(tree: Tree, projectName: string, options: InitApplicationGeneratorSchema) {

  if (!options.host) {
    throw new Error('The host project must be defined');
  }

  const hostSourceRoot = GetProjectSourceRoot(tree, options.host);
  const isHostMonolithic = tree.exists(join(hostSourceRoot, 'app/layout.routes.ts'));

  const path = projectName.replace('user-interface-', '').replace('feature-', '');

  if (isHostMonolithic && !options.standaloneImport) {
    TsMorphAngularProjectTransform(tree, {
      project: options.host,
    }, (project, [ layoutSourceFile ]) => {
      CoerceLayoutRoutes(layoutSourceFile, {
        itemList: [
          {
            route: {
              path,
              loadRemoteModule: projectName
            },
            component: 'LayoutComponent'
          }
        ]
      });
    }, [ 'app/layout.routes.ts' ]);
  } else {
    TsMorphAngularProjectTransform(tree, {
      project: options.host,
    }, (project, [ appRoutes ]) => {
      CoerceAppRoutes(appRoutes, {
        itemList: [
          {
            route: {
              path,
              loadRemoteModule: projectName
            },
          },
        ],
      });
    }, [ 'app/app.routes.ts' ]);
  }

}

export async function initApplicationGenerator(
  tree: Tree,
  options: InitApplicationGeneratorSchema,
) {
  if (options.authentik) {
    options.oauth = true;
  }
  if (options.monolithic) {
    options.openApi = true;
  }
  if (options.i18n) {
    options.languages ??= ['en'];
  }
  if (options.project) {
    options.projects ??= [];
    CoerceArrayItems(options.projects, [options.project]);
  }
  if (options.host) {
    options.moduleFederation = 'remote';
  }
  if (options.moduleFederation === 'remote') {
    options.authentication = false;
    options.oauth = false;
    options.authentik = false;
    options.serviceWorker = false;
    options.sentry = false;
    options.monolithic = false;
  }
  console.log('angular application init generator:', options);

  await ApplicationInitWorkspace(tree, options);

  await AddPackageJsonDependency(tree, '@mdi/angular-material', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/ngx-bootstrap', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, 'ngx-logger', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/environment', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/ngx-status-check', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/ngx-error', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/ngx-localize', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/ngx-changelog', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, 'ngx-markdown', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, 'marked', '4.3.0', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/config', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/directives', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/components', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/rxjs', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/data-grid', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/forms', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/validator', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/pipes', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/mixin', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/reflect-metadata', 'latest', { soft: true });
  await AddPackageJsonDevDependency(tree, '@rxap/browser-tailwind', 'latest', { soft: true, withoutNonRxapPeerDependencies: false });
  const angularVersion = '~16.2.0';
  // must always be added as some rxap components use the i18n tag
  await AddPackageJsonDependency(tree, '@angular/localize', angularVersion, { soft: true });
  // must always be added as some rxap components use interfaces from the package
  // TODO : refactor the @rxap/ngx-error and @rxap/ngx-status-check to be independent from the @sentry/angular-ivy package
  await AddPackageJsonDependency(tree, '@sentry/angular-ivy', 'latest', { soft: true });

  if (options.oauth) {
    await AddPackageJsonDependency(tree, 'angular-oauth2-oidc', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, 'angular-oauth2-oidc-jwks', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/oauth', 'latest', { soft: true });
  }

  if (options.material) {
    await AddPackageJsonDependency(tree, '@angular/material', angularVersion, { soft: true });
    await AddPackageJsonDependency(tree, '@angular/cdk', angularVersion, { soft: true });
  }

  if (options.serviceWorker) {
    await AddPackageJsonDependency(tree, '@rxap/service-worker', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@angular/service-worker', angularVersion, { soft: true });
  }

  if (options.monolithic) {
    await AddPackageJsonDependency(tree, '@rxap/layout', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/ngx-theme', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@ctrl/tinycolor', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/ngx-pub-sub', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/services', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/data-source', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/pattern', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/definition', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/authentication', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/icon', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/material-directives', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/browser-utilities', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/authorization', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/ngx-user', 'latest', { soft: true });
  }

  if (options.openApi) {
    await AddPackageJsonDependency(tree, '@rxap/open-api', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/remote-method', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/definition', 'latest', { soft: true });
  }

  if (options.sentry) {
    await AddPackageJsonDependency(tree, '@rxap/ngx-sentry', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@sentry/browser', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@sentry/integrations', 'latest', { soft: true });
  }

  if (options.i18n) {
    await AddPackageJsonDependency(tree, '@rxap/ngx-localize', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/ngx-user', 'latest', { soft: true });
  }

  if (options.localazy) {
    await AddPackageJsonDevDependency(tree, '@localazy/cli', 'latest', { soft: true });
    await AddPackageJsonDevDependency(tree, '@rxap/plugin-localazy', 'latest', { soft: true });
  }

  if (options.deploy === 'web3-storage') {
    await AddPackageJsonDevDependency(tree, '@rxap/plugin-web3-storage', 'latest', { soft: true });
  }

  if (options.i18n && options.deploy === 'web3-storage') {
    CoerceFilesStructure(tree, {
      srcFolder: join(__dirname, 'files', 'i18n'),
      target: 'shared/angular',
      overwrite: options.overwrite,
    });
  }

  CoerceFilesStructure(tree, {
    srcFolder: join(__dirname, 'files', 'shared'),
    target: 'shared/angular',
    overwrite: options.overwrite,
  });

  if (!tree.exists('shared/angular/assets/custom.svg')) {
    tree.write('shared/angular/assets/custom.svg', '<svg></svg>');
  }

  if (options.i18n && !options.skipDocker) {
    let dockerfileContent = tree.read('shared/angular/Dockerfile', 'utf-8')!;
    dockerfileContent = dockerfileContent.replace('registry.gitlab.com/rxap/docker/nginx:', 'registry.gitlab.com/rxap/docker/i18n-nginx:');
    tree.write('shared/angular/Dockerfile', dockerfileContent);
  }

  CoerceFilesStructure(tree, {
    srcFolder: join(__dirname, 'files', 'styles'),
    target: 'shared/angular/styles',
    overwrite: options.overwrite,
  });

  if (options.oauth) {
    CoerceFilesStructure(tree, {
      srcFolder: join(__dirname, 'files', 'oauth'),
      target: 'shared/angular/assets',
      overwrite: options.overwrite,
    });
  }

  updateTargetDefaults(tree, options);

  await CoerceProjects(tree, options);

  if (!options.skipProjects) {
    for (const [ projectName, project ] of getProjects(tree).entries()) {

      if (skipProject(tree, options, project, projectName)) {
        continue;
      }

      GenerateSerializedSchematicFile(
        tree,
        GetProjectRoot(tree, projectName),
        '@rxap/plugin-angular',
        'init-application',
        DeleteProperties(options, [ 'project', 'projects', 'overwrite', 'skipProjects' ]),
      );

      console.log(`init angular application project: ${ projectName }`);

      const sourceRoot = GetProjectSourceRoot(tree, projectName);

      ApplicationInitProject(tree, projectName, project, options);

      if (options.overwrite || !tree.read(join(sourceRoot, 'styles.scss'), 'utf-8')?.match(/@use ".+\/shared\/angular\/styles";/)) {
        generateFiles(tree, join(__dirname, 'files', 'root'), sourceRoot, {
          serviceWorker: false,
          ...options,
          relativePathToWorkspaceRoot: relative(sourceRoot, ''),
          name: projectName.replace(/^user-interface-/, ''),
          classify,
          prefix: GetProjectPrefix(tree, projectName, 'rxap'),
        });
      }

      updateProjectTargets(projectName, project, options);
      updateTags(project, options);
      updateGitIgnore(project, tree, options);
      updateTsConfig(tree, projectName);

      if (options.cleanup || options.coerce) {
        cleanup(tree, projectName, options);
      }

      coerceEnvironmentFiles(
        tree,
        {
          ...options,
          project: projectName,
        },
      );

      TsMorphAngularProjectTransform(tree, {
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
          importProvidersFrom.push('MarkdownModule.forRoot()');
          CoerceImports(sourceFile, [
            {
              moduleSpecifier: '@rxap/ngx-changelog',
              namedImports: [ 'ProvideChangelog' ],
            },
            {
              moduleSpecifier: 'ngx-markdown',
              namedImports: [ 'MarkdownModule' ],
            },
            {
              moduleSpecifier: '@rxap/ngx-pub-sub',
              namedImports: [ 'ProvidePubSub' ],
            },
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
        CoerceAppConfigProvider(sourceFile, {
          overwrite: options.overwrite,
          providers,
          httpInterceptors,
          importProvidersFrom,
        });
      }, [ '/app/app.config.ts' ]);

      if (options.generateMain) {
        updateMainFile(tree, projectName, project, options);
      }
      if (options.localazy) {
        coerceLocalazyConfigFile(tree, project);
      }
      if (options.authentication) {
        await generateAuthentication(tree, projectName, project, options);
      }
      if (options.monolithic) {
        generateMonolithic(tree, projectName, project, options);
      }
      if (options.moduleFederation === 'remote') {
        if (options.overwrite) {
          generateFiles(tree, join(__dirname, 'files', 'mfe-remote'), sourceRoot, {
            ...options,
            relativePathToWorkspaceRoot: relative(sourceRoot, ''),
            name: projectName
              .replace(/^user-interface-/, '')
              .replace(/^feature-/, ''),
            classify,
            dasherize,
            prefix: GetProjectPrefix(tree, projectName, 'rxap'),
          });
        }
        if (options.host) {
          linkMfeRemoteWithHost(tree, projectName, options);
        }
      }
      if (options.serviceWorker) {
        if (options.overwrite || !tree.exists(join(sourceRoot, 'manifest.webmanifest'))) {
          generateFiles(tree, join(__dirname, 'files', 'service-worker'), sourceRoot, {
            ...options,
            name: projectName.replace(/^user-interface-/, ''),
            classify,
            dasherize,
          });
        }
      }

      CoerceFilesStructure(tree, {
        srcFolder: join(__dirname, 'files', 'assets'),
        target: join(sourceRoot, 'assets'),
        overwrite: options.overwrite,
      });
      coerceTestSetup(tree, projectName);

      // apply changes to the project configuration
      updateProjectConfiguration(tree, projectName, project);
    }
  }

  if (options.localazy) {
    await LocalazyGitlabCiGenerator(tree, {});
  }
  GenerateGitlabCi(tree, {});

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

}

export default initApplicationGenerator;
