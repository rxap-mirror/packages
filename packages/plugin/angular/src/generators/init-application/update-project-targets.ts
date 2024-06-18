import { ProjectConfiguration } from '@nx/devkit';
import {
  DeleteEmptyProperties,
  unique,
} from '@rxap/utilities';
import {
  CoerceAssets,
  CoerceTarget,
  Strategy,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import { ProjectI18nConfiguration } from './project-i18n-configuration';
import { InitApplicationGeneratorSchema } from './schema';

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

export function updateProjectTargets(
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
        proxyUrl: 'https://127-0-0-1.nip.io:8443',
      },
      configurations: {
        production: {
          buildTarget: `${ projectName }:build:production`,
        },
        development: {
          buildTarget: `${ projectName }:build:development`,
        },
      },
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
