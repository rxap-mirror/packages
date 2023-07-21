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
import { CoerceImports } from '@rxap/schematics-ts-morph';
import { TsMorphAngularProjectTransform } from '@rxap/workspace-ts-morph';
import { join } from 'path';
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

  nxJson.targetDefaults ??= {};

  if (options.i18n) {
    nxJson.targetDefaults['i18n'] ??= {};
    nxJson.targetDefaults['i18n'].dependsOn ??= [];
    if (!nxJson.targetDefaults['i18n'].dependsOn.includes('build')) {
      nxJson.targetDefaults['i18n'].dependsOn.push('build');
    }
  }

  if (options.localazy) {
    nxJson.targetDefaults['build'] ??= {};
    nxJson.targetDefaults['build'].dependsOn ??= [];
    if (!nxJson.targetDefaults['build'].dependsOn.includes('localazy-download')) {
      nxJson.targetDefaults['build'].dependsOn.push('localazy-download');
    }
    nxJson.targetDefaults['localazy-upload'] ??= {};
    nxJson.targetDefaults['localazy-upload'].dependsOn ??= [];
    if (!nxJson.targetDefaults['localazy-upload'].dependsOn.includes('extract-i18n')) {
      nxJson.targetDefaults['localazy-upload'].dependsOn.push('extract-i18n');
    }
  }

  updateNxJson(tree, nxJson);
}

function updateGitIgnore(project: ProjectConfiguration, tree: Tree, options: InitApplicationGeneratorSchema) {

  if (options.i18n) {
    const gitIgnorePath = join(project.sourceRoot, '.gitignore');
    CoerceIgnorePattern(tree, gitIgnorePath, [
      '/i18n',
      '/build.json',
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

function updateMainFile(tree: Tree, project: ProjectConfiguration, options: InitApplicationGeneratorSchema) {
  TsMorphAngularProjectTransform(tree, {
    project: project.name,
    // directory: '..' // to move from the apps/demo/src/app folder into the apps/demo/src folder
  }, (project, [ sourceFile ]) => {

    const importDeclarations = [
      { moduleSpecifier: '@angular/platform-browser', namedImports: [ 'bootstrapApplication' ] },
      { moduleSpecifier: './app/app.component', namedImports: [ 'AppComponent' ] },
      { moduleSpecifier: './app/app.config', namedImports: [ 'appConfig' ] },
      { moduleSpecifier: './environment', namedImports: [ 'environment' ] },
    ];

    const statements: string[] = [];

    // importDeclarations.push({ moduleSpecifier: '@rxap/environment', namedImports: [ 'UpdateEnvironment' ] });
    // statements.push('await UpdateEnvironment(environment);');

    if (options.serviceWorker) {
      importDeclarations.push({ moduleSpecifier: '@rxap/service-worker', namedImports: [ 'UnregisterServiceWorker' ] });
      statements.push('UnregisterServiceWorker(environment);');
    }

    if (options.config) {
      importDeclarations.push({ moduleSpecifier: '@rxap/config', namedImports: [ 'ConfigService' ] });
      // statements.push('await ConfigService.Load({ url: `/api/configuration/${ environment.tag ?? \'latest\' }/${ environment.name }` });');
      statements.push('ConfigService.Config = {};');
    }

    if (options.openApi) {
      importDeclarations.push({ moduleSpecifier: '@rxap/open-api', namedImports: [ 'OpenApiInit' ] });
      statements.push('OpenApiInit();');
    }

    if (options.sentry) {
      importDeclarations.push({ moduleSpecifier: '@rxap/ngx-sentry', namedImports: [ 'SentryInit' ] });
      statements.push('SentryInit(environment);');
    }

    statements.push('bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));');

    CoerceImports(sourceFile, importDeclarations);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const lastStatement = i > 0 ? statements[i - 1] : null;
      const existingStatements = sourceFile.getStatements().map(s => s.getText()) ?? [];
      if (!existingStatements.includes(statement)) {
        let index: number;
        if (lastStatement) {
          index = existingStatements.indexOf(lastStatement) + 1;
        } else {
          const importDeclarations = sourceFile.getImportDeclarations();
          if (importDeclarations.length) {
            index = importDeclarations[importDeclarations.length - 1].getChildIndex() + 1;
          } else {
            index = 0;
          }
        }
        console.log(`insert statement: ${ statement } at index ${ index }`);
        sourceFile.insertStatements(index, statement);
      }
    }

  }, [ 'main.ts' ]);
}

export async function initApplicationGenerator(
  tree: Tree,
  options: InitApplicationGeneratorSchema,
) {
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
    updateMainFile(tree, project, options);

    // apply changes to the project configuration
    updateProjectConfiguration(tree, projectName, project);
  }

}

export default initApplicationGenerator;
