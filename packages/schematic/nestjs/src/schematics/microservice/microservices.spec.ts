import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { createFullWorkspace } from '@rxap/schematics-utilities';
import { join } from 'path';
import { NormalizeFeatureMicroserviceOptions } from '../feature-microservice';
import { NormalizeFrontendMicroserviceOptions } from '../frontend-microservice';
import { NormalizeMicroserviceOptions } from './index';

const external = jest.fn();
const internal = jest.fn();

jest.mock('@rxap/schematics-utilities', () => {
  const actual = jest.requireActual('@rxap/schematics-utilities');
  const root = (name: string) => name.replace(/^service-/, 'service/').replace(/^service\/feature-/, 'service/feature/').replace(/^service\/frontend-/, 'service/frontend/');
  return {
    ...actual,
    ExecuteExternalSchematic: (collection: string, name: string, options: any) => (tree: any) => {
      external(collection, name, options);
      if (collection === '@nx/nest') {
        actual.createNestApplication(tree, `${options.directory}-${options.name}`.replace(/\//g, '-'), `${options.directory}/${options.name}`);
      }
    },
    ExecuteSchematic: (name: string, options: any) => (tree: any) => {
      internal(name, options);
      if (name === 'microservice') {
        const dir = options.directory;
        actual.createNestApplication(tree, `${dir.replace(/\//g, '-')}-${options.name}`, `${dir}/${options.name}`);
      }
    },
    _root: root,
  };
});

describe('microservice schematics', () => {
  const runner = new SchematicTestRunner('schematics', join(__dirname, '../../../collection.json'));
  let tree: UnitTestTree;

  beforeEach(() => {
    external.mockClear();
    internal.mockClear();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    tree = createFullWorkspace().tree;
  });
  afterEach(() => jest.restoreAllMocks());

  describe('NormalizeMicroserviceOptions', () => {
    it('applies defaults', () => {
      const n = NormalizeMicroserviceOptions({ name: 'Billing' } as any);
      expect(n.directory).toBe('service');
      expect(n.name).toBe('billing');
      expect(n.projectName).toBe('service-billing');
      expect(n.imageSuffix).toBe('/service/billing');
      expect(n.apiPrefix).toBe('api/billing');
      expect(n.port).toBeGreaterThanOrEqual(3000);
      expect(n.port).toBeLessThan(4000);
      expect(n.dsn).toBeNull();
      expect(n.overwrite).toBe(false);
    });

    it('uses explicit options and strips the directory prefix from the name', () => {
      const n = NormalizeMicroserviceOptions({
        name: 'service-billing',
        directory: 'service',
        randomPort: false,
        dsn: 'dsn',
        port: 0,
        imageSuffix: '/x',
        apiPrefix: 'p',
        openApi: true,
        jwt: true,
        overwrite: true,
        apiConfigurationFile: 'api.json',
      } as any);
      expect(n.name).toBe('billing');
      expect(n.port).toBe(3000);
      expect(n.imageSuffix).toBe('/x');
      expect(n.apiPrefix).toBe('p');
      expect(n.openApi && n.jwt && n.overwrite).toBe(true);
      expect(NormalizeMicroserviceOptions({ name: 'a', port: 4242 } as any).port).toBe(4242);
    });
  });

  it('NormalizeFeatureMicroserviceOptions applies defaults', () => {
    const n = NormalizeFeatureMicroserviceOptions({ feature: 'Orders' } as any);
    expect(n.name).toBe('orders');
    expect(n.directory).toBe('service/feature');
    expect(n.projectName).toBe('service-feature-orders');
    expect(n.apiPrefix).toBe('api/feature/orders');
    expect(n.imageSuffix).toBe('/service/feature/orders');
    expect(n.randomPort).toBe(true);
    const custom = NormalizeFeatureMicroserviceOptions({
      feature: 'x', directory: 'a/b', port: 1, randomPort: false, imageSuffix: '/s', apiPrefix: 'p', openApi: true, jwt: true, overwrite: true,
    } as any);
    expect(custom.projectName).toBe('a-b-x');
    expect(custom.port).toBe(1);
    expect(custom.jwt).toBe(true);
  });

  it('NormalizeFrontendMicroserviceOptions applies defaults', () => {
    const n = NormalizeFrontendMicroserviceOptions({ frontend: 'Admin', feature: 'Orders' } as any);
    expect(n.projectName).toContain('admin');
    expect(n.directory).toBe('service/app/admin');
    const custom = NormalizeFrontendMicroserviceOptions({
      frontend: 'a', feature: 'b', directory: 'x', imageSuffix: '/s', apiPrefix: 'p', port: 5, randomPort: false, dsn: 'd', openApi: true, jwt: true, overwrite: true,
    } as any);
    expect(custom.apiPrefix).toBe('p');
    expect(custom.port).toBe(5);
  });

  it('microservice generates the application and configures it', async () => {
    tree.create('/api.json', '{}');
    const result = await runner.runSchematic(
      'microservice',
      { name: 'billing', directory: 'service', apiConfigurationFile: '/api.json', dsn: 'dsn', openApi: true, jwt: true, overwrite: false },
      tree,
    );
    expect(external).toHaveBeenCalledWith('@nx/nest', 'application', expect.objectContaining({ name: 'billing', directory: 'service' }));
    expect(external).toHaveBeenCalledWith('@nx/workspace', 'run-commands', expect.objectContaining({ project: 'service-billing' }));
    expect(internal).toHaveBeenCalledWith('init', expect.objectContaining({ project: 'service-billing', openApi: true, jwt: true, sentryDsn: 'dsn' }));
    expect(JSON.parse(result.readContent('/api.json'))['service-billing']).toEqual({ baseUrl: '/api/billing' });
    const project = JSON.parse(result.readContent('/service/billing/project.json'));
    expect(project.tags).toEqual(expect.arrayContaining(['service', 'nest', 'sentry', 'open-api']));
    expect(result.readContent('/service/billing/src/app/app.module.ts')).toContain('Module');
  });

  it('microservice works without an api configuration file', async () => {
    await runner.runSchematic('microservice', { name: 'plain' }, tree);
    expect(internal).toHaveBeenCalledWith('init', expect.objectContaining({ project: 'service-plain' }));
  });

  it('feature-microservice delegates to the microservice schematic', async () => {
    const result = await runner.runSchematic('feature-microservice', { feature: 'orders' }, tree);
    expect(internal).toHaveBeenCalledWith('microservice', expect.objectContaining({ name: 'orders', directory: 'service/feature' }));
    expect(result.exists('/service/feature/orders/project.json')).toBe(true);
  });

  it('frontend-microservice delegates to the microservice schematic', async () => {
    const options = { frontend: 'admin', feature: 'orders' };
    const normalized = NormalizeFrontendMicroserviceOptions(options as any);
    await runner.runSchematic('frontend-microservice', options, tree);
    expect(internal).toHaveBeenCalledWith('microservice', expect.objectContaining({ name: normalized.name }));
  });
});
