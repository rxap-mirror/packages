import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { createFullWorkspace, TestProjectNames } from '@rxap/schematics-utilities';
import { join } from 'path';

const externalSchematic = jest.fn();
jest.mock('@rxap/schematics-utilities', () => ({
  ...jest.requireActual('@rxap/schematics-utilities'),
  ExecuteExternalSchematic: (...args: any[]) => {
    externalSchematic(...args);
    return () => undefined;
  },
}));

describe('nestjs init schematic', () => {
  const runner = new SchematicTestRunner('schematics', join(__dirname, '../../../collection.json'));
  let tree: UnitTestTree;
  let projects: TestProjectNames;

  const read = (t: UnitTestTree, path: string) => t.readContent(path);

  beforeEach(() => {
    externalSchematic.mockClear();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const ws = createFullWorkspace();
    tree = ws.tree;
    projects = ws.projects;
    tree.overwrite('/package.json', JSON.stringify({ name: 'workspace', dependencies: {}, devDependencies: {} }));
    const project = JSON.parse(read(tree, '/api/app/project.json'));
    project.targets = { build: { options: { assets: [] } } };
    tree.overwrite('/api/app/project.json', JSON.stringify(project));
  });
  afterEach(() => jest.restoreAllMocks());

  const base = () => ({
    project: projects.nest.app,
    google: false,
    sentry: false,
    swagger: false,
    healthIndicator: false,
    validator: false,
    platform: 'express' as const,
    port: 3000,
    overwrite: false,
    openApi: false,
    jwt: false,
  });

  it('configures the app module, environment and packages', async () => {
    tree.create('/api/app/src/app/app.service.ts', `return { message: 'Hello API' };`);
    tree.create('/api/app/src/app/app.service.spec.ts', '');
    tree.create('/api/app/src/app/app.controller.spec.ts', 'should return "Hello API"');
    const result = await runner.runSchematic('init', base(), tree);
    const appModule = read(result, '/api/app/src/app/app.module.ts');
    expect(appModule).toContain('ThrottlerModule');
    expect(appModule).toContain('ConfigModule');
    expect(result.exists('/api/app/src/app/app.service.ts')).toBe(false);
    expect(result.exists('/api/app/src/app/app.service.spec.ts')).toBe(false);
    expect(result.exists('/api/app/src/app/app.controller.spec.ts')).toBe(false);
    expect(read(result, '/api/app/src/environments/environment.ts')).toContain("name: 'development'");
    expect(read(result, '/api/app/src/environments/environment.prod.ts')).toContain('production: true');
    const pkg = JSON.parse(read(result, '/package.json'));
    expect(pkg.dependencies['@nestjs/platform-express']).toBeDefined();
    expect(pkg.dependencies['helmet']).toBeDefined();
    expect(pkg.devDependencies['@rxap/plugin-docker']).toBeDefined();
    const project = JSON.parse(read(result, '/api/app/project.json'));
    expect(project.targets.build.options.generatePackageJson).toBe(true);
    expect(project.targets.build.options.assets).toEqual(
      expect.arrayContaining(['api/app/src/Dockerfile', 'api/app/src/healthcheck.js']),
    );
    expect(externalSchematic).toHaveBeenCalledWith(
      '@rxap/plugin-application',
      'init',
      expect.objectContaining({ projects: [projects.nest.app] }),
    );
    expect(externalSchematic).not.toHaveBeenCalledWith('@rxap/plugin-nestjs', 'swagger', expect.anything());
  });

  it('supports fastify, google, sentry environment and the optional schematics', async () => {
    const result = await runner.runSchematic(
      'init',
      {
        ...base(),
        platform: 'fastify',
        google: true,
        sentry: true,
        sentryDsn: 'https://x@y/1',
        swagger: true,
        validator: true,
        openApi: true,
        jwt: true,
        healthIndicatorList: ['database'],
      },
      tree,
    );
    const pkg = JSON.parse(read(result, '/package.json'));
    expect(pkg.dependencies['@nestjs/platform-fastify']).toBeDefined();
    expect(pkg.dependencies['@google-cloud/logging-winston']).toBeDefined();
    expect(pkg.dependencies['class-validator']).toBeDefined();
    expect(pkg.dependencies['@nestjs/jwt']).toBeDefined();
    expect(pkg.dependencies['@rxap/nest-open-api']).toBeDefined();
    expect(pkg.dependencies['@rxap/nest-sentry']).toBeDefined();
    expect(pkg.dependencies['@nestjs/terminus']).toBeDefined();
    expect(read(result, '/api/app/src/environments/environment.ts')).toContain('sentry');
    expect(result.exists('/api/app/src/app/health/database.health-indicator.ts')).toBe(true);
    expect(externalSchematic).toHaveBeenCalledWith('@rxap/plugin-nestjs', 'swagger', { project: projects.nest.app });
  });

  it('adds the health indicator module without a list', async () => {
    const result = await runner.runSchematic('init', { ...base(), healthIndicator: true }, tree);
    expect(result.exists('/api/app/src/app/health/health.module.ts')).toBe(true);
  });

  it('fails without a build target', async () => {
    tree.overwrite('/api/app/project.json', JSON.stringify({ name: 'api-app', root: 'api/app', sourceRoot: 'api/app/src', targets: {} }));
    await expect(runner.runSchematic('init', base(), tree)).rejects.toThrow(/build target is not defined/);
  });

  it('keeps existing service files that are not the default ones', async () => {
    tree.create('/api/app/src/app/app.service.ts', 'custom');
    tree.create('/api/app/src/app/app.controller.spec.ts', 'custom');
    const result = await runner.runSchematic('init', base(), tree);
    expect(result.exists('/api/app/src/app/app.service.ts')).toBe(true);
    expect(result.exists('/api/app/src/app/app.controller.spec.ts')).toBe(true);
  });
});
