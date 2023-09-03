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
  TsMorphAngularProjectTransform,
  TsMorphNestProjectTransform,
} from '@rxap/workspace-ts-morph';
import {
  CoerceTarget,
  CoerceTargetDefaultsDependency,
  Strategy,
} from '@rxap/workspace-utilities';
import { join } from 'path';
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
    project.targets['docker'].options.dockerfile ??= 'shared/angular.Dockerfile';
  }

  CoerceTarget(project, 'serve', {
    options: {
      proxyConfig: 'shared/proxy.conf.json',
    },
  }, Strategy.OVERWRITE);

  project.targets['config'] ??= {
    executor: '@rxap/plugin-application:config',
    options: {},
    configurations: {
      production: {},
      development: {},
    },
  };
  if (project.targets['extract-i18n']) {
    if (options.i18n) {
      options.languages ??= [];
      if (options.languages.length === 0) {
        options.languages.push('en');
      }
      project.targets['i18n'] ??= {
        executor: '@rxap/plugin-application:i18n',
        options: {
          availableLanguages: options.languages,
          defaultLanguage: options.languages[0],
          indexHtmlTemplate: 'shared/i18n.index.html.hbs',
          assets: true,
        },
        configurations: {
          production: {},
          development: {},
        },
      };
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
      glob: '*.json',
      input: 'config/',
      output: '/',
    },
    {
      glob: '*',
      input: 'shared/assets/',
      output: '/',
    },
  ]);
  // ensure the property polyfills are defined
  project.targets['build'].options.polyfills ??= [];
  if (Array.isArray(project.targets['build'].options.polyfills)) {
    // ensure the property is an array
    project.targets['build'].options.polyfills = [];
  }
  CoerceAssets(project.targets['build'].options.polyfills, [ 'zone.js', '@angular/localize/init' ]);
  if (options.serviceWorker) {
    CoerceAssets(project.targets['build'].options.assets, [
      join(project.sourceRoot, 'manifest.webmanifest'),
    ]);
    project.targets['build'].configurations ??= {};
    project.targets['build'].configurations.production ??= {};
    project.targets['build'].configurations.production.serviceWorker = true;
    project.targets['build'].configurations.production.ngswConfigPath ??= 'shared/ngsw-config.json';
  }
}

function updateTargetDefaults(tree: Tree, options: InitApplicationGeneratorSchema) {
  const nxJson = readNxJson(tree);

  if (options.i18n) {
    CoerceTargetDefaultsDependency(nxJson, 'i18n', 'build');
  }

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
  const tags = [ 'frontend' ];

  if (options.i18n) {
    tags.push('i18n');
  }

  if (options.localazy) {
    tags.push('localazy');
  }

  CoerceProjectTags(project, tags);
}

const MAIN_BOOTSTRAP_STATEMENT = `application.bootstrap().catch((err) => console.error(err));`;
const MAIN_LOGGER_STATEMENT = `application.importProvidersFrom(LoggerModule.forRoot({
  serverLoggingUrl: '/api/logs',
  level: NgxLoggerLevel.DEBUG,
  serverLogLevel: NgxLoggerLevel.ERROR
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
          namedImports: [ 'NgxLoggerLevel', 'LoggerModule' ],
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
      statements.push('application.before(() => OpenApiInit());');
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
  console.log('angular application init generator:', options);

  // only add the shared folder if it does not exist
  if (!tree.exists('shared')) {
    generateFiles(tree, join(__dirname, 'files', 'shared'), 'shared', options);
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
    if (options.monolithic && options.overwrite) {
      generateFiles(tree, join(__dirname, 'files', 'app'), join(project.sourceRoot, 'app'), options);
    }

    // apply changes to the project configuration
    updateProjectConfiguration(tree, projectName, project);
  }

  await LocalazyGitlabCiGenerator(tree, options);

}

export default initApplicationGenerator;
