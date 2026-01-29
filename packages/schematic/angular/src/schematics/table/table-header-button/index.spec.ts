import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { HeaderButtonKind } from '@rxap/schematic-angular';
import { join } from 'path';
import {
  createFullWorkspace,
  listFiles,
  TestProject,
  TestProjectNames,
} from '@rxap/schematics-utilities';
import { TableComponentOptions } from '../table-component/schema';
import { TableHeaderButtonOptions } from './schema';

describe('table-header-button', () => {
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
    const t_options: TableComponentOptions = {
      name: 'test-table',
      project: projects.angular.lib,
      columnList: [],
      actionList: [],
      filterList: [],
      propertyList: [],
    };
    // Generate a table first
    tree = await runner.runSchematic('table-component', t_options, tree);

    const t_b_options: TableHeaderButtonOptions = {
      name: 'test-button',
      tableName: t_options.name!,
      project: projects.angular.lib,
      kind: HeaderButtonKind.DEFAULT,
    };

    tree = await runner.runSchematic('table-header-button', t_b_options, tree);

    expect(listFiles(tree)).toMatchSnapshot('file-tree');
  });
});
