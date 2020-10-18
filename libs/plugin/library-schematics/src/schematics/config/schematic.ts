import {
  apply,
  chain,
  mergeWith,
  move,
  Rule,
  url,
  Tree,
  template,
  noop,
  forEach
} from '@angular-devkit/schematics';
import {
  updateWorkspace,
  getWorkspace
} from '@nrwl/workspace';
import { strings } from '@angular-devkit/core';
import {
  join,
  relative
} from 'path';
import { AddSchema } from './schema';

export async function getProjectPath(host: Tree, projectName: string) {
  const workspace = await getWorkspace(host);

  const project = workspace.projects.get(projectName);

  if (!project) {
    throw new Error('Could not extract target project.');
  }

  return project.root;
}

export default function(options: AddSchema): Rule {

  return async (host: Tree) => {

    const path       = await getProjectPath(host, options.project);
    const pathToRoot = relative(join('/', path), host.getDir('/').path) + '/';

    const indexTsFilePath = join(path, 'schematics', 'index.ts');
    const hasIndexTs = host.exists(indexTsFilePath);

    return chain([
      updateWorkspace((workspace) => {
        const project = workspace.projects.get(options.project);

        if (!project) {
          throw new Error('Could not extract target project.');
        }

        if (project.targets.has('schematics')) {

        } else {

          project.targets.add({
            name:    'schematics',
            builder: '@rxap-plugin/library-schematics:build',
            options: {
              buildTarget: `${options.project}:build:production`,
              skipBuild:   options.skipBuild,
              tsConfig:    join(project.root, 'tsconfig.schematics.json')
            }
          });

        }

        if (project.targets.has('update-package-group')) {

        } else {

          project.targets.add({
            name:    'update-package-group',
            builder: '@rxap-plugin/library-schematics:update-package-group',
            options: {}
          });

        }

        if (project.targets.has('pack')) {
          const packTarget = project.targets.get('pack')!;

          if (!packTarget.options) {
            packTarget.options = {};
          }

          if (!packTarget.options.targets || !Array.isArray(packTarget.options.targets)) {
            packTarget.options.targets = [];
          }

          const buildSchematicsTarget = `${options.project}:schematics`;
          if (!packTarget.options.targets.includes(buildSchematicsTarget)) {
            packTarget.options.targets.push(buildSchematicsTarget);
          }

          const updatePackageGroupTarget = `${options.project}:update-package-group`
          if (!packTarget.options.targets.includes(updatePackageGroupTarget)) {
            packTarget.options.targets.unshift(updatePackageGroupTarget);
          }

        }

      }),
      (tree: Tree) => {

        const packageJsonFile = join('/', path, 'package.json');

        const packageJson = JSON.parse(tree.read(packageJsonFile)!.toString('utf-8'));

        packageJson.schematics = './schematics/collection.json';

        const ngUpdate = packageJson['ng-update'] ?? {
          migrations: './schematics/migration.json',
          packageGroup: []
        };

        // enforce the migration json file path
        ngUpdate.migrations = './schematics/migration.json';

        packageJson['ng-update'] = ngUpdate;

        tree.overwrite(packageJsonFile, JSON.stringify(packageJson, null, 2));

      },
      options.onlyBuilder ? noop() : mergeWith(
        apply(url('./files'), [
          template({
            ...strings,
            ...options,
            path,
            pathToRoot
          }),
          move(join('/', path)),
          forEach(entry => {
            if (host.exists(entry.path)) {
              return null;
            }
            return entry;
          })
        ])
      ),
      hasIndexTs ? noop() : (tree: Tree) => tree.create(indexTsFilePath, 'export {}'),
    ]);

  };

}
