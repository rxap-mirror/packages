import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import {
  AbstractControlRolls,
  DataSourceKinds,
  FormControlKinds,
  MethodKinds,
} from '@rxap/schematic-angular';
import { join } from 'path';
import {
  createFullWorkspace,
  listFiles,
  TestProjectNames,
} from '@rxap/schematics-utilities';
import { FormComponentOptions } from '../../form-component/schema';
import { AutocompleteTableSelectFormControlOptions } from './schema';

const collectionPath = join(__dirname, '../../../../../collection.json');

describe('autocomplete-table-select-form-control', () => {
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
    const f_options: FormComponentOptions = {
      project: projects.angular.lib,
      name: 'test-form',
      controlList: [],
    };
    tree = await runner.runSchematic('form-component', f_options, tree);

    const a_options: AutocompleteTableSelectFormControlOptions = {
      project: projects.angular.lib,
      name: 'test-auto-table-select',
      formName: 'test-form',
      role: AbstractControlRolls.CONTROL,
      kind: FormControlKinds.AUTOCOMPLETE_TABLE_SELECT,
      type: 'string',
      dataSource: {
        kind: DataSourceKinds.IMPORT,
        import: {
          name: 'TestDataSource',
          moduleSpecifier: '@jest/test'
        },
      },
      resolver: {
        method: {
          kind: MethodKinds.IMPORT,
          import: {
            name: 'TestMethod',
            moduleSpecifier: '@jest/test'
          }
        }
      },
      options: {
        method: {
          kind: MethodKinds.IMPORT,
          import: {
            name: 'TestOptions',
            moduleSpecifier: '@jest/test'
          }
        }
      },
      columnList: [
        {
          name: 'col1',
        }
      ]
    };

    tree = await runner.runSchematic('autocomplete-table-select-form-control', a_options, tree);

    const files = listFiles(tree);
    expect(files).toMatchSnapshot();
  });
});
