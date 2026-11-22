import { ExecutorContext } from '@nx/devkit';
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import checkVersion from './check-version/executor';
import generateSchema from './generate-schema/executor';
import nodeModulesLinking from './node-modules-linking/executor';
import updateDependencies from './update-dependencies/executor';

const utilities = {
  readPackageJsonForProjectWithRetry: jest.fn(),
  readRootPackageJson: jest.fn(),
  getDirectPackageDependenciesForProjectWihRetry: jest.fn(),
  writePackageJsonFormProject: jest.fn(),
  GuessOutputPathFromContext: jest.fn(),
  GetProjectRoot: jest.fn(),
};
jest.mock('@rxap/plugin-utilities', () => ({
  readPackageJsonForProjectWithRetry: (...args: any[]) => utilities.readPackageJsonForProjectWithRetry(...args),
  readRootPackageJson: (...args: any[]) => utilities.readRootPackageJson(...args),
  getDirectPackageDependenciesForProjectWihRetry: (...args: any[]) => utilities.getDirectPackageDependenciesForProjectWihRetry(...args),
  writePackageJsonFormProject: (...args: any[]) => utilities.writePackageJsonFormProject(...args),
  GuessOutputPathFromContext: (...args: any[]) => utilities.GuessOutputPathFromContext(...args),
  GetProjectRoot: (...args: any[]) => utilities.GetProjectRoot(...args),
}));

describe('library executors', () => {

  const context = { root: '/ws', projectName: 'lib' } as ExecutorContext;

  beforeEach(() => {
    Object.values(utilities).forEach(fn => fn.mockReset());
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => jest.restoreAllMocks());

  describe('check-version', () => {

    function setup(project: any, root: any) {
      utilities.readPackageJsonForProjectWithRetry.mockResolvedValue(project);
      utilities.readRootPackageJson.mockResolvedValue(root);
    }

    it('should succeed for compatible versions', async () => {
      setup({ version: '19.1.0-dev.2' }, { devDependencies: { '@angular/core': '~19.0.0' } });
      expect(await checkVersion({ packageName: '@angular/core' } as any, context)).toEqual({ success: true });
    });

    it('should read from dependencies as well', async () => {
      setup({ version: '19.1.0' }, { dependencies: { a: '^19.0.0' } });
      expect(await checkVersion({ packageName: 'a' } as any, context)).toEqual({ success: true });
    });

    it('should fail if the package is missing', async () => {
      setup({ version: '1.0.0' }, {});
      expect(await checkVersion({ packageName: 'a' } as any, context)).toEqual({ success: false });
    });

    it('should fail for unparsable versions', async () => {
      setup({ version: '1.0.0' }, { dependencies: { a: 'latest' } });
      expect(await checkVersion({ packageName: 'a' } as any, context)).toEqual({ success: false });
    });

    it('should fail without project version', async () => {
      setup({}, { dependencies: { a: '1.0.0' } });
      expect(await checkVersion({ packageName: 'a' } as any, context)).toEqual({ success: false });
    });

    it('should fail for incompatible versions unless upgrading the workspace', async () => {
      setup({ version: '18.0.0' }, { dependencies: { a: '19.0.0' } });
      expect(await checkVersion({ packageName: 'a' } as any, context)).toEqual({ success: false });
      process.env['WORKSPACE_UPGRADE'] = 'true';
      try {
        expect(await checkVersion({ packageName: 'a' } as any, context)).toEqual({ success: true });
      } finally {
        delete process.env['WORKSPACE_UPGRADE'];
      }
    });

  });

  describe('update-dependencies', () => {
    it('should replace versions of direct dependencies', async () => {
      const packageJson = {
        dependencies: { a: '1.0.0', b: '1.0.0' },
        peerDependencies: { a: '*' },
        optionalDependencies: undefined,
      };
      utilities.readPackageJsonForProjectWithRetry.mockResolvedValue(packageJson);
      utilities.getDirectPackageDependenciesForProjectWihRetry.mockResolvedValue({ a: '2.0.0' });
      expect(await updateDependencies({}, context)).toEqual({ success: true });
      expect(packageJson.dependencies).toEqual({ a: '^2.0.0', b: '1.0.0' });
      expect(packageJson.peerDependencies).toEqual({ a: '^2.0.0' });
      expect(utilities.writePackageJsonFormProject).toHaveBeenCalledWith(context, packageJson);
    });
  });

  describe('node-modules-linking', () => {

    let root: string;

    beforeEach(() => {
      root = mkdtempSync(join(tmpdir(), 'nm-link-'));
      utilities.GuessOutputPathFromContext.mockReturnValue('dist/libs/lib');
    });

    afterEach(() => rmSync(root, { recursive: true, force: true }));

    it('should fail without package.json', async () => {
      expect(await nodeModulesLinking({}, { ...context, root })).toEqual({ success: false });
    });

    it('should create the symlink once', async () => {
      mkdirSync(join(root, 'dist/libs/lib'), { recursive: true });
      writeFileSync(join(root, 'dist/libs/lib/package.json'), JSON.stringify({ name: '@scope/lib' }));
      expect(await nodeModulesLinking({}, { ...context, root })).toEqual({ success: true });
      const link = join(root, 'dist/node_modules/@scope/lib');
      expect(lstatSync(link).isSymbolicLink()).toBe(true);
      expect(await nodeModulesLinking({}, { ...context, root })).toEqual({ success: true });
    });

  });

  describe('generate-schema', () => {

    let root: string;
    const originalCwd = process.cwd();

    beforeEach(() => {
      root = mkdtempSync(join(tmpdir(), 'gen-schema-'));
      process.chdir(root);
      mkdirSync(join(root, 'libs/lib/src/generators/init'), { recursive: true });
      mkdirSync(join(root, 'libs/lib/src/executors/build'), { recursive: true });
      mkdirSync(join(root, 'libs/lib/node_modules/x'), { recursive: true });
      writeFileSync(join(root, 'libs/lib/node_modules/x/schema.json'), '{');
      utilities.GetProjectRoot.mockReturnValue('libs/lib');
    });

    afterEach(() => {
      process.chdir(originalCwd);
      rmSync(root, { recursive: true, force: true });
    });

    it('should generate declaration files next to the schemas', async () => {
      const schema = { $schema: 'http://json-schema.org/schema', $id: 'Init', title: 'Init', type: 'object', properties: { a: { type: 'string' } } };
      writeFileSync(join(root, 'libs/lib/src/generators/init/schema.json'), JSON.stringify(schema));
      writeFileSync(join(root, 'libs/lib/src/executors/build/schema.json'), JSON.stringify({ ...schema, $id: 'Build', title: 'Build' }));
      const result = await generateSchema({}, { ...context, root });
      expect(result).toEqual({ success: true });
      expect(readFileSync(join(root, 'libs/lib/src/generators/init/schema.d.ts'), 'utf-8')).toContain('InitGeneratorSchema');
      expect(readFileSync(join(root, 'libs/lib/src/executors/build/schema.d.ts'), 'utf-8')).toContain('BuildExecutorSchema');
      expect(existsSync(join(root, 'libs/lib/node_modules/x/schema.d.ts'))).toBe(false);
    });

    it('should fail for invalid schemas', async () => {
      writeFileSync(join(root, 'libs/lib/src/generators/init/schema.json'), '{');
      await expect(generateSchema({}, { ...context, root })).rejects.toThrow('failed to parse schema');
    });

  });

});
