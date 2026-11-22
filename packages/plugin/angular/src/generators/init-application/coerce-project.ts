import {
  applicationGenerator as angularApplicationGenerator,
  E2eTestRunner,
  UnitTestRunner,
} from '@nx/angular/generators';
import { Schema as AngularApplicationGeneratorSchema } from '@nx/angular/src/generators/application/schema';
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
    // The host and remote generators were removed from @nx/angular with Nx 24 (webpack module federation
    // is no longer supported). Existing module federation projects can still be initialized, but new
    // projects can not be coerced.
    throw new Error(
      `Can not coerce the project '${ projectName }' as module federation ${ options.moduleFederation }: ` +
      'the host and remote generators were removed from @nx/angular in Nx 24. ' +
      'Create the application with the application generator and initialize it without the coerce option.',
    );
  }

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
