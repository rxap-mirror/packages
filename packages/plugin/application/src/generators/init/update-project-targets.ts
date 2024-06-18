import { ProjectConfiguration } from '@nx/devkit';
import { DeleteEmptyProperties } from '@rxap/utilities';
import {
  CoerceTarget,
  Strategy,
} from '@rxap/workspace-utilities';
import { InitGeneratorSchema } from './schema';

export function updateProjectTargets(project: ProjectConfiguration, projectName: string, options: InitGeneratorSchema) {

  if (!options.skipDocker) {
    CoerceTarget(project, 'docker', {
      options: DeleteEmptyProperties({
        imageName: options.dockerImageName,
        imageSuffix: options.dockerImageSuffix ?? options.standalone ? undefined : '/' + projectName,
        imageRegistry: options.dockerImageRegistry,
      }),
    }, Strategy.MERGE);
    CoerceTarget(project, 'docker-save');
  }

  if (options.standalone) {
    if (project.targets?.['test']) {
      project.targets['test'].outputs = [
        "{workspaceRoot}/coverage/{projectName}",
        "{workspaceRoot}/junit/{projectName}"
      ];
    }
  }

  if (project.targets?.['build']) {

    // if the build target has a configuration for production
    if (project.targets['build']?.configurations?.['production']) {
      // set the default configuration to production
      project.targets['build'].defaultConfiguration = 'production';
      // ensure the build target has a configuration for development
      project.targets['build'].configurations['development'] ??= {};
      // if the project has a serve target with a buildTarget option
      if (project.targets['serve']?.options?.buildTarget) {
        // ensure that the target configuration is explicitly set
        if (project.targets['serve'].options.buildTarget.match(new RegExp(`^${ projectName }:build$`))) {
          // if not the set the build configuration to development
          project.targets['serve'].options.buildTarget += ':development';
        }
      }
    }

    const configurations = Object.keys(project.targets['build']?.configurations ?? {});
    if (!options.skipDocker) {
      CoerceTarget(project, 'docker', {
        configurations: configurations.reduce((acc, configuration) => ({ ...acc, [configuration]: {} }), {})
      }, Strategy.MERGE);
    }
  } else {
    console.warn(`The project '${ project.name }' has no build target`);
  }

}
