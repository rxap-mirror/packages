jest.mock('prettier', () => ({ format: async (text: string) => text, resolveConfig: async () => null }));

import { applicationGenerator } from '@nx/angular/generators';
import { readJson, readNxJson, readProjectConfiguration, Tree, updateNxJson, writeJson } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import initApplicationGenerator from './generator';

async function setup(names: string[] = [ 'app' ]): Promise<Tree> {
  const tree = createTreeWithEmptyWorkspace();
  const pkg = readJson(tree, 'package.json');
  pkg.dependencies = { ...(pkg.dependencies ?? {}), '@angular/core': '22.1.8' };
  pkg.devDependencies = { ...(pkg.devDependencies ?? {}), '@angular/cli': '22.1.9' };
  writeJson(tree, 'package.json', pkg);
  // the `init` generator configures the `.component` file suffix
  const nxJson = readNxJson(tree) ?? {};
  nxJson.generators = { ...(nxJson.generators ?? {}), '@nx/angular:component': { type: 'component' } };
  updateNxJson(tree, nxJson);
  for (const name of names) {
    await applicationGenerator(tree, { name, directory: name, skipFormat: true, e2eTestRunner: 'none', unitTestRunner: 'none' } as any);
    tree.write(`${ name }/tsconfig.spec.json`, JSON.stringify({ extends: './tsconfig.json', compilerOptions: { outDir: '../dist/out-tsc', types: [ 'jest', 'node' ] }, include: [ 'src/**/*.spec.ts', 'src/**/*.d.ts' ] }));
  }
  return tree;
}

describe('plugin-angular init-application', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'debug').mockImplementation();
  });

  it('initializes a basic application', async () => {
    const tree = await setup();
    await initApplicationGenerator(tree, { project: 'app', skipFormat: true } as any);
    expect(tree.exists('shared/angular/assets/custom.svg')).toBe(true);
    expect(readProjectConfiguration(tree, 'app').tags).toBeDefined();
  }, 120000);

  it('skips projects when requested', async () => {
    const tree = await setup();
    await initApplicationGenerator(tree, { skipProjects: true } as any);
    expect(tree.exists('shared/angular/assets/custom.svg')).toBe(true);
  }, 120000);

  it('initializes all angular applications without a project option', async () => {
    const tree = await setup([ 'app', 'other' ]);
    await initApplicationGenerator(tree, { skipFormat: true } as any);
    expect(readProjectConfiguration(tree, 'other')).toBeDefined();
  }, 120000);

  it('generates a monolithic application with oauth, i18n, localazy, service worker and sentry', async () => {
    const tree = await setup();
    await initApplicationGenerator(tree, {
      project: 'app',
      monolithic: true,
      authentication: true,
      authentik: true,
      material: true,
      i18n: true,
      i18nStandalone: true,
      localazy: true,
      localazyReadKey: 'key',
      serviceWorker: true,
      sentry: true,
      openApi: true,
      config: true,
      apiStatusCheck: true,
      deploy: 'web3-storage',
      overwrite: true,
      cleanup: true,
      generateMain: true,
      incrementalBuild: true,
      skipFormat: true,
    } as any);
    expect(tree.exists('app/src/app/layout.routes.ts')).toBe(true);
    const pkg = readJson(tree, 'package.json');
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    expect(deps['angular-oauth2-oidc']).toBeDefined();
    expect(deps['@rxap/ngx-sentry']).toBeDefined();
    expect(deps['@angular/service-worker']).toBeDefined();
    expect(tree.exists('app/src/manifest.webmanifest') || tree.exists('app/src/public/manifest.webmanifest')).toBe(true);
  }, 120000);

  it('supports oauth2-proxy authentication with legacy open api', async () => {
    const tree = await setup();
    tree.write('project.json', JSON.stringify({ name: 'workspace', targets: {} }));
    await initApplicationGenerator(tree, {
      project: 'app', authentication: 'oauth2-proxy', openApi: true, openApiLegacy: true, generateMain: true, skipDocker: true, deploy: 'test', skipFormat: true,
    } as any);
    expect(tree.exists('app/project.json')).toBe(true);
  }, 120000);

  it('coerces missing projects', async () => {
    const tree = await setup([]);
    await initApplicationGenerator(tree, { project: 'user-interface-demo', coerce: true, skipFormat: true } as any);
    expect(tree.exists('user-interface/demo/project.json')).toBe(true);
    await initApplicationGenerator(tree, { project: 'user-interface-demo', coerce: true, skipFormat: true } as any);
  }, 180000);

  it('coerces and links a module federation host and remote', async () => {
    const tree = await setup([]);
    await initApplicationGenerator(tree, { project: 'host', moduleFederation: 'host', monolithic: true, coerce: true, generateMain: true, overwrite: true, skipFormat: true } as any);
    expect(tree.exists('user-interface/host/project.json')).toBe(true);
    await initApplicationGenerator(tree, {
      project: 'remote_x', host: 'host', coerce: true, generateMain: true, overwrite: true, skipFormat: true,
    } as any);
    expect(tree.exists('user-interface/remote_x/project.json')).toBe(true);
  }, 240000);
});
