import { ProjectPackageJson } from '@rxap/plugin-utilities';
import { parse } from 'semver';

export function getAngularMajorVersion(rootPackageJson: ProjectPackageJson): string | null {
  let targetVersion = rootPackageJson.dependencies?.['@angular/core'] ??
                      rootPackageJson.devDependencies?.['@angular/cli'];

  if (!targetVersion) {
    console.error(`The package @angular/core and @angular/cli are not installed in the root package.json`);
    return null;
  }

  targetVersion = targetVersion.replace(/^[~^]/, '');

  const version = parse(targetVersion);

  if (!version) {
    throw new Error(`Unable to parse the version ${ targetVersion }`);
  }

  return `${ version.major }.0.0`;
}
