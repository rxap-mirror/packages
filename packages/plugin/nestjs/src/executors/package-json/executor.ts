import { ExecutorContext } from '@nx/devkit';
import { jsonFile } from '@rxap/node-utilities';
import {
  GetAllPackageDependenciesForProject,
  GetProjectRoot,
  LoadProjectToPackageMapping,
} from '@rxap/plugin-utilities';
import { PackageJson } from '@rxap/workspace-utilities';
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

  console.log('resolved local published package dependencies', JSON.stringify(dependencies));

  if (options.dependencies) {
    console.log('adding dependencies from options', options.dependencies.join(', '));
    const rootPackageJson: PackageJson = jsonFile(join(context.root, 'package.json'));
    for (const dependency of options.dependencies) {
      dependencies[dependency] = rootPackageJson.dependencies?.[dependency] ??
                                 rootPackageJson.devDependencies?.[dependency] ?? 'latest';
    }
  }

  const packageJson = { dependencies, name: context.projectName, private: true };

  console.log('generated package.json', JSON.stringify(packageJson));

  writeFileSync(join(GetProjectRoot(context), 'package.json'), JSON.stringify(packageJson, null, 2));

  return {
    success: true,
  };
}
