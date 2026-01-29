import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import { join } from 'path';
import { firstValueFrom } from 'rxjs';
import { CoerceNestModule } from './coerce-nest-module';
import {
  TestProject,
  TestProjectNames,
  createFullWorkspace,
  listFiles,
} from '@rxap/schematics-utilities';
import {
  callRule, // Import callRule
} from '@angular-devkit/schematics';

describe('CoerceNestModule', () => {

  let tree: UnitTestTree;
  let workspace: { [project: string]: TestProject };
  let projects: TestProjectNames;

  beforeEach(() => {
    const result = createFullWorkspace();
    tree =  result.tree;
    workspace = result.workspace;
    projects = result.projects;
  });

  it('should coerce the nest module in a library project', async () => {

    const rule = CoerceNestModule({
      name: 'new',
      project: projects.nest.lib,
      backend: {
        project: projects.nest.lib
      }
    });
    await firstValueFrom(callRule(rule, tree, {} as any));

    expect(listFiles(tree.getDir(workspace[projects.nest.lib].sourceRoot))).toMatchSnapshot();

    const libModule = tree.readText(join(workspace[projects.nest.lib].sourceRoot, 'lib/api-lib.module.ts'));
    const newModule = tree.readText(join(workspace[projects.nest.lib].sourceRoot, 'lib/new.module.ts'));
    expect(newModule).toMatchSnapshot();
    expect(libModule).toMatchSnapshot();

  });

});