import { CreateProject } from '../create-project';
import { CoerceNestController } from './coerce-nest-controller';
import {
  CoerceNestOperation,
  CoerceOperationParamList,
} from './coerce-nest-operation';

const setup = (controllerPath = 'items') => {
  const project = CreateProject();
  project.createSourceFile('items.module.ts', "import { Module } from '@nestjs/common';\n@Module({})\nexport class ItemsModule {}");
  const file = project.createSourceFile('items.controller.ts', '');
  CoerceNestController(file, { name: 'items', path: controllerPath });
  return file;
};
const text = (file: any) => file.getFullText();

describe('CoerceNestOperation', () => {
  it('requires a nest module next to the controller', () => {
    const file = CreateProject().createSourceFile('items.controller.ts', '');
    CoerceNestController(file, { name: 'items' });
    expect(() => CoerceNestOperation(file, { operationName: 'list' })).toThrow('Could not find Nest module');
  });

  it('creates a get operation by default', () => {
    const file = setup();
    const method = CoerceNestOperation(file, { operationName: 'list', returnType: 'string', statements: ['return "x";'] });
    expect(method.getName()).toBe('list');
    expect(text(file)).toContain('@Get()');
    expect(text(file)).toContain('public async list(): Promise<string>');
    expect(text(file)).toContain('return "x";');
  });

  it('supports other http methods and paths', () => {
    const file = setup();
    CoerceNestOperation(file, { operationName: 'create', method: 'post', path: 'new' });
    CoerceNestOperation(file, { operationName: 'remove', method: 'delete', path: ':id', paramList: [{ name: 'id', type: 'string' }] });
    expect(text(file)).toContain("@Post('new')");
    expect(text(file)).toContain("@Delete(':id')");
    expect(text(file)).toContain("@Param('id')");
    expect(text(file)).toMatch(/import \{[^}]*Post[^}]*\} from '@nestjs\/common'/);
  });

  it('adds query parameters and a body', () => {
    const file = setup();
    CoerceNestOperation(file, {
      operationName: 'search',
      method: 'post',
      queryList: [{ name: 'q', type: 'string' }],
      body: 'SearchDto',
    });
    const t = text(file);
    expect(t).toContain("@Query('q')");
    expect(t).toContain('@Body()');
    expect(t).toContain('SearchDto');
  });

  it('adds route parameters from the controller path', () => {
    const file = setup('items/:itemId');
    const controller = file.getClassOrThrow('ItemsController');
    const params: any[] = [];
    CoerceOperationParamList(params, controller);
    expect(params).toEqual([{ name: 'itemId' }]);
    CoerceOperationParamList(params, controller);
    expect(params).toHaveLength(1);
    CoerceNestOperation(file, { operationName: 'get' });
    expect(text(file)).toContain("@Param('itemId')");
  });

  it('is idempotent for the same operation', () => {
    const file = setup();
    CoerceNestOperation(file, { operationName: 'list' });
    CoerceNestOperation(file, { operationName: 'list' });
    expect(file.getClassOrThrow('ItemsController').getMethods()).toHaveLength(1);
  });

  it('applies custom decorators and transforms', () => {
    const file = setup();
    const transform = jest.fn(() => ({ returnType: 'number' }));
    CoerceNestOperation(file, {
      operationName: 'count',
      decorators: [{ name: 'ApiOkResponse', arguments: [] }],
      tsMorphTransform: transform,
    });
    expect(transform).toHaveBeenCalled();
    expect(text(file)).toContain('@ApiOkResponse()');
    expect(text(file)).toContain('Promise<number>');
  });

  it('supports synchronous operations', () => {
    const file = setup();
    CoerceNestOperation(file, { operationName: 'sync', isAsync: false, returnType: 'string' });
    expect(text(file)).toContain('sync(): string');
  });
});
