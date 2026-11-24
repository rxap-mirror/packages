import {
  readJson,
  Tree,
  writeJson,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { libraryGenerator } from '@nx/angular/generators';
import {
  CollectTypeScriptSyntaxDiagnostics,
  CompileGeneratedFiles,
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
      '@angular/core': '22.1.8',
    };
    rootPackageJson.devDependencies = {
      ...(rootPackageJson.devDependencies ?? {}),
      '@angular/cli': '22.1.9',
    };
    writeJson(tree, 'package.json', rootPackageJson);

    await libraryGenerator(tree, {
      name: 'feat',
      directory: 'feat',
      skipFormat: true,
      unitTestRunner: 'jest',
    } as any);
  });

  it('should produce a stable init-library tree', async () => {

    await initLibraryGenerator(tree, {
      project: 'feat',
    } as any);

    // the workspace init (runs once per process) adds @angular/localize with the angular version of the workspace
    expect(readJson(tree, 'package.json').dependencies['@angular/localize']).toBe('22.1.8');

    // Golden master: full cumulative tree (the @nx/angular library scaffold +
    // the RxAP angular init-library layering). An Nx/@nx/angular migration that
    // changes either produces a reviewable snapshot diff.
    expect(SnapshotGeneratedTree(tree)).toMatchSnapshot('init-library-tree');
    expect(CollectTypeScriptSyntaxDiagnostics(SnapshotGeneratedTree(tree))).toEqual([]);
    expect(CompileGeneratedFiles(SnapshotGeneratedTree(tree))).toEqual([]);

  }, 5000 * 10);

});

describe('plugin-angular:init-library without unit tests', () => {

  it('should init a library that has no tsconfig.spec.json', async () => {
    const tree = createTreeWithEmptyWorkspace();
    await libraryGenerator(tree, {
      name: 'plain',
      directory: 'plain',
      skipFormat: true,
      unitTestRunner: 'none',
    } as any);
    expect(tree.exists('plain/tsconfig.spec.json')).toBe(false);
    await expect(initLibraryGenerator(tree, { project: 'plain' } as any)).resolves.not.toThrow();
  });

});
