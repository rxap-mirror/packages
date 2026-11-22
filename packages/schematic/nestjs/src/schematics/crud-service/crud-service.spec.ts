import { CoerceClass } from '@rxap/schematics-ts-morph';
import { Project, ScriptTarget, SourceFile } from 'ts-morph';
import { AddModuleExport, GetModuleOptionsObject as GetModuleOptionsObjectExport } from './add-module-export';
import { AddModuleProvider, GetModuleOptionsObject } from './add-module-provider';
import { CoerceClassMethod } from './coerce-class-method';
import { CoerceClassProperty } from './coerce-class-property';
import { CoerceCollectionEnum, CoerceEnum, CoerceEnumProperty } from './coerce-collection-enum';
import { CoerceModuleClass } from './coerce-module-class';
import { CoerceSourceFileRule } from './coerce-source-file-rule';
import { CrudClass } from './crud-class';
import { CreateDtoClass } from './dto-class/create-dto-class';
import { DtoClass } from './dto-class/dto-class';
import { UpdateDtoClass } from './dto-class/update-dto-class';
import { Options } from './options';
import { HostTree } from '@angular-devkit/schematics';
import { callRule } from '@angular-devkit/schematics';
import { firstValueFrom } from 'rxjs';

function project() {
  return new Project({ useInMemoryFileSystem: true, compilerOptions: { target: ScriptTarget.ES2020 } });
}

function syntaxErrors(sourceFile: SourceFile) {
  return sourceFile
    .getProject()
    .getProgram()
    .getSyntacticDiagnostics(sourceFile)
    .map((d) => String(d.getMessageText()));
}

const base: Options = {
  camelized: 'userProfile',
  classified: 'UserProfile',
  dasherized: 'user-profile',
  dtoName: 'UserProfileDto',
  collection: 'userProfiles',
  parentCollectionList: [],
  privateName: null,
  documentId: 'userProfileId',
  overwrite: false,
};

const variants: Array<[string, Options]> = [
  ['plain', base],
  ['with parents', { ...base, parentCollectionList: ['tenants', 'organizations'] }],
  ['private', { ...base, privateName: 'secret' }],
  ['private with parents', { ...base, privateName: 'secret', parentCollectionList: ['tenants'] }],
];

describe('CrudClass', () => {
  it.each(variants)('generates syntactically valid code (%s)', (_name, options) => {
    const sf = project().createSourceFile('crud.service.ts', '');
    CrudClass(sf, options);
    expect(syntaxErrors(sf)).toEqual([]);
    const text = sf.getFullText();
    expect(text).toContain('class UserProfileCrudService');
    for (const m of ['create', 'delete', 'update', 'get', 'exists', 'updateField']) {
      expect(sf.getClassOrThrow('UserProfileCrudService').getMethod(m)).toBeDefined();
    }
    const hasFind = !!sf.getClassOrThrow('UserProfileCrudService').getMethod('find');
    expect(hasFind).toBe(!options.privateName);
    expect(!!sf.getClassOrThrow('UserProfileCrudService').getMethod('findInGroup')).toBe(!options.privateName);
    for (const parent of options.parentCollectionList) {
      expect(text).toContain(`Collection.${parent.toUpperCase()}`);
    }
    if (options.privateName) {
      expect(text).toContain(`.doc('secret')`);
      expect(text).toContain('Collection.PRIVATE');
    }
  });

  it('removes existing statements on overwrite', () => {
    const sf = project().createSourceFile('crud.service.ts', 'export const old = 1;\nconst x = 2;');
    CrudClass(sf, { ...base, overwrite: true });
    expect(sf.getFullText()).not.toContain('old');
    const sf2 = project().createSourceFile('b.ts', 'export const old = 1;');
    CrudClass(sf2, base);
    expect(sf2.getFullText()).toContain('old');
  });
});

describe('dto classes', () => {
  it.each(variants)('DtoClass (%s)', (_name, options) => {
    const sf = project().createSourceFile('dto.ts', '');
    DtoClass(sf, options);
    expect(syntaxErrors(sf)).toEqual([]);
    const cls = sf.getClassOrThrow('UserProfileDto');
    expect(cls.getProperty('id')).toBeDefined();
    for (const parent of options.parentCollectionList) {
      expect(cls.getProperty(`${parent}Id`)).toBeDefined();
    }
    expect(cls.getStaticMethod('FromCreateUserProfileDto')).toBeDefined();
    expect(cls.getStaticMethod('FromUpdateUserProfileDto')).toBeDefined();
  });

  it('DtoClass is idempotent', () => {
    const sf = project().createSourceFile('dto.ts', '');
    DtoClass(sf, base);
    const first = sf.getClassOrThrow('UserProfileDto').getProperties().length;
    DtoClass(sf, base);
    expect(sf.getClassOrThrow('UserProfileDto').getProperties().length).toBe(first);
  });

  it('CreateDtoClass omits the id and parent ids', () => {
    const sf = project().createSourceFile('c.ts', '');
    CreateDtoClass(sf, { ...base, parentCollectionList: ['tenants'] });
    expect(syntaxErrors(sf)).toEqual([]);
    expect(sf.getFullText()).toMatch(/OmitType\(UserProfileDto,\s*\[\s*'id',\s*'tenantsId'\s*\] as const\)/);
  });

  it('UpdateDtoClass wraps in PartialType', () => {
    const sf = project().createSourceFile('u.ts', '');
    UpdateDtoClass(sf, base);
    expect(syntaxErrors(sf)).toEqual([]);
    expect(sf.getFullText()).toContain('PartialType(');
  });
});

