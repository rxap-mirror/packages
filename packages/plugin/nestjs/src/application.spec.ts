const mockProjects: Record<string, any> = {};
const mockExists = jest.fn();

jest.mock('@rxap/workspace-utilities', () => ({
  FsTree: jest.fn(),
  FindProjectByPath: jest.fn((_tree: unknown, path: string) => mockProjects[path] ?? null),
}));
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: (...args: unknown[]) => mockExists(...args),
}));

import { createNodesV2, normalizeOptions } from './application';

const [, createNodesFn] = createNodesV2;
const context: any = { workspaceRoot: '/ws' };

describe('plugin-nestjs application plugin', () => {
  beforeEach(() => {
    for (const key of Object.keys(mockProjects)) {
      delete mockProjects[key];
    }
    mockExists.mockReset().mockReturnValue(false);
  });

  it('normalizes options', () => {
    expect(normalizeOptions(undefined)).toEqual({});
    expect(normalizeOptions({})).toEqual({});
  });

  it('exposes a glob pattern', () => {
    expect(createNodesV2[0]).toContain('tsconfig.app.json');
  });

  it('skips paths that are not a project root', async () => {
    expect(await createNodesFn(['apps/x/src/main.ts'], {}, context)).toEqual([]);
  });

  it('skips angular projects', async () => {
    mockProjects['apps/x/src'] = { root: 'apps/x', tags: ['angular'] };
    expect(await createNodesFn(['apps/x/src/main.ts'], {}, context)).toEqual([]);
  });

  it('skips projects with an index.html', async () => {
    mockProjects['apps/x/src'] = { root: 'apps/x' };
    mockExists.mockImplementation((p: string) => p.endsWith('src/index.html'));
    expect(await createNodesFn(['apps/x/src/main.ts'], {}, context)).toEqual([]);
  });

  it('creates the package json target for non root projects', async () => {
    mockProjects['apps/x/src'] = { root: 'apps/x' };
    const result: any = await createNodesFn(['apps/x/src/main.ts'], {}, context);
    expect(result).toHaveLength(1);
    expect(result[0][0]).toBe('apps/x/src/main.ts');
    expect(result[0][1].projects['apps/x/src'].targets['generate-package-json'].executor)
      .toBe('@rxap/plugin-nestjs:package-json');
    expect(result[0][1].projects['apps/x/src'].targets['swagger-build']).toBeUndefined();
  });

  it('creates swagger targets for the modern configuration', async () => {
    mockProjects['apps/x'] = { root: 'apps/x', targets: {} };
    mockExists.mockImplementation((p: string) => p.endsWith('src/swagger.ts'));
    const result: any = await createNodesFn(['apps/x/tsconfig.app.json'], {}, context);
    const targets = result[0][1].projects['apps/x'].targets;
    expect(targets['swagger-build'].executor).toBe('nx:run-commands');
    expect(targets['swagger-build'].outputs).toEqual(['{workspaceRoot}/swagger/{projectRoot}']);
    expect(targets['swagger-generate'].defaultConfiguration).toBe('swagger');
  });

  it('creates swagger targets for root projects', async () => {
    mockProjects['.'] = { root: '.', targets: {} };
    mockExists.mockImplementation((p: string) => p.endsWith('src/swagger.ts'));
    const result: any = await createNodesFn(['./tsconfig.app.json'], {}, context);
    const targets = result[0][1].projects['.'].targets;
    expect(targets['generate-package-json']).toBeUndefined();
    expect(targets['swagger-build'].outputs).toEqual(['{workspaceRoot}/swagger/{projectName}']);
  });

  it('creates swagger targets for the legacy configuration', async () => {
    mockProjects['apps/x'] = { root: 'apps/x', targets: { build: { executor: '@nx/webpack:webpack' } } };
    mockExists.mockReturnValue(true);
    mockExists.mockImplementation((p: string) => !p.endsWith('index.html'));
    const result: any = await createNodesFn(['apps/x/tsconfig.app.json'], {}, context);
    const targets = result[0][1].projects['apps/x'].targets;
    expect(targets['swagger-build'].executor).toBe('@nx/webpack:webpack');
    expect(targets['swagger-build'].options.fileReplacements).toHaveLength(1);
    expect(targets['swagger-generate'].dependsOn).toEqual(['swagger-build']);
  });

  it('creates legacy swagger targets without file replacements', async () => {
    mockProjects['apps/x'] = { root: 'apps/x', targets: { build: { executor: '@nx/webpack:webpack' } } };
    mockExists.mockImplementation((p: string) => p.endsWith('src/swagger.ts'));
    const result: any = await createNodesFn(['apps/x/tsconfig.app.json'], {}, context);
    expect(result[0][1].projects['apps/x'].targets['swagger-build'].options.fileReplacements).toBeUndefined();
  });
});
