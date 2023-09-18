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
import { LocalazyGitlabCiGenerator } from '@rxap/plugin-localazy';
import {
  CoerceImports,
  CoerceVariableDeclaration,
} from '@rxap/ts-morph';
import {
  classify,
  dasherize,
} from '@rxap/utilities';
import {
  TsMorphAngularProjectTransform,
  TsMorphNestProjectTransform,
} from '@rxap/workspace-ts-morph';
import {
  AddPackageJsonDependency,
  AddPackageJsonDevDependency,
  CoerceTarget,
  CoerceTargetDefaultsDependency,
  GetProjectPrefix,
  Strategy,
} from '@rxap/workspace-utilities';
import {
  join,
  relative,
} from 'path';
import {
  SourceFile,
  WriterFunction,
  Writers,
} from 'ts-morph';
import { SkipNonAngularProject } from '../../lib/skip-project';
import { InitGeneratorSchema } from '../init/schema';
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

  CoerceTarget(project, 'config', {});
  if (project.targets['extract-i18n']) {
    if (options.i18n) {
      options.languages ??= [];
      if (options.languages.length === 0) {
        options.languages.push('en');
      }
      project.targets['build'].configurations.production.localize = options.languages;
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
    project.targets['extract-i18n'].options ??= {};
    project.targets['extract-i18n'].options.format = 'xliff2';
    project.targets['extract-i18n'].options.outputPath = join(project.sourceRoot, 'i18n');
    if (options.localazy) {
      project.targets['localazy-download'] ??= {
        executor: '@rxap/plugin-localazy:download',
        options: {
          workingDirectory: project.root,
        },
        configurations: {
          production: {},
          development: {},
        },
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
  if (Array.isArray(project.targets['build'].options.polyfills)) {
    // ensure the property is an array
    project.targets['build'].options.polyfills = [];
  }
  if (options.i18n) {
    CoerceAssets(project.targets['build'].options.polyfills, [ 'zone.js', '@angular/localize/init' ]);
  }
  if (options.serviceWorker) {
    CoerceAssets(project.targets['build'].options.assets, [
      join(project.sourceRoot, 'manifest.webmanifest'),
    ]);
    project.targets['build'].configurations ??= {};
    project.targets['build'].configurations.production ??= {};
    project.targets['build'].configurations.production.serviceWorker = true;
    project.targets['build'].configurations.production.ngswConfigPath ??= 'shared/angular/ngsw-config.json';
  }
  project.targets['build'].configurations.production ??= {};
  project.targets['build'].configurations.production.budgets ??= [];
  const budget = project.targets['build'].configurations.production.budgets.find(b => b.type === 'initial');
  if (!budget) {
    project.targets['build'].configurations.production.budgets.push({
      type: 'initial',
      maximumWarning: '2mb',
      maximumError: '5mb',
    });
  } else {
    budget.maximumWarning = '2mb';
    budget.maximumError = '5mb';
  }
}

function updateTargetDefaults(tree: Tree, options: InitApplicationGeneratorSchema) {
  const nxJson = readNxJson(tree);

  if (options.localazy) {
    CoerceTargetDefaultsDependency(nxJson, 'build', 'localazy-download');
    CoerceTargetDefaultsDependency(nxJson, 'localazy-upload', 'extract-i18n');
  }

  updateNxJson(tree, nxJson);
}

function updateGitIgnore(project: ProjectConfiguration, tree: Tree, options: InitApplicationGeneratorSchema) {

  if (options.i18n) {
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
      console.error(`Missing statement from main.ts:  ${ statement }`);
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

  let content = tree.read(join(projectSourceRoot, 'app/app.component.ts'), 'utf-8')
                    .replace('title = \'domain-product\';', '')
                    .replace('import { NxWelcomeComponent } from \'./nx-welcome.component\';', '')
                    .replace('NxWelcomeComponent, ', '');
  tree.write(join(projectSourceRoot, 'app/app.component.ts'), content);

  content = tree.read(join(projectSourceRoot, 'app/app.component.html'), 'utf-8')
                .replace(/<.+-nx-welcome><\/.+-nx-welcome> /, '');
  tree.write(join(projectSourceRoot, 'app/app.component.html'), content);

}

function updateMainFile(tree: Tree, project: ProjectConfiguration, options: InitApplicationGeneratorSchema) {
  TsMorphAngularProjectTransform(tree, {
    project: project.name,
    // directory: '..' // to move from the apps/demo/src/app folder into the apps/demo/src folder
  }, (project, [ sourceFile ]) => {

    assertMainStatements(sourceFile);

    const importDeclarations = [];
    const statements: string[] = [];

    if (options.serviceWorker) {
      importDeclarations.push({ moduleSpecifier: '@rxap/service-worker', namedImports: [ 'UnregisterServiceWorker' ] });
      statements.push('application.before(() => UnregisterServiceWorker(environment));');
    }

    if (options.openApi) {
      importDeclarations.push({ moduleSpecifier: '@rxap/open-api', namedImports: [ 'OpenApiInit' ] });
      if (options.openApiLegacy) {
        statements.push('application.before(() => OpenApiInit({ load: true }));');
      } else {
        statements.push('application.before(() => OpenApiInit());');
      }
    }

    if (options.sentry) {
      importDeclarations.push({ moduleSpecifier: '@rxap/ngx-sentry', namedImports: [ 'SentryInit' ] });
      statements.push('application.before(() => SentryInit(environment));');
    }

    CoerceImports(sourceFile, importDeclarations);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const lastStatement = i > 0 ? statements[i - 1] : null;
      const nestStatement = i < statements.length - 1 ? statements[i + 1] : null;
      const existingStatements = sourceFile.getStatements().map(s => s.getText()) ?? [];
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
  console.log('angular application init generator:', options);

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
  await AddPackageJsonDependency(tree, '@rxap/plugin-docker', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/config', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/directives', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/components', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/rxjs', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/data-grid', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/forms', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/validator', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/pipes', 'latest', { soft: true });

  if (options.material) {
    await AddPackageJsonDependency(tree, '@angular/material', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@angular/cdk', 'latest', { soft: true });
  }

  if (options.monolithic) {
    await AddPackageJsonDependency(tree, '@rxap/layout', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/services', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/data-source', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/pattern', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/definition', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/authentication', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/icon', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/material-directives', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/browser-utilities', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@angular/flex-layout', 'latest', { soft: true });
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
  }

  if (options.localazy) {
    await AddPackageJsonDevDependency(tree, '@localazy/cli', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/plugin-localazy', 'latest', { soft: true });
  }

  // only add the shared folder if it does not exist
  if (!tree.exists('shared/angular/Dockerfile')) {
    generateFiles(tree, join(__dirname, 'files', 'shared'), 'shared/angular', options);
  }

  // only add the styles folder if it does not exist
  if (!tree.exists('shared/angular/styles')) {
    generateFiles(tree, join(__dirname, 'files', 'styles'), 'shared/angular/styles', options);
  }

  for (const [ projectName, project ] of getProjects(tree).entries()) {

    if (skipProject(tree, options, project, projectName)) {
      continue;
    }

    console.log(`init project: ${ projectName }`);

    updateProjectTargets(project, options);
    updateTags(project, options);
    updateTargetDefaults(tree, options);
    updateGitIgnore(project, tree, options);
    coerceEnvironmentFiles(
      tree,
      {
        project: projectName,
        sentry: options.sentry,
        overwrite: options.overwrite,
      },
    );
    if (options.generateMain) {
      updateMainFile(tree, project, options);
    }
    if (options.cleanup) {
      cleanup(tree, project.sourceRoot);
    }
    if (options.localazy) {
      coerceLocalazyConfigFile(tree, project);
    }
    if (options.monolithic) {
      if (!tree.exists(join(project.sourceRoot, 'assets', 'logo.png'))) {
        if (tree.exists('logo.png')) {
          tree.write(join(project.sourceRoot, 'assets', 'logo.png'), tree.read('logo.png')!);
        }
      }
      if (options.overwrite) {
        generateFiles(tree, join(__dirname, 'files', 'monolithic'), project.sourceRoot, {
          ...options,
          relativePathToWorkspaceRoot: relative(project.sourceRoot, ''),
          name: projectName.replace(/^user-interface-/, ''),
          classify,
          prefix: GetProjectPrefix(tree, projectName, 'rxap'),
        });
      }
    }
    if (options.serviceWorker) {
      if (options.overwrite) {
        generateFiles(tree, join(__dirname, 'files', 'service-worker'), project.sourceRoot, {
          ...options,
          name: projectName.replace(/^user-interface-/, ''),
          classify,
          dasherize,
        });
      }
    }

    // apply changes to the project configuration
    updateProjectConfiguration(tree, projectName, project);
  }

  await LocalazyGitlabCiGenerator(tree, options);

}

export default initApplicationGenerator;
