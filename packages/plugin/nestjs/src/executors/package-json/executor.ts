import { ExecutorContext } from '@nx/devkit';
import { jsonFileWithRetry } from '@rxap/node-utilities';
import {
  GetAllPackageDependenciesForProjectWihRetry,
  GetProjectRoot,
  HasProjectWithPackageName,
  LoadProjectToPackageMappingWithRetry,
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

  await LoadProjectToPackageMappingWithRetry(context);

  // Detect the race condition where a dependency's package.json is read while a concurrent
  // dependency build (`^build`) is rewriting it: the file is then silently dropped from the
  // resolved dependency list. If the project graph says we have local dependencies, retry the whole
  // resolution until it returns a non-empty result, and only fail loudly if it never does — rather
  // than writing a broken (empty) package.json.
  const hasLocalProjectDependencies = (context.projectGraph?.dependencies[context.projectName!] ?? [])
    .some(dependency => !dependency.target.startsWith('npm:'));

  const retries = 3;
  const sleep = 3000;
  let dependencies = await GetAllPackageDependenciesForProjectWihRetry(context);
  for (let attempt = 1; hasLocalProjectDependencies && Object.keys(dependencies).length === 0 && attempt < retries; attempt++) {
    console.warn(
      `Resolved an empty dependency list for project '${ context.projectName }' despite local ` +
      `project dependencies in the graph (attempt ${ attempt }/${ retries }). A dependency's ` +
      `package.json may be mid-rewrite by a concurrent build — retrying in ${ sleep * attempt }ms.`,
    );
    await new Promise(resolve => setTimeout(resolve, sleep * attempt));
    dependencies = await GetAllPackageDependenciesForProjectWihRetry(context);
  }

  if (hasLocalProjectDependencies && Object.keys(dependencies).length === 0) {
    throw new Error(
      `Resolved an empty dependency list for project '${ context.projectName }', but the project ` +
      `graph reports local project dependencies. This usually means a dependency's package.json ` +
      `was rewritten by a concurrent build while it was being read. Re-run the target or ensure ` +
      `dependencies are built before 'generate-package-json'.`,
    );
  }

  if (!options.includeLocalProjects) {
    // remove all packages that reference a local project
    for (const packageName of Object.keys(dependencies)) {
      if (HasProjectWithPackageName(packageName)) {
        delete dependencies[packageName];
      }
    }
  }

  console.log('resolved local published package dependencies', JSON.stringify(dependencies));

  if (options.dependencies) {
    console.log('adding dependencies from options', options.dependencies.join(', '));
    const rootPackageJson: PackageJson = await jsonFileWithRetry(join(context.root, 'package.json'));
    for (const dependency of options.dependencies) {
      dependencies[dependency] = rootPackageJson.dependencies?.[dependency] ??
                                 rootPackageJson.devDependencies?.[dependency] ?? 'latest';
    }
  }

  const packageJson = { dependencies, name: context.projectName, private: true, version: '0.0.0' };

  console.log('generated package.json', JSON.stringify(packageJson));

  writeFileSync(join(GetProjectRoot(context), 'package.json'), JSON.stringify(packageJson, null, 2));

  return {
    success: true,
  };
}
