import {
  applicationGenerator as angularApplicationGenerator,
  host as angularHostGenerator,
  remote as angularRemoteGenerator,
} from '@nx/angular/generators';
import { Schema as AngularApplicationGeneratorSchema } from '@nx/angular/src/generators/application/schema';
import { Schema as AngularHostGeneratorSchema } from '@nx/angular/src/generators/host/schema';
import { Schema as AngularRemoteGeneratorSchema } from '@nx/angular/src/generators/remote/schema';
import {
  E2eTestRunner,
  UnitTestRunner,
} from '@nx/angular/src/utils/test-runners';
import { Tree } from '@nx/devkit';
import { Linter } from '@nx/linter/src/generators/utils/linter';
import {
  GetDefaultGeneratorOptions,
  HasProject,
} from '@rxap/workspace-utilities';
import { InitApplicationGeneratorSchema } from './schema';

export async function CoerceProjects(tree: Tree, options: InitApplicationGeneratorSchema) {

  if (!options.coerce) {
    return;
  }

  for (const projectName of options.projects ?? []) {

    if (!HasProject(tree, projectName)) {

      await CoerceProject(tree, projectName, options);

    }

  }

}

export async function CoerceProject(tree: Tree, projectName: string, options: InitApplicationGeneratorSchema) {

  if (HasProject(tree, projectName)) {
    console.log(`Project ${ projectName } already exists`);
    return;
  }

  let directory = 'user-interface';
  if (projectName.includes('-feature-')) {
    directory += '/features';
  }
  directory += `/${ projectName.replace('user-interface-', '').replace('feature-', '') }`;

  const formOptions: any = typeof options.coerce === 'object' ? options.coerce : {};

  if (options.moduleFederation) {

    if (options.moduleFederation === 'host') {
      const defaultOptions = GetDefaultGeneratorOptions<Partial<AngularHostGeneratorSchema>>(tree, '@nx/angular:host');
      const schema: AngularHostGeneratorSchema = {
        style: 'scss',
        inlineStyle: false,
        inlineTemplate: false,
        skipTests: false,
        skipFormat: false,
        skipPackageJson: false,
        unitTestRunner: UnitTestRunner.Jest,
        e2eTestRunner: E2eTestRunner.None,
        linter: Linter.EsLint,
        strict: true,
        standaloneConfig: true,
        ...defaultOptions,
        ...formOptions,
        name: projectName,
        dynamic: true,
        projectNameAndRootFormat: 'as-provided',
        directory,
      };
      await angularHostGenerator(tree, schema);
    } else {
      const defaultOptions = GetDefaultGeneratorOptions<Partial<AngularRemoteGeneratorSchema>>(tree, '@nx/angular:remote');
      const schema: AngularRemoteGeneratorSchema = {
        style: 'scss',
        inlineStyle: false,
        inlineTemplate: false,
        skipTests: false,
        skipFormat: false,
        skipPackageJson: false,
        unitTestRunner: UnitTestRunner.Jest,
        e2eTestRunner: E2eTestRunner.None,
        linter: Linter.EsLint,
        strict: true,
        standaloneConfig: true,
        ...defaultOptions,
        ...formOptions,
        host: options.host,
        name: projectName,
        projectNameAndRootFormat: 'as-provided',
        directory,
      };
      await angularRemoteGenerator(tree, schema);
    }

  } else {
    const defaultOptions = GetDefaultGeneratorOptions<Partial<AngularApplicationGeneratorSchema>>(tree, '@nx/angular:application');
    const schema: AngularApplicationGeneratorSchema = {
      style: 'scss',
      routing: true,
      inlineStyle: false,
      inlineTemplate: false,
      skipTests: false,
      skipFormat: false,
      skipPackageJson: false,
      unitTestRunner: UnitTestRunner.Jest,
      e2eTestRunner: E2eTestRunner.None,
      linter: Linter.EsLint,
      strict: true,
      standaloneConfig: true,
      minimal: true,
      ...defaultOptions,
      ...formOptions,
      name: projectName,
      projectNameAndRootFormat: 'as-provided',
      directory,
    };
    await angularApplicationGenerator(tree, schema);
  }

}
