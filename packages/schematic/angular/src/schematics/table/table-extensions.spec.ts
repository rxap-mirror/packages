import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import {
  captureTree,
  createFullWorkspace,
  diffTreeContent,
  TestProjectNames,
} from '@rxap/schematics-utilities';
import { join } from 'path';

describe('table actions and header buttons', () => {
  const runner = new SchematicTestRunner('schematics', join(__dirname, '../../../collection.json'));

  let tree: Tree;
  let projects: TestProjectNames;

  beforeEach(async () => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'group').mockImplementation();
    jest.spyOn(console, 'groupEnd').mockImplementation();
    const result = createFullWorkspace();
    tree = result.tree;
    projects = result.projects;
    tree = await runner.runSchematic('table-component', {
      name: 'test-table',
      project: projects.angular.lib,
      columnList: [],
      actionList: [],
      filterList: [],
      propertyList: [],
    }, tree);
  }, 120_000);

  async function generate(schematic: string, options: Record<string, unknown>): Promise<Record<string, string>> {
    const before = captureTree(tree);
    tree = await runner.runSchematic(schematic, {
      tableName: 'test-table',
      project: projects.angular.lib,
      ...options,
    }, tree);
    return diffTreeContent(before, captureTree(tree));
  }

  it('navigation-table-header-button', async () => {
    const generated = await generate('navigation-table-header-button', { kind: 'navigation', name: 'go', route: 'details', form: { controlList: [], controllerName: 'item', nestModule: 'item' } });
    expect(Object.keys(generated).length).toBeGreaterThan(0);
  }, 120_000);

  it('method-table-header-button', async () => {
    const generated = await generate('method-table-header-button', { kind: 'method', name: 'run', method: { kind: 'import', import: { name: 'RunMethod', moduleSpecifier: '@scope/methods' } } });
    expect(Object.keys(generated).length).toBeGreaterThan(0);
  }, 120_000);

  it('operation-table-action', async () => {
    await expect(generate('operation-table-action', { kind: 'operation', type: 'archive', controllerName: 'item', nestModule: 'item' })).resolves.toBeDefined();
  }, 120_000);

});
