import {
  chain,
  noop,
  Rule,
} from '@angular-devkit/schematics';
import {
  dirname,
  join,
} from 'path';
import {
  NodePackageInstallTask,
  RunSchematicTask,
} from '@angular-devkit/schematics/tasks';
import { PackageJson } from './package-json';
import { GetJsonFile } from './json-file';
import { CollectionJson } from './collection-json';
import {
  AddPackageJsonDependency,
  AddPackageJsonDevDependency,
} from './package-json-file';

export function InstallPeerDependencies(): Rule {
  return (host, context) => {
    let packageJson: PackageJson;
    const packageJsonFilePath = join(context.schematic.description.collection.name, 'package.json');
    try {
      packageJson = require(packageJsonFilePath);
    } catch (e: any) {
      console.warn(`Could not load schematic package.json file from '${ packageJsonFilePath }': ${ e.message }`);
      return noop();
    }

    const peerDependencies = packageJson.peerDependencies ?? {};

    return chain([
      chain(Object.entries(peerDependencies as Record<string, string>).map(([name, version]: [string, string]) => {
        if (packageJson['ng-add']?.save === 'devDependency') {
          return AddPackageJsonDevDependency(name, version);
        } else {
          return AddPackageJsonDependency(name, version);
        }
      })),
      (tree, context) => {
        const installTaskId = context.addTask(new NodePackageInstallTask());
        Object.keys(peerDependencies).map(name => {
          let peerPackageDirname: string;
          let peerPackageJson: PackageJson;
          try {
            peerPackageDirname = dirname(require.resolve(join(name, 'package.json')));
            peerPackageJson = require(join(name, 'package.json'));
          } catch (e: any) {
            console.warn(`Could not resolve the peerDependency '${name}'.`);
            return noop();
          }
          if (peerPackageJson['schematics']) {
            const peerCollectionJsonFilePath = join(peerPackageDirname, peerPackageJson['schematics']);
            if (tree.exists(peerCollectionJsonFilePath)) {
              const collectionJson = GetJsonFile<CollectionJson>(tree, peerCollectionJsonFilePath);
              if (collectionJson.schematics['ng-add']) {
                context.addTask(new RunSchematicTask(name, 'ng-add', {}), [installTaskId])
              }
            }
          }
          return noop();
        })
      },
    ]);
  }
}
