
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { join } from 'path';
import {
  createFullWorkspace,
  listFiles,
  TestProject,
  TestProjectNames,
} from '@rxap/schematics-utilities';

describe('tree-component', () => {
  const runner = new SchematicTestRunner('schematics', join(__dirname, '../../../collection.json'));

  let tree: Tree;
  let workspace: { [project: string]: TestProject };
  let projects: TestProjectNames;

  beforeEach(() => {
    const result = createFullWorkspace();
    tree =  result.tree;
    workspace = result.workspace;
    projects = result.projects;
  });

  it('minimal', async () => {
    tree = await runner.runSchematic('tree-component', {
      name: 'test-tree',
      project: projects.angular.lib,
    }, tree);

    expect(listFiles(tree)).toMatchSnapshot('file-tree');
  });
});
