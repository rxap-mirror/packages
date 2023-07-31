import { ExecutorContext } from '@nx/devkit';
import { readPackageJsonForProject } from '@rxap/plugin-utilities';
import {
  parse,
  satisfies,
} from 'semver';
import { CheckVersionExecutorSchema } from './schema';

export default async function runExecutor(
  options: CheckVersionExecutorSchema,
  context: ExecutorContext,
) {
  console.log('Executor ran for CheckVersion', options);

  const projectJson = readPackageJsonForProject(context);
  const rootPackageJson = readPackageJsonForProject(context, 'packages');

  const targetVersion = rootPackageJson.devDependencies[options.packageName] ??
    rootPackageJson.dependencies[options.packageName];

  if (!targetVersion) {
    console.error(`The package ${ options.packageName } is not installed in the root package.json`);
    return {
      success: false,
    };
  }

  console.log(`Current '${ options.packageName }' version: ${ targetVersion }`);
  console.log(`Project version: ${ projectJson.version }`);

  const version = parse(targetVersion);

  const versionRange = `>=${ version.major }`;

  if (!satisfies(projectJson.version, versionRange)) {
    console.error(`The project version ${ projectJson.version } is not compatible with the '${ options.packageName }' version ${ targetVersion }`);
    return {
      success: false,
    };
  }

  return {
    success: true,
  };
}
