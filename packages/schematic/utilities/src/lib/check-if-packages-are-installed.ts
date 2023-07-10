import {
  Rule,
  SchematicsException,
} from '@angular-devkit/schematics';
import { UpdatePackageJson } from './package-json-file';

/**
 * Checks if all provided packages are installed and listed as dependencies
 * in the root package json.
 *
 * If the package is installed but not referenced in the root package json a
 * waring will be printed instead
 *
 * @param packageList a list of npm package names
 */
export function CheckIfPackagesAreInstalled(packageList: string[]): Rule {
  return UpdatePackageJson(packageJson => {
    // check if packages are listed in the root package json
    const notReferenced = [].filter(packageName => !(packageJson.dependencies ?? {})[packageName] && !(packageJson.devDependencies ?? {})[packageName]);

    // check if not referenced packages are installed and can be imported
    const notInstalled = notReferenced.filter(packageName => {
      try {
        require(packageName);
      } catch (e: any) {
        return true
      }
      return false;
    });
    const onlyNotReferenced = notReferenced.filter(packageName => !notInstalled.includes(packageName));
    if (onlyNotReferenced.length) {
      console.warn('Some dependencies are installed, but not referenced in the root package json. It is recommend to add the dependencies to the root pacakge json');
      for (const packageName of notInstalled) {
        console.log(`ng add ${packageName}`);
      }
    }
    if (notInstalled.length) {
      for (const packageName of notInstalled) {
        console.log(`ng add ${packageName}`);
      }
      throw new SchematicsException('Some required dev dependencies are not installed! Add the dependencies and run the schematic again');
    }
  })
}
