import { CreateProject } from '@rxap/ts-morph';
import { GenerateDataSource } from './generate-data-source';
import { GenerateDirectives } from './generate-directives';
import { GenerateOperationCommand } from './generate-operation-command';
import { GenerateOpenapiProvider } from './generate-openapi-provider';
import { GenerateRemoteMethod } from './generate-remote-method';

const json = (schema: any): any => ({ content: { 'application/json': { schema } } });

function parameter(overrides: any = {}, options: any = {}): any {
  return {
    operationId: 'get-user',
    method: 'get',
    path: '/users/{id}',
    project: CreateProject(),
    components: {},
    options: { project: 'p', prefix: 'rxap', serverId: 'svc', inline: true, ...options },
    parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'string' } } ],
    responses: { 200: json({ type: 'object', description: 'dropped' }) },
    ...overrides,
  };
}

function files(p: any): Record<string, string> {
  return Object.fromEntries(p.project.getSourceFiles().map((f: any) => [ f.getFilePath(), f.getFullText() ]));
}

describe('schematic open-api generate functions', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
  });

  describe('GenerateRemoteMethod', () => {
    it('generates an inline remote method with all types', () => {
      const p = parameter({ requestBody: json({ type: 'object' }), method: 'post' });
      GenerateRemoteMethod(p);
      const text = Object.values(files(p))[0];
      expect(text).toContain('class GetUserRemoteMethod extends OpenApiRemoteMethod<GetUserResponse, GetUserParameter, GetUserRequestBody>');
      expect(text).toMatch(/serverId: ['"]svc['"]/);
      expect(text).toContain('parameters: OpenApiRemoteMethodParameter<GetUserParameter, GetUserRequestBody>');
      expect(text).not.toContain('description');
    });
    it('generates a non inline remote method without parameters, amplify transport', () => {
      const p = parameter({ parameters: undefined, responses: {} }, { inline: false, transport: 'amplify', serverId: undefined });
      GenerateRemoteMethod(p);
      const text = Object.values(files(p))[0];
      expect(text).toContain('AmplifyOpenApiRemoteMethod<void, void, void>');
      expect(text).toMatch(/@RxapOpenApiRemoteMethod\(['"]get-user['"]\)/);
      expect(text).toContain('return super.call()');
    });
    it('uses undefined server id when inline without serverId', () => {
      const p = parameter({}, { serverId: undefined });
      GenerateRemoteMethod(p);
      expect(Object.values(files(p))[0]).toContain('serverId: undefined');
    });
  });

  describe('GenerateDataSource', () => {
    it('only generates for GET operations', () => {
      const post = parameter({ method: 'post' });
      GenerateDataSource(post);
      expect(Object.keys(files(post))).toHaveLength(0);
      const get = parameter();
      GenerateDataSource(get);
      expect(Object.values(files(get))[0]).toContain('class GetUserDataSource extends OpenApiDataSource<GetUserResponse, GetUserParameter>');
    });
    it('skips imports for void types', () => {
      const get = parameter({ parameters: undefined, responses: {} });
      GenerateDataSource(get);
      expect(Object.values(files(get))[0]).not.toContain('../responses');
    });
  });

  describe('GenerateOperationCommand', () => {
    it('generates a command with parameters', async () => {
      const p = parameter({ requestBody: json({ type: 'object' }) });
      await GenerateOperationCommand(p);
      const text = Object.values(files(p))[0];
      expect(text).toContain('OpenApiOperationCommandParameters<GetUserParameter, GetUserRequestBody>');
      expect(text).toContain('class GetUserCommand extends OpenApiOperationCommand');
    });
    it('generates a command without parameters', async () => {
      const p = parameter({ parameters: undefined, responses: {} });
      await GenerateOperationCommand(p);
      expect(Object.values(files(p))[0]).toContain('OpenApiOperationCommandWithoutParameters');
    });
  });

  describe('GenerateDirectives', () => {
    it('generates directives for GET and non-GET operations', () => {
      for (const variant of [
        {},
        { method: 'post', requestBody: json({ type: 'object' }) },
        { parameters: undefined, responses: { 200: json({ type: 'array', items: { type: 'string' } }) } },
        { parameters: undefined, responses: {} },
      ]) {
        const p = parameter(variant);
        GenerateDirectives(p);
        expect(Object.keys(files(p)).length).toBeGreaterThan(0);
      }
    });
  });

  describe('GenerateOpenapiProvider', () => {
    it('creates the provider list', () => {
      const project = CreateProject();
      GenerateOpenapiProvider(project, [ 'get-user', 'list-users' ], { skipRemoteMethod: false } as any);
      const text = project.getSourceFileOrThrow('open-api-providers.ts').getFullText();
      expect(text).toContain('OPEN_API_PROVIDERS: Provider[] = [GetUserRemoteMethod, ListUsersRemoteMethod]');
    });
    it('omits remote methods when skipped', () => {
      const project = CreateProject();
      GenerateOpenapiProvider(project, [ 'get-user' ], { skipRemoteMethod: true } as any);
      expect(project.getSourceFileOrThrow('open-api-providers.ts').getFullText()).toContain('= []');
    });
  });
});
