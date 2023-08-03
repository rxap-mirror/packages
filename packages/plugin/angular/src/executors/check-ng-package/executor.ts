import { ExecutorContext } from '@nx/devkit';
import { readFileFromProjectRoot } from '@rxap/plugin-utilities';
import { CheckNgPackageExecutorSchema } from './schema';

export default async function runExecutor(
  options: CheckNgPackageExecutorSchema,
  context: ExecutorContext,
) {
  console.log('Executor ran for CheckNgPackage', options);

  const ngPackage = JSON.parse(readFileFromProjectRoot(context, 'ng-package.json', true));
  const { dependencies } = JSON.parse(readFileFromProjectRoot(context, 'package.json', true));

  if (ngPackage.allowedNonPeerDependencies) {
    const wrongPackages: string[] = [];
    for (const packageName of ngPackage.allowedNonPeerDependencies) {
      if (!dependencies[packageName]) {
        wrongPackages.push(packageName);
      }
    }
    if (wrongPackages.length) {
      console.log(`\x1b[31mSome packages in the allowed non peer dependencies list are not in the package.json dependencies list:\x1b[0m\n - ${ wrongPackages.join(
        '\n - ') }`);
      return {
        success: false,
      };
    }
  }

  return {
    success: true,
  };
}
