
import { Tree } from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import { BackendTypes } from '@rxap/schematic-angular';
import { CollectTypeScriptSyntaxDiagnostics } from '@rxap/plugin-utilities';
import { join } from 'path';
import {
  captureTree,
  createFullWorkspace,
  diffTreeContent,
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
    const before = captureTree(tree);
    tree = await runner.runSchematic('table-component', options, tree);

    expect(listFiles(tree)).toMatchSnapshot('file-tree');
    expect(diffTreeContent(before, captureTree(tree))).toMatchSnapshot('generated');
  }, 60_000);

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
    const before = captureTree(tree);
    tree = await runner.runSchematic('table-component', options, tree);

    expect(listFiles(tree)).toMatchSnapshot('file-tree');
    expect(tree.readText(join(workspace[projects.angular.lib].sourceRoot, 'lib/ui-lib.module.ts')))
      .toMatchSnapshot('ui-lib.module.ts');
    const generated = diffTreeContent(before, captureTree(tree));
    expect(generated).toMatchSnapshot('generated');
    // generated component/module .ts must be syntactically valid TypeScript
    expect(CollectTypeScriptSyntaxDiagnostics(generated)).toEqual([]);
  });
});
