import {
  componentCypressSpecGenerator,
  componentGenerator,
  componentStoryGenerator,
  componentTestGenerator,
} from '@nx/angular/generators';
import { Tree } from '@nx/devkit';
import { CoerceDefaultClassExport } from '@rxap/ts-morph';
import {
  classify,
  dasherize,
} from '@rxap/utilities';
import { TsMorphAngularProjectTransform } from '@rxap/workspace-ts-morph';
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

function buildComponentDirectory(tree: Tree, options: InitComponentGeneratorSchema) {
  let directory = GetProjectSourceRoot(tree, options.project);
  if (IsLibraryProject(GetProject(tree, options.project))) {
    directory = join(directory, 'lib');
  } else if (options.feature) {
    directory = join(directory, 'feature', dasherize(options.feature));
  } else {
    directory = join(directory, 'app');
  }
  if (!options.flat) {
    directory = join(directory, dasherize(options.name));
  }
  return directory;
}

function buildRelativePath(tree: Tree, options: InitComponentGeneratorSchema, directory: string) {
  const projectSourceRoot = GetProjectSourceRoot(tree, options.project);
  let relativePath = relative(projectSourceRoot, directory);
  if (IsLibraryProject(GetProject(tree, options.project))) {
    relativePath = relative('lib', relativePath);
  } else if (options.feature) {
    relativePath = relative(join('feature', dasherize(options.feature)), relativePath);
  } else {
    relativePath = relative('app', relativePath);
  }
  return relativePath;
}

export async function initComponentGenerator(
  tree: Tree,
  options: InitComponentGeneratorSchema
) {

  const projectRoot = GetProjectRoot(tree, options.project);

  const directory = options.directory ?? buildComponentDirectory(tree, options);
  const componentPath = relative(projectRoot, directory);

  GenerateSerializedSchematicFile(
    tree,
    directory,
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

  console.log('Generate component'.cyan);
  console.log('componentName: ' + componentName.magenta);
  console.log('componentFileName: ' + componentFileName.magenta);
  console.log('componentPath: ' + componentPath.magenta);
  console.log('directory: ' + directory.magenta);

  if (!tree.exists(join(directory, componentFileName + '.ts'))) {
    await componentGenerator(tree, {
      ...componentOptions,
      directory,
      nameAndDirectoryFormat: 'as-provided',
    });
  }

  if (!tree.exists(join(directory, componentFileName + '.stories.ts')) && HasTarget(tree, options.project, 'storybook')) {
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

  if (!tree.exists(join(directory, componentFileName + '.cy.ts')) && HasTarget(tree, options.project, 'component-test')) {
    console.log('Generate component test'.blue);
    await componentTestGenerator(tree, {
      project: options.project,
      componentName,
      componentDir: componentPath,
      componentFileName,
      skipFormat: componentOptions.skipFormat
    });
  }

  if (options.defaultExport) {
    TsMorphAngularProjectTransform(tree, {
      project: options.project,
      feature: options.feature,
      directory: buildRelativePath(tree, options, directory),
    }, (_, [sourceFile]) => {
      CoerceDefaultClassExport(sourceFile);
    }, [`${dasherize(options.name)}.component.ts`]);
  }

}

export default initComponentGenerator;
