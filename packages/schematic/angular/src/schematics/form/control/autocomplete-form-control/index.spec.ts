import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { join } from 'path';
import { createFullWorkspace, listFiles, TestProjectNames } from '@rxap/schematics-utilities';
import { AutocompleteFormControlOptions } from './schema';

const collectionPath = join(__dirname, '../../../../../collection.json');

describe('autocomplete-form-control', () => {
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
    tree = await runner.runSchematic('form-component', {
      project: projects.angular.lib,
      name: 'test-form',
      role: 'control' as any,
      controlList: [],
    }, tree);

    const options: AutocompleteFormControlOptions = {
      project: projects.angular.lib,
      name: 'test-autocomplete',
      role: 'control' as any,
      formName: 'test-form',
      kind: 'autocomplete' as any,
      label: 'Test Autocomplete',
    };

    tree = await runner.runSchematic('autocomplete-form-control', options, tree);

    const files = listFiles(tree);
    expect(files).toMatchSnapshot();
  });
});
