import {
  readJson,
  Tree,
  writeJson,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { applicationGenerator } from '@nx/nest/src/generators/application/application';
import {
  CollectTypeScriptSyntaxDiagnostics,
  SnapshotGeneratedTree,
} from '@rxap/plugin-utilities';
import initApplicationGenerator from './generator';

describe('plugin-nestjs:init-application (golden master)', () => {

  let tree: Tree;

  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace();
    const rootPackageJson = readJson(tree, 'package.json');
    rootPackageJson.dependencies = {
      ...(rootPackageJson.dependencies ?? {}),
      '@nestjs/core': '11.1.1',
    };
    writeJson(tree, 'package.json', rootPackageJson);

    await applicationGenerator(tree, {
      name: 'api',
      directory: 'api',
      skipFormat: true,
    } as any);
  });

  it('should produce a stable standalone init-application tree (features off)', async () => {

    await initApplicationGenerator(tree, {
      project: 'api',
      standalone: true,
      // pinned so getPort()'s random fallback does not make the snapshot churn
      port: 3000,
      sentry: false,
      swagger: false,
      healthIndicator: false,
      validator: false,
      jwt: false,
      openApi: false,
    } as any);

    expect(SnapshotGeneratedTree(tree)).toMatchSnapshot('init-application-tree');
    // every generated .ts file must be syntactically valid TypeScript
    expect(CollectTypeScriptSyntaxDiagnostics(SnapshotGeneratedTree(tree))).toEqual([]);

  }, 5000 * 8);

});
