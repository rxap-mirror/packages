import { PromiseExecutor } from '@nx/devkit';
import { DeleteEmptyProperties } from '@rxap/utilities';
import { runExecutor as runGenerator } from '../run-generator/executor';
import { FixDependenciesExecutorSchema } from './schema';

const runExecutor: PromiseExecutor<FixDependenciesExecutorSchema> = async (
  options, context,
) => {
  console.log('Executor ran for FixDependencies', options);
  if (!options.projects?.length) {
    if (context.projectName) {
      if (context.root === context.projectsConfigurations.projects[context.projectName].root) {
        console.log(
          'Current project is root project and no projects are defined. Run fix-dependencies for all projects');
      } else {
        options.projects = [context.projectName];
      }
    } else {
      throw new Error(
        'No projects are defined and can not determine the current project. Please define the projects to fix.');
    }
  }
  return runGenerator({
    generator: '@rxap/plugin-library:fix-dependencies',
    options: DeleteEmptyProperties({ ...options }),
  }, context);
};

export default runExecutor;
