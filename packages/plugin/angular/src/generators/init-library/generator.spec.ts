import {
  readJson,
  Tree,
  writeJson,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { libraryGenerator } from '@nx/angular/generators';
import {
  CollectTypeScriptSyntaxDiagnostics,
  SnapshotGeneratedTree,
} from '@rxap/plugin-utilities';
import initLibraryGenerator from './generator';

describe('plugin-angular:init-library (golden master)', () => {

  let tree: Tree;

  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace();
    // The layering reads the angular version from the root package.json,
    // pinned here for a deterministic snapshot.
    const rootPackageJson = readJson(tree, 'package.json');
    rootPackageJson.dependencies = {
      ...(rootPackageJson.dependencies ?? {}),
      '@angular/core': '19.2.16',
    };
    rootPackageJson.devDependencies = {
      ...(rootPackageJson.devDependencies ?? {}),
      '@angular/cli': '19.2.0',
    };
    writeJson(tree, 'package.json', rootPackageJson);

    await libraryGenerator(tree, {
      name: 'feat',
      directory: 'feat',
      skipFormat: true,
    } as any);
  });

  it('should produce a stable init-library tree', async () => {

    await initLibraryGenerator(tree, {
      project: 'feat',
    } as any);

    // Golden master: full cumulative tree (the @nx/angular library scaffold +
    // the RxAP angular init-library layering). An Nx/@nx/angular migration that
    // changes either produces a reviewable snapshot diff.
    expect(SnapshotGeneratedTree(tree)).toMatchSnapshot('init-library-tree');
    expect(CollectTypeScriptSyntaxDiagnostics(SnapshotGeneratedTree(tree))).toEqual([]);

  }, 5000 * 6);

});
