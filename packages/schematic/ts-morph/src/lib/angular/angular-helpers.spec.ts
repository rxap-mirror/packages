import { HostTree, Tree } from '@angular-devkit/schematics';
import { CreateProject } from '@rxap/ts-morph';
import { Project } from 'ts-morph';
import { AddComponentImport } from './add-component-import';
import { AddComponentInput } from './add-component-input';
import { AddComponentProvider } from './add-component-provider';
import { AddNgModuleExport } from './add-ng-module-export';
import { AddNgModuleImport } from './add-ng-module-import';
import { AddNgModuleProvider } from './add-ng-module-provider';
import { BuildAngularBasePath } from './build-angular-base-path';
import { CoerceAccordionComponent } from './coerce-accordion-component';
import { CoerceComponentSignalInput } from './coerce-component-signal-input';
import { FindComponentModuleSourceFile } from './find-component-module-source-file';
import { FindComponentSourceFile } from './find-component-source-file';
import { FindRoutingModule } from './find-routing-module';
import {
  CoerceFormDefinitionClass,
  GetFormDefinitionClassName,
  GetFormDefinitionFileImportPath,
  GetFormDefinitionFileName,
  GetFormDefinitionFilePath,
  GetFormDefinitionInterfaceName,
} from './form-definition-utilities';
import { GetComponentClass } from './get-component-class';
import { GetComponentOptionsObject } from './get-component-options-object';
import { GetNgModuleOptionsObject } from './get-ng-module-options-object';
import { HasAccordionComponent } from './has-accordion-component';
import { HasComponent } from './has-component';
import { HasDialogComponent } from './has-dialog-component';
import { HasProjectFeature } from './has-project-feature';
import { HasTableComponent } from './has-table-component';

function workspace(): Tree {
  const tree = new HostTree();
  tree.create('/apps/app/project.json', JSON.stringify({ name: 'app', root: 'apps/app', sourceRoot: 'apps/app/src', projectType: 'application' }));
  tree.create('/libs/lib/project.json', JSON.stringify({ name: 'lib', root: 'libs/lib', sourceRoot: 'libs/lib/src', projectType: 'library' }));
  return tree;
}

