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
  const rootPackageJson = readPackageJsonForProject(context, 'workspace');

  let targetVersion = rootPackageJson.devDependencies?.[options.packageName] ??
    rootPackageJson.dependencies?.[options.packageName];

  if (!targetVersion) {
    console.error(`The package ${ options.packageName } is not installed in the root package.json`);
    return {
      success: false,
    };
  }

  targetVersion = targetVersion.replace(/^[~^]/, '');

  console.log(`Current '${ options.packageName }' version: ${ targetVersion }`);
  console.log(`Project version: ${ projectJson.version }`);

  const version = parse(targetVersion);

  if (!version) {
    console.error(`Can't parse version: ${ targetVersion }`);
    return {
      success: false,
    };
  }

  const versionRange = `>=${ version.major }`;

  if (!projectJson.version) {
    console.error(`The project version is not defined`);
    return {
      success: false,
    };
  }

  const normalizedVersion = projectJson.version.replace(/-.*$/, '');

  if (!satisfies(normalizedVersion, versionRange)) {
    console.error(`The project version '${ projectJson.version }' normalized '${ normalizedVersion }' is not compatible with the '${ options.packageName }' version '${ targetVersion }' with the range '${ versionRange }'`);
    if (process.env.WORKSPACE_UPGRADE) {
      console.warn('Detecting workspace upgrade mode');
      return { success: true };
    }
    return {
      success: false,
    };
  }

  return {
    success: true,
  };
}