describe('class helpers', () => {
  it('CoerceClassMethod / CoerceClassProperty only add once', () => {
    const sf = project().createSourceFile('a.ts', 'class A {}');
    const cls = sf.getClassOrThrow('A');
    CoerceClassMethod(cls, 'm');
    CoerceClassMethod(cls, 'm', { isAsync: true });
    CoerceClassProperty(cls, 'p', { type: 'string' });
    CoerceClassProperty(cls, 'p', { type: 'number' });
    expect(cls.getMethods().length).toBe(1);
    expect(cls.getMethodOrThrow('m').isAsync()).toBe(false);
    expect(cls.getProperties().length).toBe(1);
    expect(cls.getPropertyOrThrow('p').getType().getText()).toBe('string');
  });

  it('CoerceEnum helpers', () => {
    const sf = project().createSourceFile('e.ts', '');
    CoerceEnumProperty(sf, 'Collection', 'A', 'a');
    CoerceEnumProperty(sf, 'Collection', 'A', 'other');
    CoerceEnumProperty(sf, 'Collection', 'B', undefined);
    expect(CoerceEnum(sf, 'Collection')).toBe(sf.getEnumOrThrow('Collection'));
    expect(sf.getEnumOrThrow('Collection').getMembers().map((m) => m.getName())).toEqual(['A', 'B']);
    expect(sf.getEnumOrThrow('Collection').getMemberOrThrow('A').getValue()).toBe('a');
  });

  it('CoerceCollectionEnum adds the collection to lib/collection.ts', () => {
    const p = project();
    CoerceCollectionEnum(p, 'userProfiles');
    const sf = p.getSourceFileOrThrow('lib/collection.ts');
    expect(sf.getEnumOrThrow('Collection').getMembers().map((m) => m.getName())).toEqual(['USER_PROFILES']);
  });

  it('CoerceModuleClass creates a module with Module decorator', () => {
    const sf = project().createSourceFile('m.ts', '');
    CoerceModuleClass(sf, 'App');
    const cls = sf.getClassOrThrow('AppModule');
    expect(cls.getDecorator('Module')).toBeDefined();
    expect(cls.getDecorator('Global')).toBeUndefined();
    const sf2 = project().createSourceFile('m2.ts', '');
    CoerceModuleClass(sf2, 'AppModule', true);
    expect(sf2.getClassOrThrow('AppModule').getDecorators().map((d) => d.getName())).toEqual(['Global', 'Module']);
  });
});

describe('module options', () => {
  const moduleSource = `@Module({})\nexport class AppModule {}`;

  it('throws without Module decorator', () => {
    const sf = project().createSourceFile('x.ts', 'class A {}');
    expect(() => GetModuleOptionsObject(sf)).toThrow('Could not find class with Module decorator!');
    expect(() => GetModuleOptionsObjectExport(sf)).toThrow();
  });

  it('creates the options object when missing', () => {
    const sf = project().createSourceFile('x.ts', '@Module()\nclass A {}');
    expect(GetModuleOptionsObject(sf).getText()).toContain('{');
    const sf2 = project().createSourceFile('y.ts', '@Module()\nclass A {}');
    expect(GetModuleOptionsObjectExport(sf2)).toBeDefined();
  });

  it('throws if the options are not an object literal', () => {
    const sf = project().createSourceFile('x.ts', 'const o = {};\n@Module(o)\nclass A {}');
    expect(() => GetModuleOptionsObject(sf)).toThrow('The Module options is not an object literal expression');
    expect(() => GetModuleOptionsObjectExport(sf)).toThrow();
  });

  it('adds providers and exports with imports', () => {
    const sf = project().createSourceFile('x.ts', moduleSource);
    AddModuleProvider(sf, 'MyService', [{ namedImports: ['MyService'], moduleSpecifier: './my.service' }]);
    AddModuleExport(sf, 'MyService', [{ namedImports: ['MyService'], moduleSpecifier: './my.service' }]);
    const text = sf.getFullText();
    expect(text).toMatch(/providers:\s*\[\s*MyService\s*\]/);
    expect(text).toMatch(/exports:\s*\[\s*MyService\s*\]/);
    expect(text).toContain('from "./my.service"');
  });
});

describe('CoerceSourceFileRule', () => {
  it('uses the tree content when the file exists and skips the initializer', async () => {
    const tree = new HostTree();
    tree.create('/src/lib/a.ts', 'export const a = 1;');
    const p = project();
    const init = jest.fn();
    await firstValueFrom(callRule(CoerceSourceFileRule(p, 'lib/a.ts', '/src', init), tree, {} as any) as any);
    expect(p.getSourceFileOrThrow('lib/a.ts').getFullText()).toBe('export const a = 1;');
    expect(init).not.toHaveBeenCalled();
  });

  it('runs the initializer for a missing file', async () => {
    const tree = new HostTree();
    const p = project();
    const init = jest.fn((sf: SourceFile) => sf.addStatements('export const b = 2;'));
    await firstValueFrom(callRule(CoerceSourceFileRule(p, 'lib/b.ts', '/src', init), tree, {} as any) as any);
    expect(init).toHaveBeenCalled();
    expect(p.getSourceFileOrThrow('lib/b.ts').getFullText()).toContain('const b = 2');
    // without initializer
    await firstValueFrom(callRule(CoerceSourceFileRule(p, 'lib/c.ts', '/src'), tree, {} as any) as any);
    expect(p.getSourceFileOrThrow('lib/c.ts').getFullText()).toBe('');
  });
});
