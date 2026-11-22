import { ExecutorContext } from '@nx/devkit';
import {
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const utilities = {
  GetAllPackageDependenciesForProjectWihRetry: jest.fn(),
  HasProjectWithPackageName: jest.fn(),
  LoadProjectToPackageMappingWithRetry: jest.fn(),
  PackageNameToProjectName: jest.fn(),
  readPackageJsonForProjectWithRetry: jest.fn(),
  writePackageJsonFormProject: jest.fn(),
};
jest.mock('@rxap/plugin-utilities', () => ({
  GetAllPackageDependenciesForProjectWihRetry: (...args: any[]) => utilities.GetAllPackageDependenciesForProjectWihRetry(...args),
  HasProjectWithPackageName: (...args: any[]) => utilities.HasProjectWithPackageName(...args),
  LoadProjectToPackageMappingWithRetry: (...args: any[]) => utilities.LoadProjectToPackageMappingWithRetry(...args),
  PackageNameToProjectName: (...args: any[]) => utilities.PackageNameToProjectName(...args),
  readPackageJsonForProjectWithRetry: (...args: any[]) => utilities.readPackageJsonForProjectWithRetry(...args),
  writePackageJsonFormProject: (...args: any[]) => utilities.writePackageJsonFormProject(...args),
}));
jest.mock('@rxap/workspace-utilities', () => ({
  GetRootPackageJson: jest.fn(() => ({ dependencies: { '@nx/devkit': '~21.0.0' }, devDependencies: { nx: '^21.1.0' } })),
}));

describe('update-package-group executor', () => {

  let root: string;
  let context: ExecutorContext;
  let runExecutor: (options: any, context: ExecutorContext) => Promise<any>;

  beforeEach(() => {
    jest.resetModules();
    runExecutor = require('./executor').default;
    Object.values(utilities).forEach(fn => fn.mockReset());
    root = mkdtempSync(join(tmpdir(), 'package-group-'));
    writeFileSync(join(root, 'package.json'), JSON.stringify({
      dependencies: { '@nx/devkit': '1.0.0', other: '1.0.0' },
      devDependencies: { nx: '1.0.0' },
    }));
    context = { root, projectName: 'lib' } as any;
    utilities.GetAllPackageDependenciesForProjectWihRetry.mockResolvedValue({ '@nx/devkit': '19.0.0', 'unrelated': '1.0.0' });
    utilities.HasProjectWithPackageName.mockReturnValue(false);
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
    jest.restoreAllMocks();
  });

  it('should write the package group from peer dependencies and includes', async () => {
    const packageJson: any = { peerDependencies: { nx: '^20.0.0' } };
    utilities.readPackageJsonForProjectWithRetry.mockResolvedValue(packageJson);
    const result = await runExecutor({ packageGroupRegex: [ '^nx$' ], include: [ '@nx/devkit' ] }, context);
    expect(result).toEqual({ success: true });
    expect(packageJson['nx-migrations'].packageGroup).toEqual([
      { package: '@nx/devkit', version: '21.0.0' },
      { package: 'nx', version: '21.1.0' },
    ]);
    expect(utilities.writePackageJsonFormProject).toHaveBeenCalledWith(context, packageJson);
  });

  it('should include dependencies and merge with the existing group', async () => {
    const packageJson: any = {
      peerDependencies: {},
      'nx-migrations': { packageGroup: [ { package: 'existing', version: '1.0.0' }, { package: 'nx', version: '0.0.1' } ] },
    };
    utilities.readPackageJsonForProjectWithRetry.mockResolvedValue(packageJson);
    await runExecutor({ packageGroupRegex: [ '@nx/' ], includeDependencies: true, merge: true }, context);
    expect(packageJson['nx-migrations'].packageGroup.map((item: any) => item.package)).toEqual([ '@nx/devkit', 'existing', 'nx' ]);
  });

  it('should resolve peer dependencies of projects and packages', async () => {
    const projectPackageJson: any = { peerDependencies: { '@scope/other': '*', '@scope/pkg': '*', '@scope/missing': '*' } };
    utilities.readPackageJsonForProjectWithRetry.mockImplementation(async (_context: any, name?: string) =>
      name === 'other' ? { peerDependencies: { nx: '^20.0.0', '@scope/pkg': '*' } } : projectPackageJson);
    utilities.HasProjectWithPackageName.mockImplementation((name: string) => name === '@scope/other');
    utilities.PackageNameToProjectName.mockReturnValue('other');
    const result = await runExecutor({ packageGroupRegex: [ '^nx$' ] }, context);
    expect(result).toEqual({ success: true });
    expect(projectPackageJson['nx-migrations'].packageGroup).toEqual([ { package: 'nx', version: '21.1.0' } ]);
  });

  it('should fail if the nx-migrations property is not an object', async () => {
    utilities.readPackageJsonForProjectWithRetry.mockResolvedValue({ 'nx-migrations': 'invalid' });
    expect(await runExecutor({}, context)).toEqual({ success: false });
  });

});