describe('angular helpers', () => {
  let project: Project;
  beforeEach(() => (project = CreateProject()));
  const component = (extra = '') => project.createSourceFile('c.ts', `@Component({ ${ extra } }) export class XComponent {}`);

  describe('CoerceComponentSignalInput', () => {
    const text = (sf: any) => sf.getText().replace(/\s+/g, ' ');
    it('creates input<T>() without initializer', () => {
      const sf = component();
      CoerceComponentSignalInput(sf, 'name', 'string');
      expect(text(sf)).toContain('readonly name = input<string>();');
      expect(text(sf)).toContain(`import { input } from '@angular/core';`);
    });
    it('supports initializer string and writer', () => {
      const sf = component();
      CoerceComponentSignalInput(sf.getClassOrThrow('XComponent'), 'a', 'number', { initializer: '1' });
      CoerceComponentSignalInput(sf, 'b', 'number', { initializer: w => w.write('2') });
      expect(text(sf)).toContain('readonly a = input<number>(1);');
      expect(text(sf)).toContain('readonly b = input<number>(2);');
    });
    it('supports required and alias combinations', () => {
      const sf = component();
      CoerceComponentSignalInput(sf, 'r', 'string', { isRequired: true, initializer: 'ignored' });
      CoerceComponentSignalInput(sf, 'ra', 'string', { isRequired: true, alias: 'x' });
      CoerceComponentSignalInput(sf, 'oa', 'string', { alias: 'y' });
      CoerceComponentSignalInput(sf, 'ia', 'string', { alias: 'z', initializer: `'d'` });
      const t = text(sf);
      expect(t).toContain('readonly r = input.required<string>();');
      expect(t).toContain(`readonly ra = input.required<string>({ alias: 'x' });`);
      expect(t).toContain(`readonly oa = input<string>(undefined, { alias: 'y' });`);
      expect(t).toContain(`readonly ia = input<string>('d', { alias: 'z' });`);
    });
    it('imports TypeImport types and is idempotent', () => {
      const sf = component();
      CoerceComponentSignalInput(sf, 'o', { name: 'Foo', moduleSpecifier: './foo' });
      CoerceComponentSignalInput(sf, 'o', { name: 'Foo', moduleSpecifier: './foo' });
      expect(sf.getText()).toContain(`import { Foo } from './foo';`);
      expect(sf.getClassOrThrow('XComponent').getProperties()).toHaveLength(1);
    });
    it('throws when no component class', () => {
      expect(() => CoerceComponentSignalInput(project.createSourceFile('n.ts', 'class A {}'), 'a', 'string')).toThrow('Component decorator');
    });
  });

  it('AddComponentInput', () => {
    const sf = component();
    AddComponentInput(sf, { name: 'a', type: 'string', required: true, selector: 'al', docs: [ 'doc' ] }, [ { moduleSpecifier: './x', namedImports: [ 'X' ] } ]);
    expect(sf.getText()).toContain(`input.required<string>({ alias: 'al' })`);
    expect(sf.getText()).toContain('doc');
    expect(sf.getText()).toContain(`from './x'`);
    AddComponentInput(sf, { name: 'a', type: 'number' });
    expect(sf.getClassOrThrow('XComponent').getProperties()).toHaveLength(1);
    const sf2 = project.createSourceFile('c2.ts', `@Component({}) export class YComponent { constructor(private readonly b: string) {} }`);
    AddComponentInput(sf2, { name: 'b', type: 'string' });
    expect(sf2.getClassOrThrow('YComponent').getProperties()).toHaveLength(0);
  });

  it('component options and provider/import helpers', () => {
    const sf = project.createSourceFile('c3.ts', `@Component() export class ZComponent {}`);
    AddComponentImport(sf, 'AComp', './a');
    AddComponentImport(sf, 'AComp');
    AddComponentProvider(sf, 'Svc', [ { moduleSpecifier: './svc', namedImports: [ 'Svc' ] } ]);
    AddComponentProvider(sf, { provide: 'T', useValue: '1' });
    const t = sf.getText().replace(/\s+/g, ' ');
    expect(t).toMatch(/imports: \[\s*AComp\s*\]/);
    expect(t).toContain('providers:');
    expect(t).toContain(`from './a'`);
    expect(GetComponentOptionsObject(sf)).toBeDefined();
    expect(() => GetComponentOptionsObject(project.createSourceFile('n.ts', 'class A {}'))).toThrow();
    expect(() => GetComponentOptionsObject(project.createSourceFile('n2.ts', '@Component(opts) class A {}'))).toThrow('object literal');
    expect(GetComponentClass(sf).getName()).toBe('ZComponent');
    expect(() => GetComponentClass(project.createSourceFile('n3.ts', 'class A {}'))).toThrow();
  });

  it('ng module helpers', () => {
    const sf = project.createSourceFile('m.ts', `@NgModule() export class M {}`);
    AddNgModuleImport(sf, 'A', './a');
    AddNgModuleImport(sf, 'A');
    AddNgModuleExport(sf, 'B', './b');
    AddNgModuleExport(sf, 'B');
    AddNgModuleProvider(sf, 'P', [ { moduleSpecifier: './p', namedImports: [ 'P' ] } ]);
    const t = sf.getText().replace(/\s+/g, ' ');
    expect(t).toMatch(/imports: \[\s*A\s*\]/);
    expect(t).toMatch(/exports: \[\s*B\s*\]/);
    expect(t).toMatch(/providers: \[\s*P\s*\]/);
    expect(() => GetNgModuleOptionsObject(project.createSourceFile('n.ts', 'class A {}'))).toThrow();
    expect(() => GetNgModuleOptionsObject(project.createSourceFile('n2.ts', '@NgModule(o) class A {}'))).toThrow('object literal');
  });

  it('find helpers', () => {
    project.createSourceFile('x.component.ts', 'export class XComponent {}');
    project.createSourceFile('x.module.ts', 'export class XComponentModule {}');
    expect(FindComponentSourceFile('x', project).getBaseName()).toBe('x.component.ts');
    expect(FindComponentModuleSourceFile('x', project).getBaseName()).toBe('x.module.ts');
    jest.spyOn(console, 'debug').mockImplementation();
    expect(() => FindComponentSourceFile('nope', project)).toThrow();
    const tree = new HostTree();
    tree.create('/base/a.ts', 'x');
    tree.create('/base/routing.ts', 'export const routes: Routes = [];');
    expect(FindRoutingModule(tree, '/base')).toBe('/base/routing.ts');
    expect(() => FindRoutingModule(tree, '/empty')).toThrow('routing module');
  });

  it('form definition utilities', () => {
    expect(GetFormDefinitionClassName({ name: 'my-user' })).toBe('MyUserForm');
    expect(GetFormDefinitionInterfaceName({ name: 'my-user' })).toBe('IMyUserForm');
    expect(GetFormDefinitionFileName({ name: 'MyUser' })).toBe('my-user.form.ts');
    expect(GetFormDefinitionFileImportPath({ name: 'my-user' })).toBe('./my-user.form');
    expect(GetFormDefinitionFilePath({ name: 'my-user' })).toBe('/my-user.form.ts?');
    const sf = project.createSourceFile('f.ts', '');
    expect(CoerceFormDefinitionClass(sf, { name: 'a' }).getName()).toBe('AForm');
  });

  describe('tree based helpers', () => {
    beforeEach(() => { jest.spyOn(console, 'error').mockImplementation(); });
    it('BuildAngularBasePath', () => {
      const tree = workspace();
      expect(BuildAngularBasePath(tree, { project: 'lib' })).toBe('libs/lib/src/lib');
      expect(BuildAngularBasePath(tree, { project: 'lib', directory: 'lib/x' })).toBe('libs/lib/src/lib/x');
      expect(BuildAngularBasePath(tree, { project: 'app' })).toBe('apps/app/src/app');
      expect(BuildAngularBasePath(tree, { project: 'app', feature: 'f', directory: 'd' })).toBe('apps/app/src/feature/f/d');
      expect(BuildAngularBasePath(tree, { project: 'app', directory: 'app/x' })).toBe('apps/app/src/app/x');
    });

    it('HasProjectFeature', () => {
      const tree = workspace();
      expect(() => HasProjectFeature(tree, { project: 'app' })).toThrow('feature option');
      expect(() => HasProjectFeature(tree, { project: 'nope', feature: 'f' })).toThrow();
      expect(HasProjectFeature(tree, { project: 'app', feature: 'f' })).toBe(false);
      tree.create('/apps/app/src/feature/f/index.ts', '');
      tree.create('/apps/app/src/feature/g/routes.ts', '');
      expect(HasProjectFeature(tree, { project: 'app', feature: 'f' })).toBe(true);
      expect(HasProjectFeature(tree, { project: 'app', feature: 'g' })).toBe(true);
    });

    it('HasComponent / HasDialogComponent / HasTableComponent', () => {
      const tree = workspace();
      expect(() => HasComponent(tree, { project: 'nope', name: 'x' })).toThrow('does not exists');
      expect(() => HasComponent(tree, { project: 'app', name: 'x', feature: 'f' })).toThrow('has not the feature');
      expect(HasComponent(tree, { project: 'lib', name: 'x' })).toBe(false);
      tree.create('/libs/lib/src/lib/x/x.component.ts', '');
      expect(HasComponent(tree, { project: 'lib', name: 'x' })).toBe(true);
      expect(HasDialogComponent(tree, { project: 'lib', name: 'x' })).toBe(true);
      expect(HasTableComponent(tree, { project: 'lib', name: 'x' })).toBe(false);
      tree.create('/libs/lib/src/lib/x-table/x-table.component.ts', '');
      expect(HasTableComponent(tree, { project: 'lib', name: 'x' })).toBe(false);
      tree.create('/libs/lib/src/lib/x/x-table.ts', '');
      expect(HasTableComponent(tree, { project: 'lib', name: 'x' })).toBe(false);
    });

    it('HasAccordionComponent / CoerceAccordionComponent', () => {
      const tree = workspace();
      expect(() => HasAccordionComponent(tree, { project: 'nope', accordionName: 'a' })).toThrow('project');
      expect(() => HasAccordionComponent(tree, { project: 'app', accordionName: 'a' })).toThrow();
      expect(() => HasAccordionComponent(tree, { project: 'app', accordionName: 'a', feature: 'f' })).toThrow('feature');
      tree.create('/apps/app/src/feature/f/index.ts', '');
      expect(HasAccordionComponent(tree, { project: 'app', accordionName: 'a', feature: 'f' })).toBe(false);
      tree.create('/apps/app/src/feature/f/a/a.component.ts', '');
      expect(HasAccordionComponent(tree, { project: 'app', accordionName: 'a', feature: 'f' })).toBe(true);
      const rule = CoerceAccordionComponent({ project: 'app', accordionName: 'a', feature: 'f' });
      expect(rule(tree, {} as any)).toBeDefined();
    });
  });
});
