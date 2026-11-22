/** @jest-environment node */
jest.mock('prettier', () => ({ format: async (text: string) => text, resolveConfig: async () => null }));
import {
  callRule,
  HostTree,
} from '@angular-devkit/schematics';
import { firstValueFrom } from 'rxjs';
import generate from './index';

const openapi = {
  openapi: '3.0.0',
  info: { title: 't', version: '1' },
  components: { schemas: { User: { type: 'object', properties: { id: { type: 'string' } } } } },
  paths: {
    '/users/{id}': {
      get: {
        operationId: 'get-user',
        parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'string' } } ],
        responses: { 200: { content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } } },
      },
    },
  },
};

function createHost() {
  const host = new HostTree();
  host.create('/open-api/project.json', JSON.stringify({ name: 'open-api', root: 'open-api', sourceRoot: 'open-api/src' }));
  host.create('/open-api/src/lib/components/stale.ts', 'export {};');
  host.create('/spec/openapi.json', JSON.stringify(openapi));
  return host;
}

const context: any = { logger: { debug: jest.fn(), info: jest.fn() }, schematic: { collection: { name: 'x' } } };

describe('schematic open-api generate schematic', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'debug').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  it('generates sources in the project and clears old files', async () => {
    const host = createHost();
    const options: any = { path: 'spec/openapi.json', directory: 'Foo/Bar' };
    const result = await firstValueFrom(callRule(generate(options), host, context) as any);
    expect(options.inline).toBe(true);
    expect(options.project).toBe('open-api');
    expect(options.directory).toBe('foo/bar');
    expect(result).toBe(host);
    expect(host.exists('/open-api/src/lib/components/stale.ts')).toBe(false);
    const created = host.visit ? (() => { const l: string[] = []; host.visit(p => l.push(p)); return l; })() : [];
    expect(created.some(p => p.includes('get-user.remote-method'))).toBe(true);
    expect(created.some(p => p.includes('get-user.command'))).toBe(true);
    expect(created.some(p => p.includes('get-user.data-source'))).toBe(true);
    expect(created.some(p => p.includes('get-user.parameter'))).toBe(true);
  });

  it('honours skip options and keeps inline false', async () => {
    const host = createHost();
    const options: any = { path: 'spec/openapi.json', project: 'open-api', inline: false, skipRemoteMethod: true, skipDataSource: true, skipCommand: true, skipDirectives: true };
    await firstValueFrom(callRule(generate(options), host, context) as any);
    expect(options.inline).toBe(false);
    const created: string[] = [];
    host.visit(p => created.push(p));
    expect(created.some(p => p.includes('remote-method'))).toBe(false);
    expect(created.some(p => p.includes('get-user.response'))).toBe(true);
  });
});
