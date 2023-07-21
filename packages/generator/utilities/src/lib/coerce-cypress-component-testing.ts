import {
  ProjectConfiguration,
  readProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import { cypressComponentConfiguration } from '@nx/angular/generators';
import { join } from 'path';

export async function CoerceCypressComponentTesting(tree: Tree, project: ProjectConfiguration, projectName: string) {

  project.targets ??= {};

  if (!project.targets['component-test']) {
    await cypressComponentConfiguration(tree, {
      project: projectName,
      generateTests: true,
      skipFormat: false,
      buildTarget: 'angular:build:development',
    });
    const _project = readProjectConfiguration(tree, projectName);
    _project.targets ??= {};
    _project.targets['component-test'].configurations ??= {};
    _project.targets['component-test'].configurations['open'] ??= {};
    _project.targets['component-test'].configurations['open'].watch = true;
    updateProjectConfiguration(
      tree,
      projectName,
      _project,
    );
    tree.write(
      join(
        project.root,
        'cypress.config.ts',
      ),
      `import { componentTestingPreset } from 'workspace';
import { defineConfig } from 'cypress';

export default defineConfig({
  component: componentTestingPreset(__filename),
});`,
    );
  }

  const _project = readProjectConfiguration(
    tree,
    projectName,
  );
  _project.targets ??= {};
  const cypressProjectName = _project.targets['component-test'].options.devServerTarget.split(':').shift();
  const cypressProject = readProjectConfiguration(
    tree,
    cypressProjectName,
  );
  cypressProject.implicitDependencies ??= [];
  if (!cypressProject.implicitDependencies.includes(projectName)) {
    cypressProject.implicitDependencies.push(projectName);
    updateProjectConfiguration(
      tree,
      cypressProjectName,
      cypressProject,
    );
  }

}
