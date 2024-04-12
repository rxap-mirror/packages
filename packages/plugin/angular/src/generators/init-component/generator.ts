import {
  componentCypressSpecGenerator,
  componentGenerator,
  componentStoryGenerator,
  componentTestGenerator,
} from '@nx/angular/generators';
import { Tree } from '@nx/devkit';
import {
  classify,
  dasherize,
} from '@rxap/utilities';
import {
  GenerateSerializedSchematicFile,
  GetProjectRoot,
  GetProjectSourceRoot,
  HasTarget,
} from '@rxap/workspace-utilities';
import { relative } from 'path';
import { InitComponentGeneratorSchema } from './schema';

export async function initComponentGenerator(
  tree: Tree,
  options: InitComponentGeneratorSchema
) {

  const projectRoot = GetProjectRoot(tree, options.project);
  const projectSourceRoot = GetProjectSourceRoot(tree, options.project);
  const path = (options.path ?? projectSourceRoot) + (options.flat ? '' : dasherize(options.name));
  const componentPath = relative(projectRoot, path);

  GenerateSerializedSchematicFile(
    tree,
    path,
    '@rxap/plugin-angular',
    'init-component',
    options,
  );

  await componentGenerator(tree, options);

  const componentName = classify(options.name) + 'Component';
  const componentFileName = dasherize(options.name) + '.component';

  if (HasTarget(tree, options.project, 'storybook')) {
    await componentStoryGenerator(tree, {
      projectPath: projectRoot,
      interactionTests: options.interactionTests,
      componentName,
      componentPath,
      componentFileName,
      skipFormat: options.skipFormat,
    });

    if (options.cypressProject || HasTarget(tree, options.project, 'e2e')) {
      await componentCypressSpecGenerator(tree, {
        projectName: options.project,
        projectPath: projectRoot,
        componentName,
        componentPath,
        componentFileName,
        cypressProject: options.cypressProject ?? options.project,
        skipFormat: options.skipFormat,
        specDirectory: options.specDirectory,
      });
    }

  }

  if (HasTarget(tree, options.project, 'component-test')) {
    componentTestGenerator(tree, {
      project: options.project,
      componentName,
      componentDir: componentPath,
      componentFileName,
      skipFormat: options.skipFormat
    });
  }

}

export default initComponentGenerator;
