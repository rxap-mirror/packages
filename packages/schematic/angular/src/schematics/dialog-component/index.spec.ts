import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { join } from 'path';
import {
  createFullWorkspace,
  listFiles,
  TestProject,
  TestProjectNames,
} from '../../lib/test/workspace';

describe('dialog-component', () => {
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

    tree = await runner.runSchematic('dialog-component', {
      dialogName: 'test',
      project: projects.angular.lib,
    }, tree);

    expect(listFiles(tree)).toMatchSnapshot('file-tree');
    expect(tree.readText(join(workspace[projects.angular.lib].sourceRoot, 'lib/test-dialog/test-dialog.component.scss')))
      .toMatchSnapshot('test-dialog.component.scss');
    expect(tree.readText(join(workspace[projects.angular.lib].sourceRoot, 'lib/test-dialog/test-dialog.component.html')))
      .toMatchSnapshot('test-dialog.component.html');
    expect(tree.readText(join(workspace[projects.angular.lib].sourceRoot, 'lib/test-dialog/test-dialog.component.ts')))
      .toMatchSnapshot('test-dialog.component.ts');

  });

});