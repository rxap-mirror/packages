import { callRule, HostTree } from '@angular-devkit/schematics';
import { lastValueFrom } from 'rxjs';
import { CreateProject } from '@rxap/ts-morph';
import { Project } from 'ts-morph';

jest.mock('../ts-morph-transform', () => ({
  TsMorphNestProjectTransformRule: (_o: any, cb: any, filePaths?: string[]) => () => {
    const project = (globalThis as any).__project;
    const files = filePaths?.map(f => {
      const p = f.replace(/\?$/, '');
      return project.getSourceFile(p) ?? project.createSourceFile(p, '');
    });
    return cb(project, files);
  },
}));

const assertNestProject = jest.fn();
jest.mock('./assert-nest-project', () => ({ AssertNestProject: (o: any) => () => assertNestProject(o) }));

const coerceNestModule = jest.fn();
jest.mock('./coerce-nest-module', () => ({ CoerceNestModule: (o: any) => () => coerceNestModule(o) }));

const coerceNestOperation = jest.fn();
jest.mock('@rxap/ts-morph', () => ({
  ...jest.requireActual('@rxap/ts-morph'),
  CoerceNestOperation: (...a: any[]) => coerceNestOperation(...a),
}));

const hasNestServiceProject = jest.fn();
jest.mock('@rxap/workspace-utilities', () => ({
  ...jest.requireActual('@rxap/workspace-utilities'),
  HasNestServiceProject: (...a: any[]) => hasNestServiceProject(...a),
}));

const executeSchematic = jest.fn((name: string, o: any) => () => ({ name, o }));
jest.mock('@rxap/schematics-utilities', () => ({
  ...jest.requireActual('@rxap/schematics-utilities'),
  ExecuteSchematic: (...a: any[]) => (executeSchematic as any)(...a),
}));

import { CoerceNestController } from './coerce-nest-controller';
import { CoerceNestServiceProject } from './coerce-nest-service-project';
import { CoerceOperation } from './coerce-operation';
import { BuildPageDtoClassName } from './coerce-page-dto-class';

const ctx: any = { logger: { info: jest.fn() }, addTask: jest.fn(), engine: {} };
const exec = (rule: any) => lastValueFrom(callRule(rule, new HostTree(), ctx));

describe('nest rules', () => {
  let project: Project;

  beforeEach(() => {
    project = CreateProject();
    (globalThis as any).__project = project;
    jest.spyOn(console, 'log').mockImplementation();
    assertNestProject.mockClear();
    coerceNestModule.mockClear();
    coerceNestOperation.mockClear();
    executeSchematic.mockClear();
    hasNestServiceProject.mockReset();
  });
  afterEach(() => jest.restoreAllMocks());

  describe('CoerceNestController', () => {
    const base = { project: 'p', backend: undefined } as any;

    it('creates the controller class and registers it in the module', async () => {
      const transform = jest.fn();
      project.createSourceFile('foo-bar.module.ts', `import { Module } from '@nestjs/common';\n@Module({}) export class FooBarModule {}`);
      const rule = CoerceNestController({ ...base, name: 'fooBar', tsMorphTransform: transform, coerceModule: true });
      await exec(rule);
      const controller = project.getSourceFileOrThrow('foo-bar.controller.ts');
      expect(controller.getText()).toContain('export class FooBarController');
      expect(controller.getText()).toContain(`@Controller('foo-bar')`);
      expect(project.getSourceFileOrThrow('foo-bar.module.ts').getText()).toContain('FooBarController');
      expect(transform).toHaveBeenCalled();
      expect(assertNestProject).toHaveBeenCalled();
      expect(coerceNestModule).toHaveBeenCalledWith(expect.objectContaining({ name: 'foo-bar' }));
    });

    it('supports skipModuleImport, overwrite and a custom prefix', async () => {
      project.createSourceFile('other.module.ts', `export class OtherModule {}`);
      project.createSourceFile('x.controller.ts', `import { Controller } from '@nestjs/common';\n@Controller('old') export class XController {}`);
      const rule = CoerceNestController({
        ...base, name: 'x', nestModule: 'other', controllerPrefix: 'new', overwrite: true, skipModuleImport: true,
      });
      await exec(rule);
      expect(project.getSourceFileOrThrow('x.controller.ts').getText()).toContain(`@Controller('new')`);
      expect(coerceNestModule).not.toHaveBeenCalled();
    });
  });

  describe('CoerceNestServiceProject', () => {
    const o = { project: 'p', backend: undefined } as any;

    it('is a noop when the project exists', () => {
      hasNestServiceProject.mockReturnValue(true);
      CoerceNestServiceProject(o)(new HostTree(), {} as any);
      expect(executeSchematic).not.toHaveBeenCalled();
    });

    it.each([
      [{ feature: 'f', shared: true }, 'feature-microservice', { feature: 'f' }],
      [{ feature: 'f' }, 'frontend-microservice', { frontend: 'p', feature: 'f' }],
      [{}, 'microservice', { project: 'p' }],
    ])('executes schematic for %j', (extra, name, args) => {
      hasNestServiceProject.mockReturnValue(false);
      CoerceNestServiceProject({ ...o, ...extra })(new HostTree(), {} as any);
      expect(executeSchematic).toHaveBeenCalledWith(name, args);
    });
  });

  describe('CoerceOperation', () => {
    it('coerces the controller and the operation with path parameters', async () => {
      const rule = CoerceOperation({
        project: 'p', controllerName: 'user', operationName: 'get', backend: undefined,
        paramList: [ { name: 'id' }, { name: 'pid', fromParent: true } ],
      } as any);
      await exec(rule);
      expect(coerceNestOperation).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ operationName: 'get' }), expect.anything());
    });

    it('appends missing path parameters to an existing path', async () => {
      const rule = CoerceOperation({
        project: 'p', controllerName: 'user', nestModule: 'account', operationName: 'get', backend: undefined, path: ':id', skipCoerce: true,
        paramList: [ { name: 'id' }, { name: 'other' } ],
      } as any);
      await exec(rule);
      expect(coerceNestOperation).toHaveBeenCalled();
      expect(coerceNestModule).not.toHaveBeenCalled();
    });
  });

  it('BuildPageDtoClassName suffixes -page', () => {
    expect(BuildPageDtoClassName('user')).toBe('user-page');
    expect(BuildPageDtoClassName('user-page')).toBe('user-page');
  });
});
