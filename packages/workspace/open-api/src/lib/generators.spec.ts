import { Project } from 'ts-morph';
import { GenerateDataSource } from './generate-data-source';
import { GenerateDirectives } from './generate-directives';
import { GenerateHttpResource } from './generate-http-resource';
import { GenerateOperationCommand } from './generate-operation-command';
import { GenerateRemoteMethod } from './generate-remote-method';
import { GenerateParameter } from './types';

function param(overrides: Partial<GenerateParameter> = {}): GenerateParameter {
  return {
    method: 'get',
    path: '/users/{id}',
    operationId: 'get-user',
    project: new Project({ useInMemoryFileSystem: true }),
    components: {},
    options: {},
    parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'string' } } ],
    requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
    responses: {
      200: {
        description: 'x',
        content: { 'application/json': { schema: { type: 'array', items: { type: 'string' } } } },
      },
    },
    ...overrides,
  } as GenerateParameter;
}

function text(p: GenerateParameter, path: string): string {
  const file = p.project.getSourceFile(path);
  expect(file).toBeDefined();
  return file!.getFullText();
}

describe('code generators', () => {

  describe('GenerateDataSource', () => {
    it('creates a data source class for GET operations', () => {
      const p = param();
      GenerateDataSource(p);
      const out = text(p, '/data-sources/get-user.data-source.ts');
      expect(out).toContain('export class GetUserDataSource extends OpenApiDataSource<GetUserResponse, GetUserParameter>');
      expect(out).toContain('@RxapOpenApiDataSource("get-user")');
      expect(out).toContain('../responses/get-user.response');
      expect(out).toContain('../parameters/get-user.parameter');
    });
    it('skips non GET operations', () => {
      const p = param({ method: 'post' });
      GenerateDataSource(p);
      expect(p.project.getSourceFiles()).toHaveLength(0);
    });
    it('uses packageName for imports and omits void parameter', () => {
      const p = param({ parameters: [], options: { packageName: '@my/api' } });
      GenerateDataSource(p);
      const out = text(p, '/data-sources/get-user.data-source.ts');
      expect(out).toContain('"@my/api"');
      expect(out).toContain('OpenApiDataSource<GetUserResponse, void>');
    });
  });

  describe('GenerateRemoteMethod', () => {
    it('creates remote method with serialized operation', () => {
      const p = param({ options: { serverId: 'main' } });
      GenerateRemoteMethod(p);
      const out = text(p, '/remote-methods/get-user.remote-method.ts');
      expect(out).toContain('export class GetUserRemoteMethod extends OpenApiRemoteMethod<GetUserResponse, GetUserParameter, GetUserRequestBody>');
      expect(out).toContain('serverId: "main"');
      expect(out).toContain('operationId: "get-user"');
    });
    it('uses undefined serverId by default', () => {
      const p = param();
      GenerateRemoteMethod(p);
      expect(text(p, '/remote-methods/get-user.remote-method.ts')).toContain('serverId: undefined');
    });
  });

  describe('GenerateOperationCommand', () => {
    it('creates a nest command with quoted serverId', () => {
      const p = param({ options: { serverId: 'main' } });
      GenerateOperationCommand(p);
      const out = text(p, '/commands/get-user.command.ts');
      expect(out).toContain('export class GetUserCommand extends OpenApiOperationCommand<GetUserResponse, GetUserParameter, GetUserRequestBody>');
      expect(out).toContain('serverId: "main"');
    });
    it('emits valid code when serverId is not set', () => {
      const p = param();
      GenerateOperationCommand(p);
      const out = text(p, '/commands/get-user.command.ts');
      expect(out).toContain('serverId: undefined');
      expect(out).not.toContain('serverId: ",');
    });
  });

  describe('GenerateHttpResource', () => {
    it('creates an overloaded httpResource function', () => {
      const p = param({ options: { serverId: 'main' } });
      GenerateHttpResource(p);
      const out = text(p, '/http-resources/get-user.http-resource.ts');
      expect(out).toContain('export function getUserHttpResource(');
      expect(out).toContain('encodeURIComponent(path_id)');
      expect(out).toContain(`.set(OPEN_API_SERVER_ID, 'main')`);
    });
    it('does not set a bogus server id when none configured', () => {
      const p = param();
      GenerateHttpResource(p);
      const out = text(p, '/http-resources/get-user.http-resource.ts');
      expect(out).not.toContain(`'undefined'`);
      expect(out).toContain(`.set(OPEN_API_OPERATION_ID, 'get-user')`);
    });
    it('skips non GET', () => {
      const p = param({ method: 'delete' });
      GenerateHttpResource(p);
      expect(p.project.getSourceFiles()).toHaveLength(0);
    });
    it('handles query parameters and no request body', () => {
      const p = param({
        parameters: [ { name: 'limit', in: 'query', schema: { type: 'number' } } ],
        requestBody: undefined,
      });
      GenerateHttpResource(p);
      const out = text(p, '/http-resources/get-user.http-resource.ts');
      expect(out).toContain('toHttpParams(parameters');
      expect(out).not.toContain('body: requestBody()');
    });
  });

  describe('GenerateDirectives', () => {
    it('creates collection, template and plain directives for collection responses', () => {
      const p = param();
      GenerateDirectives(p);
      const out = text(p, '/directives/get-user.directive.ts');
      expect(out).toContain('GetUserRemoteMethodTemplateCollectionDirective');
      expect(out).toContain('GetUserRemoteMethodTemplateDirective');
      expect(out).toContain('class GetUserRemoteMethodDirective');
      expect(out).toContain('ArrayElement<GetUserResponse>');
    });
    it('omits the collection directive for object responses', () => {
      const p = param({
        responses: { 200: { description: 'x', content: { 'application/json': { schema: { type: 'object' } } } } },
        parameters: [],
        requestBody: undefined,
      });
      GenerateDirectives(p);
      const out = text(p, '/directives/get-user.directive.ts');
      expect(out).not.toContain('TemplateCollectionDirective');
      expect(out).toContain('class GetUserRemoteMethodDirective');
    });
  });
});
