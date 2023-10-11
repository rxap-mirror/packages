import { cypressComponentConfiguration } from '@nx/angular/generators';
import {
  getProjects,
  ProjectConfiguration,
  readProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import {
  IsAngularProject,
  IsApplicationProject,
  IsRxapRepository,
} from '@rxap/workspace-utilities';
import { join } from 'path';

function determineCypressBuildTargetProject(tree: Tree, project: ProjectConfiguration, projectName: string): string {

  if (IsApplicationProject(project)) {
    return projectName;
  }

  const projects = getProjects(tree);

  const angularApplicationProjects = Array.from(projects.entries())
    .filter(([ , project ]) => IsApplicationProject(project) && IsAngularProject(project));

  const cypressProject = angularApplicationProjects.find(([ projectName ]) => projectName.endsWith('cypress'));

  if (cypressProject) {
    return cypressProject[0];
  }

  if (angularApplicationProjects.length) {
    return angularApplicationProjects[0][0];
  } else {
    throw new Error('No angular application project found. Can not determine the cypress build target project.');
  }

}

export async function CoerceCypressComponentTesting(tree: Tree, project: ProjectConfiguration, projectName: string) {

  project.targets ??= {};

  if (!project.targets['component-test']) {
    const buildTargetProjectName = determineCypressBuildTargetProject(tree, project, projectName);
    await cypressComponentConfiguration(tree, {
      project: projectName,
      generateTests: true,
      skipFormat: false,
      buildTarget: `${ buildTargetProjectName }:build:development`,
    });
    if (buildTargetProjectName !== projectName) {
      const buildTargetProject = readProjectConfiguration(tree, buildTargetProjectName);
      buildTargetProject.implicitDependencies ??= [];
      if (!buildTargetProject.implicitDependencies.includes(projectName)) {
        buildTargetProject.implicitDependencies.push(projectName);
        updateProjectConfiguration(
          tree,
          buildTargetProjectName,
          buildTargetProject,
        );
      }
    }
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
    if (IsRxapRepository(tree)) {
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
  }

  const _project = readProjectConfiguration(
    tree,
    projectName,
  );
  _project.targets ??= {};
  const cypressProjectName = _project.targets['component-test'].options.devServerTarget.split(':').shift();
  if (cypressProjectName !== projectName) {
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
}
