
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { join } from 'path';
import {
  createFullWorkspace,
  listFiles,
  TestProject,
  TestProjectNames,
} from '../../../lib/test/workspace';

describe('accordion-component', () => {
  const runner = new SchematicTestRunner('schematics', join(__dirname, '../../../../collection.json'));

  let tree: Tree;
  let workspace: { [project: string]: TestProject };
  let projects: TestProjectNames;

  beforeEach(() => {
    const result = createFullWorkspace(tree);
    tree =  result.tree;
    workspace = result.workspace;
    projects = result.projects;
  });

  it('minimal', async () => {
    tree = await runner.runSchematic('accordion-component', {
      name: 'test-accordion',
      project: projects.angular.lib,
      identifier: { property: { name: 'id', type: 'string' } }
    }, tree);

    expect(listFiles(tree)).toMatchSnapshot('file-tree');
  });
});
