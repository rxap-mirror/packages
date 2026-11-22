import { Scope } from 'ts-morph';
import { AddProviderToArray } from './add-provider-to-array';
import { CoerceClass } from './coerce-class';
import { CoerceDependencyInjection, Module } from './coerce-dependency-injection';
import { CreateProject } from './create-project';

const array = (text: string) =>
  CreateProject().createSourceFile('p.ts', `const a = ${text};`).getVariableDeclarationOrThrow('a').getInitializerOrThrow() as any;

describe('AddProviderToArray', () => {
  it('adds string providers once', () => {
    const arr = array('[]');
    AddProviderToArray('ServiceA', arr);
    AddProviderToArray('ServiceA', arr);
    expect(arr.getElements().map((e: any) => e.getText())).toEqual(['ServiceA']);
  });

  it('matches call providers by function name and overwrites on request', () => {
    const arr = array('[provideX(1)]');
    expect(AddProviderToArray('provideX(2)', arr).getText()).toBe('provideX(1)');
    expect(AddProviderToArray('provideX(2)', arr, true).getText()).toBe('provideX(2)');
    expect(arr.getElements()).toHaveLength(1);
    AddProviderToArray('provideY()', arr);
    expect(arr.getElements()).toHaveLength(2);
  });

  it('adds provider objects with all supported properties', () => {
    const arr = array('[]');
    const expr = AddProviderToArray(
      { provide: 'TOKEN', useFactory: 'factory', deps: ['A', 'B'], multi: true },
      arr,
    );
    const text = expr.getText().replace(/\s+/g, ' ');
    expect(text).toContain('provide: TOKEN');
    expect(text).toContain('useFactory: factory');
    expect(text).toContain('deps: [ A,B ]');
    expect(text).toContain('multi: true');
    const other = AddProviderToArray({ provide: 'T2', useClass: 'C', deps: (w) => w.write('[X]'), multi: false, useValue: '1', useExisting: 'E' }, arr);
    expect(other.getText()).toContain('multi: false');
    expect(other.getText()).toContain('deps: [X]');
  });

  it('keeps existing provider objects unless overwrite is requested', () => {
    const arr = array('[{ provide: TOKEN, useClass: Old }]');
    const kept = AddProviderToArray({ provide: 'TOKEN', useClass: 'New' }, arr);
    expect(kept.getText()).toContain('Old');
    expect(arr.getElements()).toHaveLength(1);
    const replaced = AddProviderToArray({ provide: 'TOKEN', useClass: 'New' }, arr, true);
    expect(replaced.getText()).toContain('New');
    expect(arr.getElements()).toHaveLength(1);
    const replaced2 = AddProviderToArray({ provide: 'TOKEN', useClass: 'Newer' }, arr, ['provider']);
    expect(replaced2.getText()).toContain('Newer');
    const kept2 = AddProviderToArray({ provide: 'TOKEN', useClass: 'X' }, arr, ['other']);
    expect(kept2.getText()).toContain('Newer');
  });

  it('uses a custom compare function and ignores non object elements', () => {
    const arr = array('[Foo, { provide: A }]');
    const compare = jest.fn(() => true);
    const result = AddProviderToArray({ provide: 'Z' }, arr, false, compare);
    expect(compare).toHaveBeenCalledTimes(1);
    expect(result.getText()).toBe('{ provide: A }');
  });
});

describe('CoerceDependencyInjection', () => {
  const setup = () => {
    const sourceFile = CreateProject().createSourceFile('a.ts', '');
    CoerceClass(sourceFile, 'MyService');
    return sourceFile;
  };

  it('requires a class', () => {
    expect(() => CoerceDependencyInjection(CreateProject().createSourceFile('b.ts', ''), {
      injectionToken: 'T', parameterName: 'p', module: Module.ANGULAR,
    })).toThrow('Could not find class declaration');
  });

  it('uses inject() for angular', () => {
    const file = setup();
    CoerceDependencyInjection(file, { injectionToken: 'HttpClient', parameterName: 'http', module: Module.ANGULAR }, [
      { moduleSpecifier: '@angular/common/http', namedImports: ['HttpClient'] },
    ]);
    const text = file.getFullText();
    expect(text).toContain('readonly http = inject(HttpClient);');
    expect(text).toContain("import { inject } from '@angular/core';");
    expect(text).toContain("import { HttpClient } from '@angular/common/http';");
  });

  it('supports optional angular injections and scopes', () => {
    const file = setup();
    CoerceDependencyInjection(file, { injectionToken: 'T', parameterName: 'p', module: Module.ANGULAR, optional: true, scope: Scope.Private });
    expect(file.getFullText()).toContain('private readonly p = inject(T, { optional: true });');
  });

  it('uses decorators for nest', () => {
    const file = setup();
    CoerceDependencyInjection(file, { injectionToken: 'ConfigService', parameterName: 'config', module: Module.NEST });
    const text = file.getFullText();
    expect(text).toContain('@Inject(ConfigService)');
    expect(text).toContain('readonly config!: ConfigService;');
    expect(text).toContain("import { Inject } from '@nestjs/common';");
  });

  it('supports optional nest injections with an explicit type', () => {
    const file = setup();
    CoerceDependencyInjection(file, { injectionToken: 'TOKEN', parameterName: 'dep', module: Module.NEST, optional: true, type: 'Dep' });
    const text = file.getFullText();
    expect(text).toContain('@Optional()');
    expect(text).toContain('readonly dep: Dep | null = null;');
    expect(text).toMatch(/import \{ [^}]*Optional[^}]* \} from '@nestjs\/common'/);
  });

  it('does nothing when the constructor parameter exists', () => {
    const file = setup();
    file.getClassOrThrow('MyService').addConstructor({ parameters: [{ name: 'p' }] });
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    CoerceDependencyInjection(file, { injectionToken: 'T', parameterName: 'p', module: Module.ANGULAR });
    expect(warn).toHaveBeenCalled();
    expect(file.getClassOrThrow('MyService').getProperties()).toHaveLength(0);
    warn.mockRestore();
  });
});
