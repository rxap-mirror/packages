import { HostTree, Tree } from '@angular-devkit/schematics';
import { CreateProject } from '@rxap/ts-morph';
import { Project, SyntaxKind } from 'ts-morph';
import { AddNestController } from './add-nest-controller';
import { AddNestProviderToArray } from './add-nest-provider-to-array';
import { AssertNestProject } from './assert-nest-project';
import { BuildNestBasePath } from './build-nest-base-path';
import { HasNestController } from './has-nest-controller';
import { HasNestModule } from './has-nest-module';
import { RemoveNestModuleProvider } from './remove-nest-module-provider';
import { RemoveNestProviderToArray } from './remove-nest-provider-to-array';
import { buildOperationId } from './operation-id-utilities';
import { BuildRowDtoClassName, CoerceRowDtoClass } from './coerce-row-dto-class';
import { TABLE_QUERY_LIST } from './table-query-list';

function workspace(): Tree {
  const tree = new HostTree();
  tree.create('/apps/svc/project.json', JSON.stringify({ name: 'svc', root: 'apps/svc', sourceRoot: 'apps/svc/src', projectType: 'application' }));
  return tree;
}

describe('nest helpers', () => {
  let project: Project;
  beforeEach(() => {
    project = CreateProject();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
  });
  const array = (t = '[]') => project.createSourceFile('a' + Math.random() + '.ts', `const a = ${ t };`)
    .getVariableDeclarationOrThrow('a').getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);

  it('AddNestProviderToArray / RemoveNestProviderToArray', () => {
    const a = array();
    AddNestProviderToArray('A', a);
    AddNestProviderToArray('A', a);
    AddNestProviderToArray({ provide: 'T', useClass: 'C', inject: [ 'X', 'Y' ], scope: 'Scope.REQUEST' } as any, a);
    AddNestProviderToArray({ provide: 'T', useValue: '1', inject: 'Z' as any } as any, a);
    expect(a.getElements()).toHaveLength(2);
    AddNestProviderToArray({ provide: 'T', useValue: '1' } as any, a, true);
    expect(a.getText()).toContain('useValue: 1');
    expect(a.getText()).not.toContain('useClass');
    RemoveNestProviderToArray({ provide: 'T' } as any, a);
    expect(a.getElements()).toHaveLength(2);
    RemoveNestProviderToArray({ provide: 'T' } as any, a, [ 'provider' ]);
    expect(a.getElements()).toHaveLength(1);
    RemoveNestProviderToArray('A', a);
    RemoveNestProviderToArray('missing', a);
    expect(a.getElements()).toHaveLength(0);
  });

  it('RemoveNestModuleProvider', () => {
    const sf = project.createSourceFile('m.ts', `@Module({ providers: [ A, B ] }) export class M {}`);
    RemoveNestModuleProvider(sf, 'A');
    expect(sf.getText()).not.toMatch(/\bA\b/);
    expect(sf.getText()).toContain('B');
  });

  describe('AddNestController', () => {
    it('creates a controller and registers it in the module', () => {
      project.createSourceFile('/user.module.ts', `import { Module } from '@nestjs/common'; @Module({}) export class UserModule {}`);
      const sf = AddNestController(project, 'user', { prefix: 'users' });
      expect(sf.getText()).toContain(`@Controller('users')`);
      expect(sf.getText()).toContain('class UserController');
      const module = project.getSourceFileOrThrow('/user.module.ts').getText();
      expect(module).toContain('UserController');
    });
    it('supports module file path, no module and missing module', () => {
      const m = project.createSourceFile('/mod/x.module.ts', `@Module({}) export class XModule {}`);
      AddNestController(project, 'x', { modulePath: '/mod/x.module.ts', sourceFile: project.createSourceFile('/mod/x.controller.ts', '') });
      expect(m.getText()).toContain('XController');
      const plain = AddNestController(project, 'plain', { addToModule: false });
      expect(plain.getText()).toContain(`@Controller('plain')`);
      expect(() => AddNestController(project, 'nomodule', { modulePath: '/nowhere' })).toThrow('Could not find');
    });
  });

  describe('tree based', () => {
    const base = { project: 'x', backend: { project: 'svc' } } as any;
    it('BuildNestBasePath', () => {
      expect(BuildNestBasePath(workspace(), { ...base, directory: 'user' })).toBe('apps/svc/src/user');
      expect(BuildNestBasePath(workspace(), base)).toBe('apps/svc/src');
    });
    it('HasNestModule / HasNestController', () => {
      const tree = workspace();
      expect(() => HasNestModule(tree, { ...base, backend: { project: 'nope' }, name: 'user' })).toThrow('does not exists');
      expect(() => HasNestController(tree, { ...base, backend: { project: 'nope' }, name: 'u', nestModule: 'u' })).toThrow('does not exist');
      expect(HasNestModule(tree, { ...base, name: 'UserThing' })).toBe(false);
      expect(HasNestController(tree, { ...base, name: 'user', nestModule: 'user' })).toBe(false);
      tree.create('/apps/svc/src/user-thing/user-thing.module.ts', '');
      tree.create('/apps/svc/src/user/user.controller.ts', '');
      expect(HasNestModule(tree, { ...base, name: 'UserThing' })).toBe(true);
      expect(HasNestController(tree, { ...base, name: 'user', nestModule: 'user' })).toBe(true);
    });
    it('AssertNestProject', () => {
      const tree = workspace();
      expect(() => (AssertNestProject({ project: 'nope', backend: undefined }) as any)(tree, {})).toThrow('does not exists');
      expect((AssertNestProject({ project: 'x', backend: { project: 'svc' } }) as any)(tree, {})).toBeUndefined();
    });
  });

  it('misc', () => {
    expect(buildOperationId({ project: 'p', feature: null, shared: false, backend: { serverId: 'srv' } }, 'getById', 'UserThing'))
      .toBe('user-thing-controller-get-by-id@srv');
    expect(BuildRowDtoClassName('user')).toBe('user-row');
    expect(TABLE_QUERY_LIST.map(p => p.name)).toEqual([ 'pageIndex', 'pageSize', 'sortDirection', 'sortBy', 'filter' ]);
    const out = CoerceRowDtoClass({ project, name: 'user', propertyList: [ { name: 'a', type: 'string' } as any ] });
    expect(out.sourceFile.getText()).toContain('__rowId');
    expect(out.className).toBe('UserRowDto');
  });
});
