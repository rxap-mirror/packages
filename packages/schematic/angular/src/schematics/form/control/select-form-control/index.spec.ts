import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { join } from 'path';
import { createFullWorkspace, listFiles, TestProjectNames } from '../../../../lib/test/workspace';
import { SelectFormControlOptions } from './schema';

const collectionPath = join(__dirname, '../../../../../collection.json');

describe('select-form-control', () => {
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

    const options: SelectFormControlOptions = {
      project: projects.angular.lib,
      name: 'test-select',
      role: 'control' as any,
      formName: 'test-form',
      kind: 'select' as any,
      label: 'Test Select',
      optionList: [
        { display: 'Option 1', value: '1' },
      ],
    };

    tree = await runner.runSchematic('select-form-control', options, tree);

    const files = listFiles(tree);
    expect(files).toMatchSnapshot();
  });
});
