import { SourceFile } from 'ts-morph';
import { CreateProject } from '../create-project';
import { CoerceAppGuardProvider } from './coerce-app-guard-provider';
import { CoerceNestCacheModuleImport } from './coerce-nest-cache-module-import';
import { CoerceNestConfigModuleImport } from './coerce-nest-config-module-import';
import { CoerceNestEnvironmentModule } from './coerce-nest-environment-module';
import { CoerceNestEnvironmentProvider } from './coerce-nest-environment-provider';
import { CoerceNestModule } from './coerce-nest-module';
import { CoerceNestModuleImport } from './coerce-nest-module-import';
import { CoerceNestModuleProvider } from './coerce-nest-module-provider';
import { CoerceNestProviderToArray } from './coerce-nest-provider-to-array';
import { CoerceNestThrottlerModuleImport } from './coerce-nest-throttler-module-import';
import { GetNestModuleMetadata } from './get-nest-module-metadata';
import { HasNestModuleClass } from './has-nest-module-class';
import { HasNestModuleImport } from './has-nest-module-import';
import { IsNestModuleClass } from './is-nest-module-class';
import { RemoveNestModuleImport } from './remove-nest-module-import';
import { RemoveNestModuleProvider } from './remove-nest-module-provider';
import { RemoveNestProviderToArray } from './remove-nest-provider-to-array';

const create = (text = '') => CreateProject().createSourceFile('app.module.ts', text);
const moduleFile = (): SourceFile => {
  const file = create();
  CoerceNestModule(file, { name: 'app' });
  return file;
};
const metadata = (file: SourceFile) => GetNestModuleMetadata(file).getText().replace(/\s+/g, ' ');

