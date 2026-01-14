// rxap-no-index-export
import {
  HostTree,
  Tree,
} from '@angular-devkit/schematics';
import { UnitTestTree } from '@angular-devkit/schematics/testing';
import { classify } from '@rxap/utilities';
import { join } from 'path';

export interface TestProject {
  projectType: string;
  root: string;
  sourceRoot: string;
  name: string;
  prefix?: string;
}

export interface TestProjectNames {
  angular: { lib: string, app: string }, nest: { lib: string, app: string }
}

export interface FullWorkspace {
  tree: Tree,
  workspace: { [project: string]: TestProject },
  projects: TestProjectNames
}

export function createWorkspace(tree: Tree = new UnitTestTree(new HostTree())): Tree {
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
  config.prefix = 'jest';
  tree.overwrite(join(config.root, 'project.json'), JSON.stringify(config, null, 2));
  return config;
}

export function createAngularLibrary(tree: Tree, project: string, root: string) {
  const config = createProject(tree, project, 'library', root);
  tree.create(join(config.sourceRoot, 'lib', 'test.ts'), `import { NgModule } from '@angular/core';
@NgModule({})
export class ${classify(project)}Module {}
`);
  config.prefix = 'jest';
  tree.overwrite(join(config.root, 'project.json'), JSON.stringify(config, null, 2));
  return config;
}

export function createNestApplication(tree: Tree, project: string, root: string) {
  const config = createProject(tree, project, 'application', root);
  tree.create(join(config.sourceRoot, 'app', 'app.module.ts'), `import { NestFactory } from '@nestjs/core';
@Module({})
export class AppModule {}`);
  return config;
}

export function createNestLibrary(tree: Tree, project: string, root: string) {
  const config = createProject(tree, project, 'library', root);
  tree.create(join(config.sourceRoot, 'lib', 'test.ts'), `import { Module } from '@nestjs/common';
@Module({})
export class ${classify(project)}Module {}`);
  return config;
}

export function createFullWorkspace(tree: Tree = new UnitTestTree(new HostTree())): FullWorkspace {
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

export function listFiles(tree: Tree) {
  const paths: string[] = [];
  tree.visit(path => paths.push(path));
  return paths;
}