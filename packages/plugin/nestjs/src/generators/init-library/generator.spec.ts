import {
  readJson,
  Tree,
  writeJson,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { libraryGenerator } from '@nx/nest/src/generators/library/library';
import {
  CollectTypeScriptSyntaxDiagnostics,
  SnapshotGeneratedTree,
} from '@rxap/plugin-utilities';
import initLibraryGenerator from './generator';

describe('plugin-nestjs:init-library (golden master)', () => {

  let tree: Tree;

  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace();
    // The generator reads the nest major version from the root package.json,
    // so it must advertise @nestjs/core (pinned here for a deterministic snapshot).
    const rootPackageJson = readJson(tree, 'package.json');
    rootPackageJson.dependencies = {
      ...(rootPackageJson.dependencies ?? {}),
      '@nestjs/core': '11.1.1',
    };
    writeJson(tree, 'package.json', rootPackageJson);

    await libraryGenerator(tree, {
      name: 'feat',
      directory: 'feat',
    });
  });

  it('should produce a stable init-library tree', async () => {

    await initLibraryGenerator(tree, {
      project: 'feat',
    } as any);

    // Golden master: full cumulative tree (the @nx/nest library scaffold + the
    // RxAP nestjs init-library layering). An Nx/@nx/nest migration that changes
    // either produces a reviewable snapshot diff.
    expect(SnapshotGeneratedTree(tree)).toMatchSnapshot('init-library-tree');
    expect(CollectTypeScriptSyntaxDiagnostics(SnapshotGeneratedTree(tree))).toEqual([]);

  }, 5000 * 4);

});
