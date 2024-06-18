import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  CoerceTarget,
  IsPublishable,
  RemoveTarget,
  Strategy,
} from '@rxap/workspace-utilities';
import { hasTailwindConfig } from './has-tailwind-config';
import { isNgPackagrProject } from './is-ng-packagr-project';
import { InitLibraryGeneratorSchema } from './schema';

export function updateProjectTargets(tree: Tree, project: ProjectConfiguration, options: InitLibraryGeneratorSchema) {

  if (IsPublishable(tree, project)) {

    CoerceTarget(project, 'check-version', {
      executor: '@rxap/plugin-library:check-version',
      options: {
        packageName: '@angular/core',
      },
    });

  }

  if (hasTailwindConfig(tree, project)) {
    CoerceTarget(project, 'build-tailwind', {
      executor: '@rxap/plugin-angular:tailwind',
      configurations: {
        production: {
          minify: true,
        },
        development: {},
      },
    });
  } else {
    if (project.targets?.['build-tailwind']) {
      delete project.targets['build-tailwind'];
    }
  }

  if (options.targets?.fixDependencies !== false) {
    CoerceTarget(project, 'fix-dependencies', {
      options: {
        options: {
          strict: true,
          onlyDependencies: false,
        },
      },
    }, Strategy.OVERWRITE);
  }

  if (isNgPackagrProject(tree, project)) {
    CoerceTarget(project, 'check-ng-package', { executor: '@rxap/plugin-angular:check-ng-package' });
  }

}
