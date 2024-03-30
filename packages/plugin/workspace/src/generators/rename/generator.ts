import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { CoerceArrayItems } from '@rxap/utilities';
import { GetProjectRoot } from '@rxap/workspace-utilities';
import { join } from 'path';
import { RenameGeneratorSchema } from './schema';

export async function renameGenerator(
  tree: Tree,
  options: RenameGeneratorSchema
) {
  const projectRoot = options.project ? GetProjectRoot(tree, options.project) : '.';
  const isStandalone = projectRoot === '.';
  options.name ??= 'workspace';
  console.log(`Rename project (standalone: ${isStandalone ? 'true' : 'false'}) '${options.project ?? '<auto>'}' in '${projectRoot}' to '${options.name}'`);
  // region replace project name with workspace
  // region project.json
  const projectJson: ProjectConfiguration = JSON.parse(tree.read(join(projectRoot, 'project.json'))!.toString('utf-8'));
  const originalName = projectJson.name!;
  projectJson.name = options.name;
  if (options.tags?.length) {
    projectJson.tags ??= [];
    CoerceArrayItems(projectJson.tags, options.tags);
  }
  if (projectJson.targets?.['build']?.options?.outputPath) {
    projectJson.targets['build'].options.outputPath = projectJson.targets['build'].options.outputPath.replace(originalName, projectJson.name);
  }
  if (projectJson.targets?.['serve']?.options?.buildTarget) {
    projectJson.targets['serve'].options.buildTarget = projectJson.targets['serve'].options.buildTarget.replace(originalName, projectJson.name);
  }
  if (projectJson.targets?.['serve']?.configurations?.production?.buildTarget) {
    projectJson.targets['serve'].configurations.production.buildTarget = projectJson.targets['serve'].configurations.production.buildTarget.replace(originalName, projectJson.name);
  }
  if (projectJson.targets?.['serve']?.configurations?.development?.buildTarget) {
    projectJson.targets['serve'].configurations.development.buildTarget = projectJson.targets['serve'].configurations.development.buildTarget.replace(originalName, projectJson.name);
  }
  tree.write(join(projectRoot, 'project.json'), JSON.stringify(projectJson, null, 2));
  // endregion
  // region jest.config.ts
  if (tree.exists(join(projectRoot, 'jest.config.ts'))) {
    let jestConfig = tree.read(join(projectRoot, 'jest.config.ts'))!.toString('utf-8');
    tree.write(join(projectRoot, 'jest.config.ts'), jestConfig.replace(`displayName: '${originalName}',`, `displayName: '${projectJson.name}',`));
    jestConfig = tree.read(join(projectRoot, 'jest.config.ts'))!.toString('utf-8');
    tree.write(join(projectRoot, 'jest.config.ts'), jestConfig.replace(`coverageDirectory: './coverage/${originalName}',`, `coverageDirectory: './coverage/${projectJson.name}',`));
  }
  // endregion
  // region e2e
  if (isStandalone) {
    if (tree.exists('e2e/project.json')) {
      const e2eProjectJson: ProjectConfiguration = JSON.parse(tree.read('e2e/project.json')!.toString('utf-8'));
      e2eProjectJson.name = projectJson.name + '-e2e';
      if (e2eProjectJson.implicitDependencies?.length) {
        e2eProjectJson.implicitDependencies = e2eProjectJson.implicitDependencies.map((dependency) => dependency.replace(originalName, projectJson.name!));
      }
      tree.write('e2e/project.json', JSON.stringify(e2eProjectJson, null, 2));
    }
  }
  // endregion
  // endregion
}

export default renameGenerator;
