jest.mock('prettier', () => ({ format: async (text: string) => text, resolveConfig: async () => null }));

const generatorFns = {
  GenerateDataSource: jest.fn(), GenerateDirectives: jest.fn(), GenerateHttpResource: jest.fn(),
  GenerateRemoteMethod: jest.fn(), GenerateOperationCommand: jest.fn(),
};
const generateInterfaces = jest.fn();
const generateOperation = jest.fn();
jest.mock('@rxap/workspace-open-api', () => ({
  ...generatorFns,
  GenerateInterfaces: (...a: any[]) => generateInterfaces(...a),
  GenerateOperation: (...a: any[]) => generateOperation(...a),
  LoadOpenApiConfig: jest.fn(async () => ({ openapi: '3.0.0', info: { title: 'x', version: '1' }, paths: {} })),
}));
const transform = jest.fn(async (_tree: any, _opts: any, cb: any) => cb({}));
jest.mock('@rxap/workspace-ts-morph', () => ({ TsMorphAngularProjectTransform: (...a: any[]) => (transform as any)(...a) }));
const indexExport = jest.fn();
jest.mock('@rxap/plugin-library', () => ({
  ...jest.requireActual('@rxap/plugin-library'),
  LibraryIndexExportGenerator: (...a: any[]) => indexExport(...a),
  LibraryInitProject: jest.fn(async () => undefined),
  LibraryInitWorkspace: jest.fn(),
}));

