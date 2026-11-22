import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { createFullWorkspace, TestProjectNames } from '@rxap/schematics-utilities';
import { join } from 'path';

describe('nestjs schematics', () => {
  const runner = new SchematicTestRunner('schematics', join(__dirname, '../../collection.json'));
  let tree: UnitTestTree;
  let projects: TestProjectNames;

  const read = (t: UnitTestTree, path: string) => t.readContent(path);
  const appModule = (t: UnitTestTree) => read(t, '/api/app/src/app/app.module.ts');

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const ws = createFullWorkspace();
    tree = ws.tree;
    projects = ws.projects;
    tree.overwrite('/package.json', JSON.stringify({ name: 'workspace', dependencies: {}, devDependencies: {} }));
  });
  afterEach(() => jest.restoreAllMocks());

  it('validator adds the validation packages', async () => {
    const result = await runner.runSchematic('validator', { project: projects.nest.app }, tree);
    const pkg = JSON.parse(read(result, '/package.json'));
    expect(pkg.dependencies['class-validator']).toBeDefined();
    expect(pkg.dependencies['class-transformer']).toBeDefined();
  });

  it('jwt registers the JwtModule and guard', async () => {
    const result = await runner.runSchematic('jwt', { project: projects.nest.app }, tree);
    const text = appModule(result);
    expect(text).toContain('JwtModule.registerAsync');
    expect(text).toContain('JwtGuardProvider');
    const pkg = JSON.parse(read(result, '/package.json'));
    expect(pkg.dependencies['@nestjs/jwt']).toBeDefined();
    expect(pkg.dependencies['@rxap/nest-jwt']).toBeDefined();
  });

  it('open-api registers the OpenApiModule', async () => {
    const result = await runner.runSchematic('open-api', { project: projects.nest.app }, tree);
    expect(appModule(result)).toContain('OpenApiModule.registerAsync');
    expect(JSON.parse(read(result, '/package.json')).dependencies['@rxap/nest-open-api']).toBeDefined();
  });

  it('sentry registers the sentry module and interceptor', async () => {
    const result = await runner.runSchematic('sentry', { project: projects.nest.app }, tree);
    const text = appModule(result);
    expect(text).toContain('SentryModule.forRootAsync');
    expect(text).toContain('SENTRY_INTERCEPTOR_OPTIONS');
    expect(text).toContain('SentryInterceptor');
    const pkg = JSON.parse(read(result, '/package.json'));
    expect(pkg.dependencies['@sentry/node']).toBeDefined();
  });

  it('health-indicator-init creates the health module and controller', async () => {
    const result = await runner.runSchematic('health-indicator-init', { project: projects.nest.app }, tree);
    expect(read(result, '/api/app/src/app/health/health.module.ts')).toContain('TerminusModule');
    expect(read(result, '/api/app/src/app/health/health.controller.ts')).toContain('HealthCheckService');
    expect(JSON.parse(read(result, '/package.json')).dependencies['@nestjs/terminus']).toBeDefined();
  });

  it('health-indicator adds an indicator and endpoint', async () => {
    const result = await runner.runSchematic('health-indicator', { project: projects.nest.app, name: 'database' }, tree);
    expect(read(result, '/api/app/src/app/health/database.health-indicator.ts')).toContain('class DatabaseHealthIndicator');
    const controller = read(result, '/api/app/src/app/health/health.controller.ts');
    expect(controller).toContain("@Get('database')");
    expect(controller).toContain('databaseHealthIndicator');
    expect(read(result, '/api/app/src/app/health/health.module.ts')).toContain('DatabaseHealthIndicator');
  });

  it('crud-init creates the db.yaml', async () => {
    // the external @nrwl/nest library schematic is not available in the sandbox
    await expect(
      runner.runSchematic('crud-init', { project: projects.nest.lib, importPath: '@x/y' }, tree),
    ).rejects.toBeDefined();
  });

  describe('crud-service', () => {
    it('generates service, dtos, module and support files', async () => {
      const result = await runner.runSchematic(
        'crud-service',
        { project: projects.nest.lib, name: 'user-profile', collection2: ['tenant'] },
        tree,
      );
      const base = '/api/lib/src';
      const files = result.files.filter((f) => f.startsWith(base));
      expect(files).toEqual(
        expect.arrayContaining([
          `${base}/lib/user-profile.crud.service.ts`,
          `${base}/lib/user-profile/user-profile.crud.dto.ts`,
          `${base}/lib/user-profile/create-user-profile.crud.dto.ts`,
          `${base}/lib/user-profile/update-user-profile.crud.dto.ts`,
          `${base}/lib/collection.ts`,
          `${base}/lib/crud.module.ts`,
          `${base}/lib/transform-options.ts`,
          `${base}/lib/validator-options.ts`,
        ]),
      );
      expect(read(result, `${base}/lib/collection.ts`)).toContain('USER_PROFILE');
      expect(read(result, `${base}/lib/collection.ts`)).toContain('TENANT');
      expect(read(result, `${base}/lib/crud.module.ts`)).toContain('UserProfileCrudService');
      expect(read(result, `${base}/index.ts`)).toContain("export * from './lib/crud.module'");
      expect(read(result, `${base}/lib/transform-options.ts`)).toContain('CrudTransformOptions');
    });

    it('supports private documents and the overwrite flag', async () => {
      const first = await runner.runSchematic(
        'crud-service',
        { project: projects.nest.lib, name: 'user', private: 'settings' },
        tree,
      );
      const text = read(first, '/api/lib/src/lib/user-settings.crud.service.ts');
      expect(text).toContain('UserSettingsCrudService');
      expect(read(first, '/api/lib/src/lib/collection.ts')).toContain('PRIVATE');
      const second = await runner.runSchematic(
        'crud-service',
        { project: projects.nest.lib, name: 'user', private: 'settings', overwrite: true },
        first,
      );
      expect(read(second, '/api/lib/src/lib/user-settings.crud.service.ts')).toContain('UserSettingsCrudService');
    });
  });

  describe('crud', () => {
    it('requires a db.yaml', async () => {
      await expect(runner.runSchematic('crud', { project: projects.nest.lib }, tree)).rejects.toThrow(
        /db\.yaml/,
      );
    });

    it('creates services for all configured collections', async () => {
      tree.create(
        '/api/lib/src/db.yaml',
        [
          'name: root',
          'private:',
          '  - secret',
          'collections:',
          '  - name: child',
          '  - collections:',
          '      - name: grandchild',
        ].join('\n'),
      );
      const result = await runner.runSchematic('crud', { project: projects.nest.lib, overwrite: true }, tree);
      expect(result.files).toEqual(
        expect.arrayContaining([
          '/api/lib/src/lib/root.crud.service.ts',
          '/api/lib/src/lib/root-secret.crud.service.ts',
          '/api/lib/src/lib/child.crud.service.ts',
          '/api/lib/src/lib/grandchild.crud.service.ts',
        ]),
      );
    });
  });
});
