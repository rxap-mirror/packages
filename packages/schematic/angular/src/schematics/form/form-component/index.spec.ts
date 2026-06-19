
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { join } from 'path';
import { CollectTypeScriptSyntaxDiagnostics } from '@rxap/plugin-utilities';
import {
  captureTree,
  createFullWorkspace,
  diffTreeContent,
  listFiles,
  TestProject,
  TestProjectNames,
} from '@rxap/schematics-utilities';

describe('form-component', () => {
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
    const before = captureTree(tree);
    tree = await runner.runSchematic('form-component', {
      name: 'test-form',
      project: projects.angular.lib,
      controlList: [],
    }, tree);

    expect(listFiles(tree)).toMatchSnapshot('file-tree');
    const generated = diffTreeContent(before, captureTree(tree));
    expect(generated).toMatchSnapshot('generated');
    expect(CollectTypeScriptSyntaxDiagnostics(generated)).toEqual([]);
  });
});
