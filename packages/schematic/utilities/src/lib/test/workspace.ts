import {
  DirEntry,
  EmptyTree,
  HostTree,
  Tree,
} from '@angular-devkit/schematics';
import { UnitTestTree } from '@angular-devkit/schematics/testing';
import {
  classify,
  dasherize,
} from '@rxap/utilities';
import { join } from 'path';

export interface TestProject {
  projectType: string;
  root: string;
  sourceRoot: string;
  name: string;
  prefix?: string;
  tags: string[];
}

export interface TestProjectNames {
  angular: { lib: string, app: string }, nest: { lib: string, app: string }
}

export interface FullWorkspace {
  tree: UnitTestTree,
  workspace: { [project: string]: TestProject },
  projects: TestProjectNames
}

export function createWorkspace(tree: UnitTestTree): UnitTestTree {
  tree.create('/angular.json', JSON.stringify({ version: 2, projects: {} }));
  tree.create('/nx.json', JSON.stringify({ npmScope: 'rxap', affected: { defaultBase: 'master' } }));
  tree.create('/package.json', JSON.stringify({ name: 'workspace' }));
  tree.create('/tsconfig.base.json', JSON.stringify({ compilerOptions: { paths: {} } }));
  return tree;
}

export function createProject(tree: Tree, project: string, type: string, root: string): TestProject {
  const config = {
    name: project,
    root,
    projectType: type,
    sourceRoot: join(root, 'src'),
    tags: [],
  };
  tree.create(join(root, 'project.json'), JSON.stringify(config, null, 2));
  tree.create(join(root, 'tsconfig.json'), JSON.stringify({}, null, 2));
  switch (type) {
    case 'application':
      tree.create(join(root, 'tsconfig.app.json'), JSON.stringify({}, null, 2));
      tree.create(join(root, 'src', 'main.ts'), '');
      break;
    case 'library':
      tree.create(join(root, 'tsconfig.lib.json'), JSON.stringify({}, null, 2));
      tree.create(join(root, 'src', 'index.ts'), '');
      break;
  }
  return config;
}

export function createAngularApplication(tree: Tree, project: string, root: string) {
  const config = createProject(tree, project, 'application', root);
  tree.create(join(config.sourceRoot, 'app', 'app.module.ts'), `import { NgModule } from '@angular/core';
@NgModule({})
export class AppModule {}`);
  tree.create(join(config.sourceRoot, 'app', 'app.routes.ts'), 'import { Route } from \'@angular/router\';\nexport const appRoutes: Route[] = [];');
  config.prefix = 'jest';
  config.tags.push('angular');
  tree.overwrite(join(config.root, 'project.json'), JSON.stringify(config, null, 2));
  return config;
}

export function createAngularLibrary(tree: Tree, project: string, root: string) {
  const config = createProject(tree, project, 'library', root);
  tree.create(join(config.sourceRoot, 'lib', `${dasherize(project)}.module.ts`), `import { NgModule } from '@angular/core';
@NgModule({})
export class ${classify(project)}Module {}
`);
  config.prefix = 'jest';
  config.tags.push('angular');
  tree.overwrite(join(config.root, 'project.json'), JSON.stringify(config, null, 2));
  return config;
}

export function createNestApplication(tree: Tree, project: string, root: string) {
  const config = createProject(tree, project, 'application', root);
  tree.create(join(config.sourceRoot, 'app', 'app.module.ts'), `import { NestFactory } from '@nestjs/core';
@Module({})
export class AppModule {}`);
  config.tags.push('nest');
  tree.overwrite(join(config.root, 'project.json'), JSON.stringify(config, null, 2));
  return config;
}

export function createNestLibrary(tree: Tree, project: string, root: string) {
  const config = createProject(tree, project, 'library', root);
  tree.create(join(config.sourceRoot, 'lib', `${dasherize(project)}.module.ts`), `import { Module } from '@nestjs/common';
@Module({})
export class ${classify(project)}Module {}`);
  config.tags.push('nest');
  tree.overwrite(join(config.root, 'project.json'), JSON.stringify(config, null, 2));
  return config;
}

export function createFullWorkspace(tree: UnitTestTree = new UnitTestTree(new EmptyTree())): FullWorkspace {
  tree = createWorkspace(tree);
  const angularApp = createAngularApplication(tree, 'ui-app', 'ui/app');
  const angularLib = createAngularLibrary(tree, 'ui-lib', 'ui/lib');
  const nestApp = createNestApplication(tree, 'api-app', 'api/app');
  const nestLib = createNestLibrary(tree, 'api-lib', 'api/lib');
  return {
    tree,
    workspace: { 'ui-app': angularApp, 'ui-lib': angularLib, 'api-app': nestApp, 'api-lib': nestLib },
    projects: {
      angular: {
        lib: angularLib.name,
        app: angularApp.name,
      },
      nest: {
        lib: nestLib.name,
        app: nestApp.name,
      }
    }
  };
}

export function listFiles(tree: Tree | DirEntry) {
  const paths: string[] = [];
  tree.visit(path => paths.push(path));
  return paths.sort();
}

/**
 * Reads every file in a schematic `Tree` into a `{ path: content }` map.
 *
 * Used to snapshot the full content of a workspace before/after running a
 * schematic. Combine with {@link diffTreeContent} to isolate only the files a
 * schematic created or modified (the fixture seeded by {@link createFullWorkspace}
 * is filtered out by the diff).
 */
export function captureTree(tree: Tree): Record<string, string> {
  const result: Record<string, string> = {};
  tree.visit(path => {
    const content = tree.read(path);
    result[path] = content ? content.toString('utf-8') : '';
  });
  return result;
}

/**
 * Returns only the files added or modified between two {@link captureTree}
 * snapshots, sorted by path for stable golden-master diffs.
 *
 * ```ts
 * const { tree } = createFullWorkspace();
 * const before = captureTree(tree);
 * const result = await runner.runSchematic('compose', options, tree);
 * expect(diffTreeContent(before, captureTree(result))).toMatchSnapshot('generated');
 * ```
 */
export function diffTreeContent(
  before: Record<string, string>,
  after: Record<string, string>,
): Record<string, string> {
  const diff: Record<string, string> = {};
  for (const path of Object.keys(after).sort((a, b) => a.localeCompare(b))) {
    if (!(path in before) || before[path] !== after[path]) {
      diff[path] = after[path];
    }
  }
  return diff;
}