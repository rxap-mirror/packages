import {
  readJson,
  Tree,
  writeJson,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { applicationGenerator } from '@nx/nest/src/generators/application/application';
import healthIndicatorInitGenerator from './health-indicator-init/generator';
import healthIndicatorGenerator from './health-indicator/generator';
import jwtGenerator from './jwt/generator';
import openApiGenerator from './open-api/generator';
import sentryGenerator from './sentry/generator';
import validatorGenerator from './validator/generator';

describe('plugin-nestjs feature generators', () => {
  let tree: Tree;

  beforeEach(async () => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    tree = createTreeWithEmptyWorkspace();
    const pkg = readJson(tree, 'package.json');
    pkg.dependencies = { ...(pkg.dependencies ?? {}), '@nestjs/core': '11.1.1' };
    writeJson(tree, 'package.json', pkg);
    await applicationGenerator(tree, { name: 'api', directory: 'api', skipFormat: true } as any);
  }, 60000);

  afterEach(() => jest.restoreAllMocks());

  const deps = () => {
    const pkg = readJson(tree, 'package.json');
    return { ...pkg.dependencies, ...pkg.devDependencies };
  };

  it('validator adds the packages', async () => {
    await validatorGenerator(tree, { project: 'api' } as any);
    expect(deps()['class-validator']).toBeDefined();
    expect(deps()['class-transformer']).toBeDefined();
  });

  it('jwt wires the module and config', async () => {
    await jwtGenerator(tree, { project: 'api' } as any);
    const module = tree.read('api/src/app/app.module.ts', 'utf-8');
    expect(module).toContain('JwtModule.registerAsync');
    expect(module).toContain('JwtGuardProvider');
    const config = tree.read('api/src/app/app.config.ts', 'utf-8');
    expect(config).toContain('JWT_SECRET');
    expect(config).toContain('JWT_AUTH_HEADER');
    expect(deps()['@rxap/nest-jwt']).toBeDefined();
    expect(deps()['@nestjs/jwt']).toBeDefined();
  }, 60000);

  it('sentry wires the module and config', async () => {
    await sentryGenerator(tree, { project: 'api' } as any);
    const module = tree.read('api/src/app/app.module.ts', 'utf-8');
    expect(module).toContain('SentryModule.forRoot()');
    expect(module).toContain('SentryLoggerModule.registerAsync');
    expect(tree.read('api/src/app/app.config.ts', 'utf-8')).toContain('sentryValidationSchema');
    expect(deps()['@rxap/nest-sentry']).toBeDefined();
    expect(deps()['@sentry/nestjs']).toBeDefined();
  }, 60000);

  it('open-api wires the module, config and asset', async () => {
    await openApiGenerator(tree, { project: 'api' } as any);
    expect(tree.read('api/src/app/app.module.ts', 'utf-8')).toContain('OpenApiModule.registerAsync');
    expect(tree.read('api/src/app/app.config.ts', 'utf-8')).toContain('OPEN_API_SERVER_CONFIG_FILE_PATH');
    expect(tree.read('api/src/assets/open-api-server-config.json', 'utf-8')).toBe('[]');
    expect(deps()['@rxap/nest-open-api']).toBeDefined();
  }, 60000);

  it('health-indicator-init creates the health module and controller', async () => {
    await healthIndicatorInitGenerator(tree, { project: 'api' } as any);
    expect(tree.exists('api/src/app/health/health.module.ts')).toBe(true);
    expect(tree.exists('api/src/app/health/health.controller.ts')).toBe(true);
    expect(tree.read('api/src/app/app.module.ts', 'utf-8')).toContain('HealthModule');
    expect(deps()['@nestjs/terminus']).toBeDefined();
  }, 60000);

  it('health-indicator creates an indicator', async () => {
    await healthIndicatorGenerator(tree, { project: 'api', name: 'database' } as any);
    expect(tree.exists('api/src/app/health/database.health-indicator.ts')).toBe(true);
    expect(tree.read('api/src/app/health/health.module.ts', 'utf-8')).toContain('DatabaseHealthIndicator');
    expect(tree.read('api/src/app/health/health.controller.ts', 'utf-8')).toContain('database');
  }, 60000);
});
