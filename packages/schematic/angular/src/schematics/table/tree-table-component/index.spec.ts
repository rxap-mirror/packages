
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { join } from 'path';
import {
  createFullWorkspace,
  listFiles,
  TestProject,
  TestProjectNames,
} from '../../../lib/test/workspace';
import { TreeTableComponentOptions } from './schema';

describe('tree-table-component', () => {
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
    const options: TreeTableComponentOptions = {
      name: 'test-tree-table',
      project: projects.angular.lib,
      columnList: [],
      actionList: [],
      filterList: [],
      propertyList: [],
    };
    tree = await runner.runSchematic('tree-table-component', options, tree);

    expect(listFiles(tree)).toMatchSnapshot('file-tree');
  });
});
