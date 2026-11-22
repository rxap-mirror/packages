import { SyntaxKind } from 'ts-morph';
import { CreateProject } from '../create-project';
import { CoerceAppRoutes } from './coerce-app-routes';
import { CoerceComponentImport } from './coerce-component-import';
import { CoerceModuleProvider } from './coerce-module-provider';
import { CoerceTokenExport } from './coerce-token-export';
import { GetComponentClass } from './get-component-class';
import { GetComponentDecoratorObject } from './get-component-decorator-object';
import { RemoveComponentImport } from './remove-component-import';

const component = (options = '{ selector: "a" }') =>
  CreateProject().createSourceFile('a.component.ts', `@Component(${options})\nexport class AComponent {}`);
const decoratorText = (file: any) => file.getClassOrThrow('AComponent').getDecorator('Component').getText().replace(/\s+/g, ' ');

describe('angular component helpers', () => {
  describe('GetComponentClass / GetComponentDecoratorObject', () => {
    it('finds the component class', () => {
      expect(GetComponentClass(component()).getName()).toBe('AComponent');
    });

    it('throws without a component class', () => {
      expect(() => GetComponentClass(CreateProject().createSourceFile('b.ts', 'class B {}'))).toThrow('Could not find class with Component decorator');
    });

    it('returns the options object of a source file or class', () => {
      const file = component();
      expect(GetComponentDecoratorObject(file).getText()).toContain('selector');
      expect(GetComponentDecoratorObject(file.getClassOrThrow('AComponent')).getText()).toContain('selector');
    });

    it('adds an empty options object if missing', () => {
      const file = CreateProject().createSourceFile('c.ts', '@Component()\nclass C {}');
      expect(GetComponentDecoratorObject(file).isKind(SyntaxKind.ObjectLiteralExpression)).toBe(true);
      expect(file.getFullText()).toContain('@Component({})');
    });

    it('rejects non object literal options', () => {
      const file = CreateProject().createSourceFile('d.ts', '@Component(options)\nclass D {}');
      expect(() => GetComponentDecoratorObject(file)).toThrow('not an object literal');
    });
  });

  describe('CoerceComponentImport', () => {
    it('adds string and type imports to the imports array', () => {
      const file = component();
      CoerceComponentImport(file, 'FooComponent');
      CoerceComponentImport(file, 'FooComponent');
      CoerceComponentImport(file.getClassOrThrow('AComponent'), { name: 'BarComponent', moduleSpecifier: './bar.component' });
      CoerceComponentImport(GetComponentDecoratorObject(file), { name: 'Alias', namedImport: 'RealName', moduleSpecifier: './x' });
      const text = decoratorText(file);
      expect(text).toContain('imports: [FooComponent, BarComponent, RealName]');
      expect(file.getFullText()).toContain("import { BarComponent } from './bar.component';");
      expect(file.getFullText()).toContain("import { RealName } from './x';");
    });
  });

  describe('RemoveComponentImport', () => {
    it('removes the import declaration and the array element', () => {
      const file = component('{ imports: [FooComponent, BarComponent] }');
      file.addImportDeclaration({ moduleSpecifier: './foo', namedImports: ['FooComponent'] });
      RemoveComponentImport(file, 'FooComponent');
      expect(decoratorText(file)).toContain('imports: [BarComponent]');
      expect(file.getImportDeclarations()).toHaveLength(0);
    });

    it('removes by type import module specifier', () => {
      const file = component('{ imports: [Foo] }');
      file.addImportDeclaration({ moduleSpecifier: './foo', defaultImport: 'Foo' });
      RemoveComponentImport(file.getClassOrThrow('AComponent'), { name: 'Foo', moduleSpecifier: './foo' });
      expect(file.getImportDeclarations()).toHaveLength(0);
      expect(decoratorText(file)).toContain('imports: []');
    });

    it('does not fail without an imports array', () => {
      const file = component();
      expect(() => RemoveComponentImport(file, 'Missing')).not.toThrow();
    });
  });

  describe('CoerceModuleProvider', () => {
    it('adds providers for source files, classes and object literals', () => {
      const file = component();
      CoerceModuleProvider(file, 'ServiceA');
      CoerceModuleProvider(file.getClassOrThrow('AComponent'), { provide: 'TOKEN', useValue: '1' });
      CoerceModuleProvider(GetComponentDecoratorObject(file), 'ServiceA');
      const text = decoratorText(file);
      expect(text).toContain('providers: [ServiceA, { provide: TOKEN, useValue: 1 }]');
    });
  });

  describe('CoerceTokenExport', () => {
    it('creates an exported injection token', () => {
      const file = CreateProject().createSourceFile('t.ts', '');
      CoerceTokenExport(file, { name: 'MY_TOKEN', description: 'my token', type: { name: 'Foo', moduleSpecifier: './foo' } });
      const text = file.getFullText();
      expect(text).toContain("export const MY_TOKEN = new InjectionToken<Foo>('my token');");
      expect(text).toContain("import { InjectionToken } from '@angular/core';");
      expect(text).toContain("import { Foo } from './foo';");
    });

    it('keeps an existing token unless overwrite is set', () => {
      const file = CreateProject().createSourceFile('t.ts', '');
      CoerceTokenExport(file, { name: 'T' });
      expect(file.getFullText()).toContain("new InjectionToken<any>('T')");
      CoerceTokenExport(file, { name: 'T', description: 'changed', type: { name: 'X' } });
      expect(file.getFullText()).toContain("new InjectionToken<any>('T')");
      CoerceTokenExport(file, { name: 'T', description: 'changed', type: { name: 'X' }, overwrite: true });
      expect(file.getFullText()).toContain("new InjectionToken<X>('changed')");
    });
  });

  describe('CoerceAppRoutes', () => {
    it('creates the default app routes with the status check route', () => {
      const file = CreateProject().createSourceFile('app.routes.ts', '');
      const declaration = CoerceAppRoutes(file);
      expect(declaration.getName()).toBe('appRoutes');
      const text = declaration.getText().replace(/\s+/g, ' ');
      expect(text).toContain('STATUS_CHECK_ROUTE');
      expect(text).toContain("path: '**'");
      expect(file.getFullText()).toContain("import { STATUS_CHECK_ROUTE } from '@rxap/ngx-status-check';");
    });

    it('supports a custom name and initializer', () => {
      const file = CreateProject().createSourceFile('app.routes.ts', '');
      const declaration = CoerceAppRoutes(file, { name: 'custom', initializer: '[]' });
      expect(declaration.getName()).toBe('custom');
      expect(declaration.getInitializer()!.getText()).toBe('[]');
    });
  });
});
