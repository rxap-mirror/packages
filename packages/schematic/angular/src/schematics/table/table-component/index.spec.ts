
import { Tree } from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import { BackendTypes } from '@rxap/schematic-angular';
import { join } from 'path';
import {
  createFullWorkspace,
  listFiles,
  TestProject,
  TestProjectNames,
} from '@rxap/schematics-utilities';
import { TableComponentOptions } from './schema';

describe('table-component', () => {
  const runner = new SchematicTestRunner('schematics', join(__dirname, '../../../../collection.json'));

  let tree: UnitTestTree;
  let workspace: { [project: string]: TestProject };
  let projects: TestProjectNames;

  beforeEach(() => {
    const result = createFullWorkspace();
    tree =  result.tree;
    workspace = result.workspace;
    projects = result.projects;
  });

  it('minimal', async () => {
    const options: TableComponentOptions = {
      name: 'test-table',
      project: projects.angular.lib,
      columnList: [],
      actionList: [],
      filterList: [],
      propertyList: [],
    };
    tree = await runner.runSchematic('table-component', options, tree);

    expect(listFiles(tree)).toMatchSnapshot('file-tree');
  });

  it('nestjs backend', async () => {
    const options: TableComponentOptions = {
      name: 'test-table',
      project: projects.angular.lib,
      columnList: [
        {
          name: 'name',
        }
      ],
      actionList: [],
      filterList: [],
      propertyList: [],
      backend: {
        kind: BackendTypes.NESTJS,
        project: projects.nest.lib,
        module: workspace[projects.nest.lib].name
      }
    };
    tree = await runner.runSchematic('table-component', options, tree);

    expect(listFiles(tree)).toMatchSnapshot('file-tree');
    expect(tree.readText(join(workspace[projects.angular.lib].sourceRoot, 'lib/ui-lib.module.ts')))
      .toMatchSnapshot('ui-lib.module.ts');
  });
});
