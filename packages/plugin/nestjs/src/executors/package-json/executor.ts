import { ExecutorContext } from '@nx/devkit';
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

  const packageJson = { dependencies, name: context.projectName, private: true };

  console.log('dependencies', dependencies);

  writeFileSync(join(GetProjectRoot(context), 'package.json'), JSON.stringify(packageJson, null, 2));

  return {
    success: true,
  };
}
