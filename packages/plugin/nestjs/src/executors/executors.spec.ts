jest.mock('@rxap/node-utilities', () => ({ jsonFileWithRetry: jest.fn() }));
jest.mock('@rxap/plugin-utilities', () => ({
  GetProjectConfiguration: jest.fn(),
  GetAllPackageDependenciesForProjectWihRetry: jest.fn(),
  GetProjectRoot: jest.fn(() => 'apps/x'),
  HasProjectWithPackageName: jest.fn((name: string) =>
    name.startsWith('@local/'),
  ),
  LoadProjectToPackageMappingWithRetry: jest.fn(async () => undefined),
  GetDependentProjectsForProject: jest.fn(() => []),
  GuessOutputPathFromContext: jest.fn(() => 'swagger/apps/x'),
}));
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  writeFileSync: jest.fn(),
  existsSync: jest.fn(),
}));
jest.mock('@nx/devkit', () => ({
  ...jest.requireActual('@nx/devkit'),
  runExecutor: jest.fn(async () => undefined),
}));
jest.mock('./swagger-generate/node-executor', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('nx/src/executors/run-commands/run-commands.impl', () => ({
  __esModule: true,
  default: jest.fn(),
}));

import * as devkit from '@nx/devkit';
import nodeExecutor from './swagger-generate/node-executor';
import { jsonFileWithRetry } from '@rxap/node-utilities';
import * as pu from '@rxap/plugin-utilities';
import { existsSync, writeFileSync } from 'fs';
import run from 'nx/src/executors/run-commands/run-commands.impl';
import { isLegacyConfiguration } from './is-legacy-configuration';
import packageJsonExecutor from './package-json/executor';
import swaggerGenerateExecutor from './swagger-generate/executor';

describe('plugin-nestjs executors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => jest.restoreAllMocks());

  describe('isLegacyConfiguration', () => {
    it('detects the webpack executor', () => {
      (pu.GetProjectConfiguration as jest.Mock).mockReturnValue({
        targets: { build: { executor: '@nx/webpack:webpack' } },
      });
      expect(isLegacyConfiguration({} as any)).toBe(true);
      (pu.GetProjectConfiguration as jest.Mock).mockReturnValue({
        targets: { build: { executor: 'x' } },
      });
      expect(isLegacyConfiguration({} as any)).toBe(false);
      (pu.GetProjectConfiguration as jest.Mock).mockReturnValue({});
      expect(isLegacyConfiguration({} as any)).toBe(false);
    });
  });

  describe('package-json', () => {
    const context: any = {
      root: '/ws',
      projectName: 'x',
      projectGraph: { dependencies: { x: [] } },
    };
    const getDeps = pu.GetAllPackageDependenciesForProjectWihRetry as jest.Mock;

    it('writes the package.json without local projects', async () => {
      getDeps.mockResolvedValue({ a: '1', '@local/b': '2' });
      const result = await packageJsonExecutor({} as any, context);
      expect(result).toEqual({ success: true });
      const written = JSON.parse((writeFileSync as jest.Mock).mock.calls[0][1]);
      expect(written).toEqual({
        dependencies: { a: '1' },
        name: 'x',
        private: true,
        version: '0.0.0',
      });
    });

    it('keeps local projects when requested and adds option dependencies', async () => {
      getDeps.mockResolvedValue({ '@local/b': '2' });
      (jsonFileWithRetry as jest.Mock).mockResolvedValue({
        dependencies: { c: '3' },
        devDependencies: { d: '4' },
      });
      await packageJsonExecutor(
        { includeLocalProjects: true, dependencies: ['c', 'd', 'e'] } as any,
        context,
      );
      const written = JSON.parse((writeFileSync as jest.Mock).mock.calls[0][1]);
      expect(written.dependencies).toEqual({
        '@local/b': '2',
        c: '3',
        d: '4',
        e: 'latest',
      });
    });

    it('fails when dependencies stay empty despite local dependencies', async () => {
      jest.useFakeTimers();
      getDeps.mockResolvedValue({});
      const ctx = {
        ...context,
        projectGraph: { dependencies: { x: [{ target: 'y' }] } },
      };
      const promise = packageJsonExecutor({} as any, ctx);
      const assertion = expect(promise).rejects.toThrow(
        'Resolved an empty dependency list',
      );
      await jest.runAllTimersAsync();
      await assertion;
      expect(getDeps).toHaveBeenCalledTimes(3);
      jest.useRealTimers();
    });

    it('recovers when a retry returns dependencies', async () => {
      jest.useFakeTimers();
      getDeps.mockResolvedValueOnce({}).mockResolvedValueOnce({ a: '1' });
      const ctx = {
        ...context,
        projectGraph: { dependencies: { x: [{ target: 'y' }] } },
      };
      const promise = packageJsonExecutor({} as any, ctx);
      await jest.runAllTimersAsync();
      expect(await promise).toEqual({ success: true });
      jest.useRealTimers();
    });
  });

  describe('swagger-generate', () => {
    const modern: any = {
      root: '/ws',
      projectName: 'x',
      projectsConfigurations: {
        projects: { dep: { targets: { linking: {} } }, other: { targets: {} } },
      },
    };
    const mockLegacy = (legacy: boolean) =>
      (pu.GetProjectConfiguration as jest.Mock).mockReturnValue({
        targets: { build: { executor: legacy ? '@nx/webpack:webpack' : 'x' } },
      });

    it('links dependent libraries', async () => {
      mockLegacy(false);
      (pu.GetDependentProjectsForProject as jest.Mock).mockReturnValueOnce([
        'dep',
        'other',
      ]);
      (run as jest.Mock).mockResolvedValue({ success: false });
      await swaggerGenerateExecutor({} as any, modern);
      expect(devkit.runExecutor).toHaveBeenCalledTimes(1);
      expect(devkit.runExecutor).toHaveBeenCalledWith(
        { project: 'dep', target: 'linking' },
        {},
        modern,
      );
    });

    it('returns the run result on failure (modern)', async () => {
      mockLegacy(false);
      (run as jest.Mock).mockResolvedValue({ success: false });
      expect(await swaggerGenerateExecutor({} as any, modern)).toEqual({
        success: false,
      });
    });

    it('succeeds when openapi.json exists (modern)', async () => {
      mockLegacy(false);
      (run as jest.Mock).mockResolvedValue({ success: true });
      (existsSync as jest.Mock).mockReturnValue(true);
      expect(await swaggerGenerateExecutor({} as any, modern)).toEqual({
        success: true,
      });
      expect((run as jest.Mock).mock.calls[0][0].args[0]).toBe(
        'swagger/apps/x/main.js',
      );
    });

    it('fails when openapi.json is missing (modern, standalone)', async () => {
      mockLegacy(false);
      (pu.GetProjectRoot as jest.Mock).mockReturnValueOnce('.');
      (run as jest.Mock).mockResolvedValue({ success: true });
      (existsSync as jest.Mock).mockReturnValue(false);
      expect(await swaggerGenerateExecutor({} as any, modern)).toEqual({
        success: false,
      });
      expect((run as jest.Mock).mock.calls[0][0].args[0]).toBe(
        'swagger/x/main.js',
      );
    });

    function events(...list: any[]) {
      return (async function* () {
        for (const e of list) {
          yield e;
        }
      })();
    }

    it('fails when the node executor fails (legacy)', async () => {
      mockLegacy(true);
      (nodeExecutor as jest.Mock).mockReturnValue(events({ success: false }));
      expect(
        await swaggerGenerateExecutor({ buildTarget: 'x:b' } as any, modern),
      ).toEqual({ success: false });
    });

    it('succeeds when the openapi file exists (legacy)', async () => {
      mockLegacy(true);
      (nodeExecutor as jest.Mock).mockReturnValue(events({ success: true }));
      (existsSync as jest.Mock).mockReturnValue(true);
      expect(await swaggerGenerateExecutor({} as any, modern)).toEqual({
        success: true,
      });
    });

    it('fails when the openapi file is missing (legacy)', async () => {
      mockLegacy(true);
      (nodeExecutor as jest.Mock).mockReturnValue(events({ success: true }));
      (existsSync as jest.Mock).mockReturnValue(false);
      expect(await swaggerGenerateExecutor({} as any, modern)).toEqual({
        success: false,
      });
    });
  });
});
