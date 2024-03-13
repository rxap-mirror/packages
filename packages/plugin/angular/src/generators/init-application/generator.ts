import {
  generateFiles,
  getProjects,
  ProjectConfiguration,
  readNxJson,
  Tree,
  updateNxJson,
  updateProjectConfiguration,
} from '@nx/devkit';
import {
  CoerceAssets,
  CoerceIgnorePattern,
  CoerceProjectTags,
  SkipNonApplicationProject,
} from '@rxap/generator-utilities';
import {
  ApplicationInitProject,
  ApplicationInitWorkspace,
} from '@rxap/plugin-application';
import { DockerGitlabCiGenerator } from '@rxap/plugin-docker';
import { LocalazyGitlabCiGenerator } from '@rxap/plugin-localazy';
import {
  CoerceAppConfigProvider,
  CoerceImports,
  CoerceVariableDeclaration,
  ProviderObject,
} from '@rxap/ts-morph';
import {
  classify,
  dasherize,
  DeleteEmptyProperties,
  unique,
} from '@rxap/utilities';
import {
  TsMorphAngularProjectTransform,
  TsMorphNestProjectTransform,
} from '@rxap/workspace-ts-morph';
import {
  AddPackageJsonDependency,
  AddPackageJsonDevDependency,
  CoerceFilesStructure,
  CoerceNxJsonCacheableOperation,
  CoerceTarget,
  CoerceTargetDefaultsDependency,
  CoerceTargetDefaultsInput,
  CoerceTargetDefaultsOutput,
  Strategy,
  UpdateJsonFile,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import {
  SourceFile,
  Statement,
  WriterFunction,
  Writers,
} from 'ts-morph';
import { SkipNonAngularProject } from '../../lib/skip-project';
import { InitGeneratorSchema } from '../init/schema';
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
  project: ProjectConfiguration & { i18n?: ProjectI18nConfiguration },
  options: InitApplicationGeneratorSchema,
) {
  project.targets ??= {};

  if (!project.targets['build']) {
    throw new Error(`The project '${ project.name }' has no build target`);
  }

  if (project.targets['docker']) {
    project.targets['docker'].options ??= {};
    project.targets['docker'].options.dockerfile ??= 'shared/angular/Dockerfile';
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
  if (!project.targets['build'].options.scripts.includes('node_modules/marked/marked.min.js')) {
    project.targets['build'].options.scripts.push('node_modules/marked/marked.min.js');
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

function assertMainStatements(sourceFile: SourceFile) {
  const statements: string[] = [];

  statements.push('const application = new StandaloneApplication(');
  statements.push('application.importProvidersFrom(LoggerModule.forRoot({');
  const existingStatements = sourceFile.getStatements().map(s => s.getText()) ?? [];
  for (const statement of statements) {
    if (!existingStatements.includes(statement)) {
      console.error(`Missing statement from angular main.ts:  ${ statement }`);
      sourceFile.set({
        statements: [
          MAIN_APP_CREATION_STATEMENT,
          MAIN_LOGGER_STATEMENT,
          MAIN_BOOTSTRAP_STATEMENT,
        ],
      });
      CoerceImports(sourceFile, [
        {
          moduleSpecifier: './app/app.component',
          namedImports: [ 'AppComponent' ],
        },
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
      return;
    }
  }
}

function cleanup(tree: Tree, projectSourceRoot: string) {

  const deleteFiles = [
    'app/app.component.spec.ts',
    'app/nx-welcome.component.ts',
    'app/nx-welcome.component.cy.ts',
  ];

  for (const file of deleteFiles) {
    if (tree.exists(join(projectSourceRoot, file))) {
      tree.delete(join(projectSourceRoot, file));
    }
  }

  let content = tree.read(join(projectSourceRoot, 'app/app.component.ts'), 'utf-8')!
    .replace('title = \'domain-product\';', '')
    .replace('import { NxWelcomeComponent } from \'./nx-welcome.component\';', '')
    .replace('NxWelcomeComponent, ', '');
  tree.write(join(projectSourceRoot, 'app/app.component.ts'), content);

  content = tree.read(join(projectSourceRoot, 'app/app.component.html'), 'utf-8')!
    .replace(/<.+-nx-welcome><\/.+-nx-welcome> /, '');
  tree.write(join(projectSourceRoot, 'app/app.component.html'), content);

}

function updateMainFile(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitApplicationGeneratorSchema) {
  TsMorphAngularProjectTransform(tree, {
    project: projectName,
    // directory: '..' // to move from the apps/demo/src/app folder into the apps/demo/src folder
  }, (project, [ sourceFile ]) => {

    assertMainStatements(sourceFile);

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

  }, [ 'main.ts' ]);
}

function coerceEnvironmentFiles(tree: Tree, options: { project: string, sentry: boolean, overwrite: boolean }) {

  TsMorphNestProjectTransform(
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
        serviceWorker: 'false',
      };

      if (options.sentry) {
        baseEnvironment['sentry'] = Writers.object({
          enabled: 'false',
          debug: 'false',
        });
      }

      const normal = CoerceVariableDeclaration(sourceFile, 'environment', {
        type: 'Environment',
        initializer: Writers.object(baseEnvironment),
      });

      if (options.overwrite) {
        normal.set({ initializer: Writers.object(baseEnvironment) });
      }

      baseEnvironment['name'] = w => w.quote('production');
      baseEnvironment['production'] = 'true';
      baseEnvironment['serviceWorker'] = 'true';

      if (options.sentry) {
        baseEnvironment['sentry'] = Writers.object({
          enabled: 'true',
          debug: 'false',
        });
      }

      const prod = CoerceVariableDeclaration(prodSourceFile, 'environment', {
        type: 'Environment',
        initializer: Writers.object(baseEnvironment),
      });

      if (options.overwrite) {
        prod.set({ initializer: Writers.object(baseEnvironment) });
      }

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

async function updateTsConfig(tree: Tree, project: ProjectConfiguration, options: InitApplicationGeneratorSchema) {

  const projectRoot = project.root;

  if (options.i18n) {
    for (const tsConfigName of [ 'app', 'editor', 'spec' ]) {
      await UpdateJsonFile(tree, tsConfig => {
        tsConfig.compilerOptions ??= {};
        tsConfig.compilerOptions.types ??= [];
        if (!tsConfig.compilerOptions.types.includes('@angular/localize')) {
          tsConfig.compilerOptions.types.push('@angular/localize');
        }
      }, join(projectRoot, `tsconfig.${ tsConfigName }.json`));
    }
  }

}

export async function initApplicationGenerator(
  tree: Tree,
  options: InitApplicationGeneratorSchema,
) {
  options.sentry ??= true;
  options.openApi ??= false;
  options.config ??= true;
  options.localazy ??= false;
  options.i18n ??= false;
  options.serviceWorker ??= false;
  options.languages ??= options.i18n ? [ 'en' ] : [];
  options.material ??= true;
  options.generateMain ??= false;
  options.overwrite ??= false;
  options.monolithic ??= false;
  options.openApi = options.openApi || options.monolithic;
  options.authentik ??= false;
  options.oauth ??= false;
  options.oauth = options.oauth || options.authentik;
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

  if (options.oauth) {
    await AddPackageJsonDependency(tree, 'angular-oauth2-oidc', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, 'angular-oauth2-oidc-jwks', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/oauth', 'latest', { soft: true });
  }

  if (options.material) {
    await AddPackageJsonDependency(tree, '@angular/material', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@angular/cdk', 'latest', { soft: true });
  }

  if (options.serviceWorker) {
    await AddPackageJsonDependency(tree, '@rxap/service-worker', 'latest', { soft: true });
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
    await AddPackageJsonDependency(tree, '@sentry/angular-ivy', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@sentry/browser', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@sentry/integrations', 'latest', { soft: true });
  }

  if (options.i18n) {
    await AddPackageJsonDependency(tree, '@angular/localize', 'latest', { soft: true });
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

  if (!options.skipProjects) {
    for (const [ projectName, project ] of getProjects(tree).entries()) {

      if (skipProject(tree, options, project, projectName)) {
        continue;
      }

      console.log(`init angular application project: ${ projectName }`);

      ApplicationInitProject(tree, projectName, project, options);

      updateProjectTargets(project, options);
      updateTags(project, options);
      updateGitIgnore(project, tree, options);
      await updateTsConfig(tree, project, options);
      coerceEnvironmentFiles(
        tree,
        {
          project: projectName,
          sentry: options.sentry,
          overwrite: options.overwrite,
        },
      );
      TsMorphNestProjectTransform(tree, {
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
      if (!project.sourceRoot) {
        throw new Error(`Project source root not found for project ${ projectName }`);
      }
      if (options.cleanup) {
        cleanup(tree, project.sourceRoot);
      }
      if (options.localazy) {
        coerceLocalazyConfigFile(tree, project);
      }
      if (options.monolithic) {
        generateMonolithic(tree, projectName, project, options);
      }
      if (options.serviceWorker) {
        if (options.overwrite || !tree.exists(join(project.sourceRoot, 'manifest.webmanifest'))) {
          generateFiles(tree, join(__dirname, 'files', 'service-worker'), project.sourceRoot, {
            ...options,
            name: projectName.replace(/^user-interface-/, ''),
            classify,
            dasherize,
          });
        }
      }
      CoerceFilesStructure(tree, {
        srcFolder: join(__dirname, 'files', 'assets'),
        target: join(project.sourceRoot, 'assets'),
        overwrite: options.overwrite,
      });

      // apply changes to the project configuration
      updateProjectConfiguration(tree, projectName, project);
    }
  }

  await LocalazyGitlabCiGenerator(tree, {});
  await DockerGitlabCiGenerator(tree, {});

}

export default initApplicationGenerator;
