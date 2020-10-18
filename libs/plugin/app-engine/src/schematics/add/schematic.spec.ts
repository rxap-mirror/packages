import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { createEmptyWorkspace } from '@nrwl/workspace/testing';
import { join } from 'path';

import { AddSchema } from './schema';

describe('plugins-app-engine schematic', () => {
  let appTree: Tree;
  const options: AddSchema = { service: 'default', project: 'test' };

  const testRunner = new SchematicTestRunner(
    '@rxap/plugin-app-engine',
    join(__dirname, '../../../collection.json')
  );

  beforeEach(async () => {
    appTree = createEmptyWorkspace(Tree.empty());

    expect(appTree.exists('workspace.json')).toBeTruthy();

    const workspace = JSON.parse(appTree.get('workspace.json')!.content.toString());

    workspace.projects = {
      test: {
        sourceRoot: 'apps/test/src',
        architect:  {}
      }
    };

    appTree.overwrite('workspace.json', JSON.stringify(workspace, null, 2));

  });

  it('should run successfully', async () => {
    await expect(
      testRunner
        .runSchematicAsync('add', options, appTree)
        .toPromise()
    ).resolves.not.toThrowError();
  });

  it('should add app.yaml to target project', async () => {

    const tree = await testRunner.runSchematicAsync('add', options, appTree).toPromise();

    expect(tree.exists('apps/test/src/app.yaml')).toBeTruthy();

  });

  it('should add builder to config', async () => {

    const tree = await testRunner.runSchematicAsync('add', options, appTree).toPromise();

    expect(tree.exists('workspace.json')).toBeTruthy();

    const workspace = JSON.parse(tree.get('workspace.json')!.content.toString());

    expect(workspace.projects.test.architect[ 'app-engine-deploy' ]).toBeDefined();

  });

});
