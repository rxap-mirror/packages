import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { join } from 'path';
import { createFullWorkspace, listFiles, TestProjectNames } from '@rxap/schematics-utilities';
import { InputFormControlOptions } from './schema';

const collectionPath = join(__dirname, '../../../../../collection.json');

describe('input-form-control', () => {
  let runner: SchematicTestRunner;
  let tree: UnitTestTree;
  let projects: TestProjectNames;

  beforeEach(async () => {
    runner = new SchematicTestRunner('schematics', collectionPath);
    const workspace = createFullWorkspace();
    tree = workspace.tree as UnitTestTree;
    projects = workspace.projects;
  });

  it('should run snapshot match', async () => {
    // 1. Create a form component
    tree = await runner.runSchematic('form-component', {
      project: projects.angular.lib,
      name: 'test-form',
      role: 'control' as any,
      controlList: [],
    }, tree);

    // 2. Run the input-form-control schematic
    const options: InputFormControlOptions = {
      project: projects.angular.lib,
      name: 'test-input',
      role: 'control' as any,
      formName: 'test-form',
      kind: 'input' as any,
      inputType: 'text',
      label: 'Test Input',
    };

    tree = await runner.runSchematic('input-form-control', options, tree);

    const files = listFiles(tree);
    expect(files).toMatchSnapshot();
  });
});
