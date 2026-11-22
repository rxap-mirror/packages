import {
  addProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { parse } from 'yaml';
import dockerComposeGenerator from './generator';

const execSync = jest.fn(() => Buffer.from('ok'));
const writeFileSync = jest.fn();
jest.mock('child_process', () => ({ ...jest.requireActual('child_process'), execSync: (...args: any[]) => (execSync as any)(...args) }));
jest.mock('fs', () => ({ ...jest.requireActual('fs'), writeFileSync: (...args: any[]) => writeFileSync(...args) }));

describe('docker-compose generator', () => {

  let tree: Tree;

  function app(name: string, tags: string[], buildArgList?: string[]) {
    addProjectConfiguration(tree, name, {
      root: `apps/${ name }`,
      sourceRoot: `apps/${ name }/src`,
      projectType: 'application',
      tags,
      targets: { docker: { executor: 'x', options: { imageName: name, buildArgList } } },
    });
  }

  beforeEach(() => {
    execSync.mockClear();
    writeFileSync.mockClear();
    tree = createTreeWithEmptyWorkspace();
    app('api', [ 'service' ]);
    app('web', [ 'frontend', 'micro-frontend' ], [ 'SUB_DOMAIN=sub${DOT}' ]);
    app('host', [ 'frontend', 'module-federation', 'mfe:host' ]);
    app('remote', [ 'frontend', 'module-federation' ]);
    app('standalone', [ 'service', 'standalone' ]);
    app('ignored', [ 'service' ]);
    addProjectConfiguration(tree, 'nodocker', { root: 'apps/nodocker', projectType: 'application', tags: [ 'service' ], targets: {} });
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => jest.restoreAllMocks());

  it('should generate the compose and traefik files', async () => {
    await dockerComposeGenerator(tree, {
      skipFormat: true, ignoreProjects: [ 'ignored' ], serviceEnvironments: [ 'A=1' ], middlewares: [ 'mw@file' ],
      rootDomain: 'example.test', subjectAltNames: [ 'extra.test' ],
    });
    const services = parse(tree.read('docker-compose.services.yml', 'utf-8')!).services;
    expect(Object.keys(services)).toEqual([ 'api' ]);
    expect(services.api.environment).toContain('A=1');
    const frontends = parse(tree.read('docker-compose.frontends.yml', 'utf-8')!).services;
    expect(Object.keys(frontends)).toEqual([ 'web', 'host', 'remote' ]);
    expect(frontends.web.labels).toEqual(expect.arrayContaining([expect.stringContaining('HostRegexp(`^sub')]));
    expect(frontends.host.labels[0]).toContain('HostRegexp(`^.+$`)');
    expect(frontends.remote.labels).toEqual(expect.arrayContaining([expect.stringContaining('/__mfe/latest/remote'), expect.stringContaining('strip-mfe-prefix')]));
    expect(frontends.remote.labels).toEqual(expect.arrayContaining([expect.stringContaining('middlewares=mw@file')]));
    const local = parse(tree.read('docker/traefik/dynamic/local-services.yml', 'utf-8')!);
    expect(local.http.routers.api.middlewares).toEqual([ 'mw@file' ]);
    expect(local.http.services['api-local']).toBeDefined();
    const traefik = parse(tree.read('docker/traefik/traefik.yml', 'utf-8')!);
    expect(traefik.entryPoints.https.http.tls.domains[0].main).toBe('example.test');
    expect(tree.read('docker/traefik/tls/.gitignore', 'utf-8')).toContain('*.crt');
    const commands = execSync.mock.calls.map((call: any[]) => call[0]);
    expect(commands.some((c: string) => c.startsWith('openssl req -x509'))).toBe(true);
    expect(commands.some((c: string) => c.startsWith('openssl verify'))).toBe(true);
    expect(writeFileSync.mock.calls[0][1]).toContain('DNS:extra.test');
  });

  it('should merge an existing traefik config and skip the ca if it exists', async () => {
    tree.write('docker/traefik/traefik.yml', 'custom: true\n');
    tree.write('docker/traefik/tls/ca.crt', 'x');
    await dockerComposeGenerator(tree, { skipFormat: true });
    const traefik = parse(tree.read('docker/traefik/traefik.yml', 'utf-8')!);
    expect(traefik.custom).toBe(true);
    expect(traefik.api.dashboard).toBe(true);
    const commands = execSync.mock.calls.map((call: any[]) => call[0]);
    expect(commands.some((c: string) => c.startsWith('openssl req -x509'))).toBe(false);
  });

  it('should delete the local services config without service applications', async () => {
    tree.write('docker/traefik/dynamic/local-services.yml', 'x: 1');
    await dockerComposeGenerator(tree, { skipFormat: true, tags: [ 'unknown-tag' ] });
    expect(tree.exists('docker/traefik/dynamic/local-services.yml')).toBe(false);
  });

});
