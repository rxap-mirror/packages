import {
  applicationGenerator as angularApplicationGenerator,
  E2eTestRunner,
  host as angularHostGenerator,
  remote as angularRemoteGenerator,
  UnitTestRunner,
} from '@nx/angular/generators';
import { Schema as AngularApplicationGeneratorSchema } from '@nx/angular/src/generators/application/schema';
import { Schema as AngularHostGeneratorSchema } from '@nx/angular/src/generators/host/schema';
import { Schema as AngularRemoteGeneratorSchema } from '@nx/angular/src/generators/remote/schema';
import { Tree } from '@nx/devkit';
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
    directory += '/feature';
  }
  directory += `/${ projectName.replace('user-interface-', '').replace('feature-', '') }`;

  const formOptions: any = options.coerce && typeof options.coerce === 'object' ? options.coerce : {};

  if (formOptions.directory && (options.projects?.length ?? 0) > 1) {
    throw new Error('The directory option is not allowed when multiple projects are initialized!');
  }

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
        linter: 'eslint',
        strict: true,
        standaloneConfig: true,
        ...defaultOptions,
        directory,
        ...formOptions,
        name: projectName,
        dynamic: true,
        projectNameAndRootFormat: 'as-provided',
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
        linter: 'eslint',
        strict: true,
        standaloneConfig: true,
        ...defaultOptions,
        directory,
        ...formOptions,
        host: options.host,
        name: projectName,
        projectNameAndRootFormat: 'as-provided',
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
      linter: 'eslint',
      strict: true,
      standaloneConfig: true,
      minimal: true,
      ...defaultOptions,
      directory,
      ...formOptions,
      name: projectName,
      projectNameAndRootFormat: 'as-provided',
    };
    await angularApplicationGenerator(tree, schema);
  }

}