describe('nest module helpers', () => {
  describe('CoerceNestModule', () => {
    it('creates an exported module class with the decorator and import', () => {
      const file = create();
      const cls = CoerceNestModule(file, { name: 'my-app' });
      expect(cls.getName()).toBe('MyAppModule');
      expect(cls.isExported()).toBe(true);
      expect(file.getFullText()).toContain("import { Module } from '@nestjs/common';");
      expect(file.getFullText()).toContain('@Module({})');
    });

    it('is idempotent and runs the transform', () => {
      const file = create();
      const transform = jest.fn();
      CoerceNestModule(file, { name: 'app', tsMorphTransform: transform });
      CoerceNestModule(file, { name: 'app' });
      expect(file.getClasses()).toHaveLength(1);
      expect(transform).toHaveBeenCalledWith(file, file.getClassOrThrow('AppModule'));
    });
  });

  describe('detection', () => {
    it('IsNestModuleClass and HasNestModuleClass', () => {
      const file = moduleFile();
      expect(IsNestModuleClass(file.getClassOrThrow('AppModule'))).toBe(true);
      expect(HasNestModuleClass(file)).toBe(true);
      const plain = create('class A {}');
      expect(IsNestModuleClass(plain.getClassOrThrow('A'))).toBe(false);
      expect(HasNestModuleClass(plain)).toBe(false);
      const noImport = create('@Module({}) class A {}');
      expect(HasNestModuleClass(noImport)).toBe(false);
    });

    it('GetNestModuleMetadata validates the module', () => {
      expect(() => GetNestModuleMetadata(create('class A {}'))).toThrow('does not have a NestJs Module class');
      expect(() => GetNestModuleMetadata(create('@Module(config) class A {}'))).toThrow('metadata object literal');
      expect(GetNestModuleMetadata(moduleFile()).getText()).toBe('{}');
    });
  });

  describe('imports', () => {
    it('adds imports with a module specifier once', () => {
      const file = moduleFile();
      CoerceNestModuleImport(file, { moduleName: 'FooModule', moduleSpecifier: './foo.module' });
      CoerceNestModuleImport(file, { moduleName: 'FooModule', moduleSpecifier: './foo.module' });
      expect(metadata(file)).toContain('imports: [FooModule]');
      expect(file.getFullText()).toContain("import { FooModule } from './foo.module';");
      expect(HasNestModuleImport(file, { moduleName: 'FooModule' })).toBe(true);
      expect(HasNestModuleImport(file, { moduleName: 'BarModule' })).toBe(false);
    });

    it('supports overwrite and custom writers', () => {
      const file = moduleFile();
      CoerceNestModuleImport(file, { moduleName: 'FooModule' });
      CoerceNestModuleImport(file, { moduleName: 'FooModule', importWriter: (w) => w.write('FooModule.forRoot()') });
      expect(metadata(file)).toContain('[FooModule]');
      CoerceNestModuleImport(file, { moduleName: 'FooModule', importWriter: (w) => w.write('FooModule.forRoot()'), overwrite: true });
      expect(metadata(file)).toContain('[FooModule.forRoot()]');
    });

    it('removes imports', () => {
      const file = moduleFile();
      CoerceNestModuleImport(file, { moduleName: 'FooModule' });
      CoerceNestModuleImport(file, { moduleName: 'BarModule' });
      RemoveNestModuleImport(file, { moduleName: 'FooModule' });
      RemoveNestModuleImport(file, { moduleName: 'Missing' });
      expect(metadata(file)).toContain('[BarModule]');
    });

    it('creates the well known module imports', () => {
      const file = moduleFile();
      CoerceNestConfigModuleImport(file, {});
      CoerceNestCacheModuleImport(file, {});
      CoerceNestThrottlerModuleImport(file, {});
      const m = metadata(file);
      expect(m).toContain('ConfigModule.forRoot(');
      expect(m).toContain('validationSchema: VALIDATION_SCHEMA');
      expect(m).toContain('CacheModule.registerAsync(');
      expect(m).toContain('useClass: CacheModuleOptionsLoader');
      expect(m).toContain('ThrottlerModule.forRootAsync(');
      const text = file.getFullText();
      expect(text).toContain("from '@nestjs/config'");
      expect(text).toContain("from '@nestjs/cache-manager'");
      expect(text).toContain("from '@nestjs/throttler'");
    });

    it('creates the environment module import', () => {
      const file = moduleFile();
      CoerceNestEnvironmentModule(file);
      expect(metadata(file)).toContain('EnvironmentModule.register(environment)');
      expect(file.getFullText()).toContain("from '../environments/environment'");
    });
  });

  describe('providers', () => {
    const arr = (text: string) =>
      create(`const a = ${text};`).getVariableDeclarationOrThrow('a').getInitializerOrThrow() as any;
    const texts = (a: any) => a.getElements().map((e: any) => e.getText().replace(/\s+/g, ' '));

    it('CoerceNestProviderToArray adds strings once', () => {
      const a = arr('[]');
      CoerceNestProviderToArray('A', a);
      CoerceNestProviderToArray('A', a);
      expect(texts(a)).toEqual(['A']);
    });

    it('CoerceNestProviderToArray adds objects and handles overwrite', () => {
      const a = arr('[]');
      CoerceNestProviderToArray({ provide: 'T', useFactory: 'f', inject: ['A', 'B'], scope: '1' }, a);
      expect(texts(a)[0]).toContain('inject: [ A,B ]');
      expect(texts(a)[0]).toContain('scope: 1');
      CoerceNestProviderToArray({ provide: 'T', useClass: 'C' }, a);
      expect(texts(a)).toHaveLength(1);
      expect(texts(a)[0]).toContain('useFactory');
      CoerceNestProviderToArray({ provide: 'T', useClass: 'C', inject: (w) => w.write('[X]') }, a, true);
      expect(texts(a)).toHaveLength(1);
      expect(texts(a)[0]).toContain('useClass: C');
      expect(texts(a)[0]).toContain('inject: [X]');
      CoerceNestProviderToArray({ provide: 'T', useValue: '1' }, a, ['provider']);
      expect(texts(a)[0]).toContain('useValue: 1');
      CoerceNestProviderToArray({ provide: 'T', useValue: '2' }, a, ['other']);
      expect(texts(a)[0]).toContain('useValue: 1');
    });

    it('RemoveNestProviderToArray', () => {
      const a = arr('[A, { provide: T, useValue: 1 }, B]');
      RemoveNestProviderToArray('A', a);
      RemoveNestProviderToArray('Missing', a);
      expect(texts(a)).toHaveLength(2);
      RemoveNestProviderToArray({ provide: 'T' }, a);
      expect(texts(a)).toHaveLength(2);
      RemoveNestProviderToArray({ provide: 'T' }, a, true);
      expect(texts(a)).toEqual(['B']);
      const b = arr('[{ provide: T }]');
      RemoveNestProviderToArray({ provide: 'T' }, b, ['provider']);
      expect(texts(b)).toEqual([]);
    });

    it('CoerceNestModuleProvider adds providers and imports', () => {
      const file = moduleFile();
      CoerceNestModuleProvider(file, { providerObject: 'FooService', moduleSpecifier: './foo.service' });
      CoerceNestModuleProvider(file, { providerObject: 'FooService', moduleSpecifier: './foo.service' });
      expect(metadata(file)).toContain('providers: [FooService]');
      expect(file.getFullText()).toContain("import { FooService } from './foo.service';");
    });

    it('RemoveNestModuleProvider accepts all option forms', () => {
      const file = moduleFile();
      CoerceNestModuleProvider(file, { providerObject: 'A' });
      CoerceNestModuleProvider(file, { providerObject: 'B' });
      CoerceNestModuleProvider(file, { providerObject: { provide: 'T', useValue: '1' } });
      RemoveNestModuleProvider(file, 'A');
      RemoveNestModuleProvider(file, { providerObject: 'B' });
      RemoveNestModuleProvider(file, { provide: 'T' });
      expect(metadata(file)).toContain('providers: []');
    });

    it('creates the environment and guard providers', () => {
      const file = moduleFile();
      CoerceNestEnvironmentProvider(file);
      CoerceAppGuardProvider(file);
      const m = metadata(file);
      expect(m).toContain('provide: ENVIRONMENT');
      expect(m).toContain('useValue: environment');
      expect(m).toContain('provide: APP_GUARD');
      expect(m).toContain('useClass: ThrottlerGuard');
    });
  });
});
