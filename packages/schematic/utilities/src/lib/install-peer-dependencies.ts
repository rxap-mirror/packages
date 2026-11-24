import {
  chain,
  noop,
  Rule,
} from '@angular-devkit/schematics';
import {
  NodePackageInstallTask,
  RunSchematicTask,
} from '@angular-devkit/schematics/tasks';
import {
  CollectionJson,
  PackageJson,
} from '@rxap/workspace-utilities';
import {
  dirname,
  join,
} from 'path';
import { GetJsonFile } from './json-file';
import {
  AddPackageJsonDependencyRule,
  AddPackageJsonDevDependencyRule,
} from './package-json-file';
import { ResolveFromWorkspace } from './resolve-from-workspace';

export function InstallPeerDependencies(): Rule {
  return (host, context) => {
    let packageJson: PackageJson;
    let packageJsonFilePath = join(context.schematic.description.collection.name, 'package.json');
    try {
      packageJsonFilePath = ResolveFromWorkspace(packageJsonFilePath);
      packageJson = require(packageJsonFilePath);
    } catch (e: any) {
      console.warn(`Could not load schematic package.json file from '${ packageJsonFilePath }': ${ e.message }`);
      return noop();
    }

    const peerDependencies = packageJson.peerDependencies ?? {};

    return chain([
      chain(Object.entries(peerDependencies as Record<string, string>).map(([ name, version ]: [ string, string ]) => {
        if (packageJson['ng-add']?.save === 'devDependency') {
          return AddPackageJsonDevDependencyRule(name, version);
        } else {
          return AddPackageJsonDependencyRule(name, version);
        }
      })),
      (tree, context) => {
        const installTaskId = context.addTask(new NodePackageInstallTask());
        Object.keys(peerDependencies).map(name => {
          let peerPackageDirname: string;
          let peerPackageJson: PackageJson;
          try {
            const peerPackageJsonFilePath = ResolveFromWorkspace(join(name, 'package.json'));
            peerPackageDirname = dirname(peerPackageJsonFilePath);
            peerPackageJson = require(peerPackageJsonFilePath);
          } catch (e: any) {
            console.warn(`Could not resolve the peerDependency '${ name }'.`);
            return noop();
          }
          if (peerPackageJson['schematics']) {
            const peerCollectionJsonFilePath = join(peerPackageDirname, peerPackageJson['schematics']);
            if (tree.exists(peerCollectionJsonFilePath)) {
              const collectionJson = GetJsonFile<CollectionJson>(tree, peerCollectionJsonFilePath);
              if (collectionJson.schematics['ng-add']) {
                context.addTask(new RunSchematicTask(name, 'ng-add', {}), [ installTaskId ]);
              }
            }
          }
          return noop();
        });
      },
    ]);
  };
}
