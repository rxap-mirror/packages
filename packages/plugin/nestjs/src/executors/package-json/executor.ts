import { ExecutorContext } from '@nx/devkit';
import { jsonFile } from '@rxap/node-utilities';
import {
  GetAllPackageDependenciesForProject,
  GetProjectRoot,
  LoadProjectToPackageMapping,
} from '@rxap/plugin-utilities';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { PackageJsonExecutorSchema } from './schema';

export default async function runExecutor(
  options: PackageJsonExecutorSchema,
  context: ExecutorContext,
) {
  console.log('Executor ran for PackageJson', options);

  LoadProjectToPackageMapping(context);

  const dependencies = GetAllPackageDependenciesForProject(context);

  if (options.dependencies) {
    const rootPackageJson = jsonFile(join(context.root, 'package.json'));
    for (const dependency of options.dependencies) {
      dependencies[dependency] = rootPackageJson.dependencies[dependency] ??
                                 rootPackageJson.devDependencies[dependency] ?? 'latest';
    }
  }

  const packageJson = { dependencies, name: context.projectName, private: true };

  console.log('dependencies', dependencies);

  writeFileSync(join(GetProjectRoot(context), 'package.json'), JSON.stringify(packageJson, null, 2));

  return {
    success: true,
  };
}
