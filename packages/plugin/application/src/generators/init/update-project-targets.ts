import { ProjectConfiguration } from '@nx/devkit';
import { DeleteEmptyProperties } from '@rxap/utilities';
import { CoerceTarget } from '@rxap/workspace-utilities';
import { InitGeneratorSchema } from './schema';

function buildDockerImageSuffix(project: ProjectConfiguration, projectName: string) {
  let imageSuffix = `/`;
  if (project.targets?.['build']?.executor?.includes('angular') ||
      projectName.startsWith('frontend') ||
      projectName.startsWith('ui') ||
      projectName.startsWith('user-interface') ||
      projectName.startsWith('application')) {
    imageSuffix +=
      [ 'user-interface', projectName.replace(/^(application|user-interface|ui|frontend)-/, '') ].join('/');
  } else if (projectName.startsWith('service') || projectName.startsWith('backend')) {
    imageSuffix += [ 'service', projectName.replace(/^(service|backend)-/, '') ].join('/');
  } else {
    imageSuffix += projectName;
  }
  return imageSuffix;
}

export function updateProjectTargets(project: ProjectConfiguration, projectName: string, options: InitGeneratorSchema) {

  CoerceTarget(project, 'docker', {
    options: DeleteEmptyProperties({
      imageName: options.dockerImageName,
      imageSuffix: options.dockerImageSuffix ?? buildDockerImageSuffix(project, projectName),
      imageRegistry: options.dockerImageRegistry,
    }),
  });
  CoerceTarget(project, 'docker-save');

  if (project.targets?.['build']) {

    // if the build target has a configuration for production
    if (project.targets['build']?.configurations?.['production']) {
      // set the default configuration to production
      project.targets['build'].defaultConfiguration = 'production';
      // ensure the build target has a configuration for development
      project.targets['build'].configurations['development'] ??= {};
      // if the project has a serve target with a buildTarget option
      if (project.targets['serve'].options?.buildTarget) {
        // ensure that the target configuration is explicitly set
        if (project.targets['serve'].options.buildTarget.match(new RegExp(`^${ projectName }:build$`))) {
          // if not the set the build configuration to development
          project.targets['serve'].options.buildTarget += ':development';
        }
      }
    }

  } else {
    console.warn(`The project '${ project.name }' has no build target`);
  }

}