import {
  addProjectConfiguration,
  readNxJson,
  readProjectConfiguration,
  writeJson,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import generateGenerator from './generate/generator';
import initGenerator from './init/generator';
import initLibraryGenerator from './init-library/generator';
import { getSwaggerBuildOutputPath } from './init-library/get-swagger-build-output-path';

function setup() {
  const tree = createTreeWithEmptyWorkspace();
  addProjectConfiguration(tree, 'open-api-svc', {
    root: 'open-api/svc',
    sourceRoot: 'open-api/svc/src',
    projectType: 'library',
    prefix: 'svc',
    targets: { build: { executor: '@nx/js:tsc', options: {} } },
  } as any);
  tree.write('open-api/svc/src/index.ts', `export * from './lib/open-api-svc';\nexport const a = 1;\n`);
  tree.write('open-api/svc/src/lib/open-api-svc.ts', 'export {};');
  tree.write('open-api/svc/src/lib/open-api-svc.spec.ts', 'export {};');
  tree.write('open-api/svc/src/lib/old.ts', 'export {};');
  tree.write('open-api/svc/src/openapi.json', '{}');
  tree.write('open-api/svc/.gitignore', 'src/lib\n');
  return tree;
}

describe('plugin-open-api generators', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
  });

  describe('init', () => {
    it('registers the plugin', async () => {
      const tree = createTreeWithEmptyWorkspace();
      await initGenerator(tree, { project: 'x' });
      expect(JSON.stringify(readNxJson(tree))).toContain('@rxap/plugin-open-api/plugin');
      await initGenerator(tree, { skipFormat: true });
    });
  });

  describe('init-library', () => {
    it('cleans the library and aligns tsconfig paths (generated)', async () => {
      const tree = setup();
      writeJson(tree, 'tsconfig.base.json', { compilerOptions: { paths: { 'open-api-svc': [ 'x' ] } } });
      await initLibraryGenerator(tree, { project: 'open-api-svc', skipFormat: true });
      const tsconfig = JSON.parse(tree.read('tsconfig.base.json', 'utf-8')!);
      expect(tsconfig.compilerOptions.paths['open-api-svc']).toBeUndefined();
      expect(tsconfig.compilerOptions.paths['open-api-svc/src/lib/commands']).toEqual([ 'open-api/svc/src/lib/commands/index.ts' ]);
      expect(tree.exists('open-api/svc/src/lib/open-api-svc.ts')).toBe(false);
      expect(tree.read('open-api/svc/src/index.ts', 'utf-8')).not.toContain('open-api-svc');
      expect(tree.read('open-api/svc/.gitignore', 'utf-8')).toContain('src/lib/**');
      expect(tree.read('.nxignore', 'utf-8')).toContain('!swagger/**/openapi.json');
      expect(readProjectConfiguration(tree, 'open-api-svc').targets?.['build']).toBeUndefined();
    });

    it('supports external + persistent libraries', async () => {
      const tree = setup();
      writeJson(tree, 'tsconfig.base.json', { compilerOptions: {} });
      tree.write('open-api/svc/.gitignore', 'src/lib/**\n');
      await initLibraryGenerator(tree, { project: 'open-api-svc', external: true, persistent: true });
      expect(tree.exists('open-api/svc/src/openapi.yaml')).toBe(true);
      expect(readProjectConfiguration(tree, 'open-api-svc').targets?.['generate-open-api']?.options?.serverId).toBe('svc');
      expect(tree.read('open-api/svc/.gitignore', 'utf-8')).not.toContain('src/lib/**');
    });

    it('throws without tsconfig.base.json', async () => {
      const tree = setup();
      tree.delete('tsconfig.base.json');
      await expect(initLibraryGenerator(tree, { project: 'open-api-svc' })).rejects.toThrow('tsconfig.base.json');
    });
  });

  describe('getSwaggerBuildOutputPath', () => {
    it('resolves from swagger-build, build or throws', () => {
      const tree = createTreeWithEmptyWorkspace();
      addProjectConfiguration(tree, 'a', { root: 'a', targets: { 'swagger-build': { executor: 'x', options: { outputPath: 'swagger/a' } } } });
      addProjectConfiguration(tree, 'b', { root: 'b', targets: { build: { executor: 'x', options: { outputPath: 'dist/b' } } } });
      addProjectConfiguration(tree, 'c', { root: 'c', targets: {} });
      expect(getSwaggerBuildOutputPath(tree, 'a', 'x')).toBe('swagger/a');
      expect(getSwaggerBuildOutputPath(tree, 'b', 'x')).toBe('swagger/b');
      expect(() => getSwaggerBuildOutputPath(tree, 'c', 'x')).toThrow("does not have a 'swagger-build'");
      expect(() => getSwaggerBuildOutputPath(tree, 'zzz', 'x')).toThrow('does not exists');
    });
  });

  describe('generate', () => {
    it('runs all generators and exports entry points', async () => {
      const tree = setup();
      tree.write('open-api/svc/src/lib/x.ts', 'export {}');
      tree.write('open-api/svc/angular/src/a.ts', 'export {}');
      tree.write('open-api/svc/nest/src/a.ts', 'export {}');
      await generateGenerator(tree, { project: 'open-api-svc', path: 'open-api/svc/src/openapi.json', directory: 'Foo/Bar' } as any);
      expect(tree.exists('open-api/svc/src/lib/x.ts')).toBe(false);
      expect(tree.exists('open-api/svc/src/index.ts')).toBe(false);
      expect(tree.exists('open-api/svc/angular/src/a.ts')).toBe(false);
      expect(transform).toHaveBeenCalledTimes(3);
      expect(generateOperation.mock.calls[0][3]).toHaveLength(4);
      expect(generateOperation.mock.calls[1][3]).toHaveLength(1);
      expect(indexExport.mock.calls[0][1].additionalEntryPoints).toHaveLength(9);
    });

    it('honours skip flags and no-export', async () => {
      const tree = setup();
      await generateGenerator(tree, {
        project: 'open-api-svc', path: 'p', export: false, skipHttpResource: true, skipRemoteMethod: true,
        skipDataSource: true, skipDirectives: true, skipCommand: true, skipFormat: false, inline: false,
      } as any);
      expect(generateOperation.mock.calls[0][3]).toHaveLength(0);
      expect(tree.read('open-api/svc/src/index.ts', 'utf-8')).toBe('export {};');
      expect(indexExport).not.toHaveBeenCalled();
    });

    it('limits entry points when skipped', async () => {
      const tree = setup();
      await generateGenerator(tree, {
        project: 'open-api-svc', path: 'p', skipHttpResource: true, skipRemoteMethod: true, skipDataSource: true, skipDirectives: true, skipCommand: true,
      } as any);
      expect(indexExport.mock.calls[0][1].additionalEntryPoints).toHaveLength(4);
    });
  });
});
