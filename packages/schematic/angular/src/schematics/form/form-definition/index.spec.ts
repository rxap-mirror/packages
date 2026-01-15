
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { join } from 'path';
import {
  createFullWorkspace,
  listFiles,
  TestProject,
  TestProjectNames,
} from '../../../lib/test/workspace';

describe('form-definition', () => {
  const runner = new SchematicTestRunner('schematics', join(__dirname, '../../../../collection.json'));

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
    tree = await runner.runSchematic('form-definition', {
      name: 'test-def',
      project: projects.angular.lib,
      controlList: [],
    }, tree);

    expect(listFiles(tree)).toMatchSnapshot('file-tree');
  });
});
