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
  GetDefaultGeneratorOptions,
  GetProject,
  GetProjectRoot,
  GetProjectSourceRoot,
  HasTarget,
  IsLibraryProject,
} from '@rxap/workspace-utilities';
import {
  join,
  relative,
} from 'path';
import { InitComponentGeneratorSchema } from './schema';
import 'colors';

export async function initComponentGenerator(
  tree: Tree,
  options: InitComponentGeneratorSchema
) {

  const projectRoot = GetProjectRoot(tree, options.project);
  const projectSourceRoot = GetProjectSourceRoot(tree, options.project);
  const path = options.path ?? (projectSourceRoot + (IsLibraryProject(GetProject(tree, options.project)) ? '/lib' : '/app') + (options.flat ? '' : '/' + dasherize(options.name)));
  const componentPath = relative(projectRoot, path);

  GenerateSerializedSchematicFile(
    tree,
    path,
    '@rxap/plugin-angular',
    'init-component',
    options,
  );

  const defaultOptions = GetDefaultGeneratorOptions(tree, '@nx/angular: component');
  const componentOptions = {
    ...defaultOptions,
    ...options,
  };

  componentOptions.displayBlock ??= false;
  componentOptions.inlineStyle ??= false;
  componentOptions.standalone ??= true;
  componentOptions.changeDetection ??= 'OnPush';
  componentOptions.skipTests ??= false;
  componentOptions.flat ??= false;
  componentOptions.skipImport ??= false;
  componentOptions.skipSelector ??= false;
  componentOptions.type ??= 'component';
  componentOptions.export ??= false;
  componentOptions.skipFormat ??= false;
  componentOptions.style ??= 'scss';

  const componentName = classify(componentOptions.name) + 'Component';
  const componentFileName = dasherize(componentOptions.name) + '.component';

  if (!tree.exists(join(path, componentFileName + '.ts'))) {
    await componentGenerator(tree, componentOptions);
  }

  if (!tree.exists(join(path, componentFileName + '.stories.ts')) && HasTarget(tree, options.project, 'storybook')) {
    console.log('Generate component story'.blue);
    await componentStoryGenerator(tree, {
      projectPath: projectRoot,
      interactionTests: componentOptions.interactionTests,
      componentName,
      componentPath,
      componentFileName,
      skipFormat: componentOptions.skipFormat,
    });

    if (options.cypressProject || HasTarget(tree, options.project, 'e2e')) {
      console.log('Generate component cypress spec'.blue);
      await componentCypressSpecGenerator(tree, {
        projectName: options.project,
        projectPath: projectRoot,
        componentName,
        componentPath,
        componentFileName,
        cypressProject: componentOptions.cypressProject ?? options.project,
        skipFormat: componentOptions.skipFormat,
        specDirectory: componentOptions.specDirectory,
      });
    }

  }

  if (!tree.exists(join(path, componentFileName + '.cy.ts')) && HasTarget(tree, options.project, 'component-test')) {
    console.log('Generate component test'.blue);
    await componentTestGenerator(tree, {
      project: options.project,
      componentName,
      componentDir: componentPath,
      componentFileName,
      skipFormat: componentOptions.skipFormat
    });
  }

}

export default initComponentGenerator;
