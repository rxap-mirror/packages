import { HostTree } from '@angular-devkit/schematics';
import { CreateProject } from '@rxap/ts-morph';
import { Project, Scope } from 'ts-morph';

jest.mock('../ts-morph-transform', () => ({
  TsMorphAngularProjectTransformRule: (options: any, cb: any, filePaths?: string[]) => () => {
    const project = (globalThis as any).__project;
    const files = filePaths?.map(f => {
      const p = f.replace(/\?$/, '');
      return project.getSourceFile(p) ?? project.createSourceFile(p, '');
    });
    return cb(project, files, options);
  },
}));

import { AddDependencyInjection, Module } from './add-dependency-injection';
import { CoerceComponentClassRule } from './coerce-component-class';
import { CoerceDataSourceClass } from './coerce-data-source-class';
import { CoerceFormBuilderProvider, CoerceFormBuilderProviderRule } from './coerce-form-builder-provider';
import { CoerceFormComponentProvider, CoerceFormComponentProviderRule } from './coerce-form-component-provider';
import { CoerceFormProvider, CoerceFormProviderRule } from './coerce-form-provider';
import { CoerceFormProvidersFile } from './coerce-form-providers-file';
import { CoerceMethodClass } from './coerce-method-class';
import { CoerceOptionsDataSourceRule } from './coerce-options-data-source';
import { CoercePipe } from './coerce-pipe';
import { CoerceProjectFeature } from './coerce-project-feature';
import { CoerceTableActionIndexRule } from './coerce-table-action-index';
import { CoerceTableActionIndexProviderRule } from './coerce-table-action-index-provider';
import { CoerceTableDataSourceRule } from './coerce-table-data-source';
import { CoerceTableParametersFromRouteRule } from './coerce-table-parameters-from-route';
import { CoerceTableSelectResolveValueMethodRule } from './coerce-table-select-resolve-value-method';
import { EnforceUseFormControlOrderRule } from './enforce-use-form-control-order';

describe('angular rules (in-memory project)', () => {
  let project: Project;
  const run = (rule: any) => rule(new HostTree(), {} as any);
  const opts = { project: 'p' } as any;

  beforeEach(() => {
    project = CreateProject();
    (globalThis as any).__project = project;
    jest.spyOn(console, 'log').mockImplementation();
  });

  describe('AddDependencyInjection', () => {
    it('adds injected constructor parameters', () => {
      const sf = project.createSourceFile('a.ts', 'class A {}');
      AddDependencyInjection(sf, { injectionToken: 'TOKEN', parameterName: 'token', type: 'string' }, [ { moduleSpecifier: './t', namedImports: [ 'TOKEN' ] } ]);
      AddDependencyInjection(sf, { injectionToken: 'OPT', parameterName: 'opt', optional: true, scope: Scope.Private, module: Module.NEST });
      AddDependencyInjection(sf, { injectionToken: 'TOKEN', parameterName: 'token' });
      const t = sf.getText();
      expect(t).toContain('@Inject(TOKEN) public readonly token: string');
      expect(t).toContain('@Optional() @Inject(OPT) private readonly opt: OPT & null');
      expect(t).toContain(`from '@nestjs/common'`);
      expect(t).toContain(`from './t'`);
      expect(sf.getClasses()[0].getConstructors()[0].getParameters()).toHaveLength(2);
      expect(() => AddDependencyInjection(project.createSourceFile('b.ts', ''), { injectionToken: 'T', parameterName: 't' })).toThrow('class declaration');
    });
  });

  it('CoerceComponentClassRule', () => {
    const transform = jest.fn();
    run(CoerceComponentClassRule({ ...opts, componentName: 'my-cmp', selector: 'app-x', tsMorphTransform: transform }));
    const sf = project.getSourceFileOrThrow('/my-cmp.component.ts');
    expect(sf.getText()).toContain('MyCmpComponent');
    expect(sf.getText()).toContain(`selector: 'app-x'`);
    expect(transform).toHaveBeenCalled();
  });

  it('CoerceDataSourceClass and table / options data sources', () => {
    const transform = jest.fn();
    run(CoerceDataSourceClass({ ...opts, name: 'user', tsMorphTransform: transform }));
    expect(project.getSourceFileOrThrow('user.data-source.ts').getText()).toContain('class UserDataSource extends BaseDataSource');
    expect(transform).toHaveBeenCalled();

    run(CoerceTableDataSourceRule({ ...opts, name: 'user', operationId: 'getPage' }));
    const table = project.getSourceFileOrThrow('user-table.data-source.ts').getText();
    expect(table).toContain('extends DynamicTableDataSource');
    expect(table).toContain('super(new GetPageAdapterRemoteMethod(inject(');
    expect(table).toContain(`from '@rxap/open-api/remote-method'`);

    run(CoerceOptionsDataSourceRule({
      ...opts, name: 'color', optionList: [
        { value: 'r', display: 'Red', disabled: true, color: 'red', default: false, i18n: 'c.r' },
        { value: 'g', display: 'Green' },
      ] as any,
    }));
    const options = project.getSourceFileOrThrow('color.data-source.ts').getText();
    expect(options).toContain('extends StaticDataSource<ControlOptions>');
    expect(options).toContain('RxapStaticDataSource');
    expect(options).toContain(`display: 'Red'`);
    expect(options).toContain('disabled: true');
    expect(options).toContain(`color: 'red'`);
    expect(options).toContain('default: false');
    expect(options).toContain(`i18n: 'c.r'`);

    run(CoerceOptionsDataSourceRule({ ...opts, name: 'empty', optionList: [] }));
    expect(project.getSourceFileOrThrow('empty.data-source.ts').getText()).toContain('as ControlOptions');
  });

  describe('form providers', () => {
    it('functions are idempotent and validate initializer', () => {
      const sf = project.createSourceFile('f.ts', '');
      for (const [ fn, name ] of [ [ CoerceFormProvider, 'FormProviders' ], [ CoerceFormComponentProvider, 'FormComponentProviders' ], [ CoerceFormBuilderProvider, 'FormBuilderProviders' ] ] as const) {
        fn(sf, 'A');
        fn(sf, { provide: 'T', useValue: '1' });
        expect(sf.getVariableDeclarationOrThrow(name).getInitializerOrThrow().getText()).toContain('A');
        const bad = project.createSourceFile('bad-' + name + '.ts', `export const ${ name } = 5;`);
        expect(() => fn(bad, 'A')).toThrow('array literal');
      }
    });
    it('rules write form.providers.ts', () => {
      const structure = [ { moduleSpecifier: './x', namedImports: [ 'X' ] } ];
      run(CoerceFormProviderRule({ ...opts, providerObject: 'X', importStructures: structure }));
      run(CoerceFormComponentProviderRule({ ...opts, providerObject: 'Y' }));
      run(CoerceFormBuilderProviderRule(opts, 'Z', structure));
      const t = project.getSourceFileOrThrow('form.providers.ts').getText();
      expect(t).toContain('FormProviders');
      expect(t).toContain('FormComponentProviders');
      expect(t).toContain('FormBuilderProviders');
      expect(t).toContain(`from './x'`);
    });
    it('CoerceFormProvidersFile', () => {
      run(CoerceFormProvidersFile({ ...opts, name: 'user' }));
      const t = project.getSourceFileOrThrow('/form.providers.ts').getText();
      expect(t).toContain('function FormFactory(injector: Injector, state: IUserForm | null): UserForm');
      expect(t).toContain('function FormBuilderFactory');
      expect(t).toContain('new RxapFormBuilder<IUserForm>(UserForm, injector).build(state ?? {})');
      expect(t).toContain(`from './user.form'`);
      expect(t).toContain('RXAP_FORM_DEFINITION');
      run(CoerceFormProvidersFile({ ...opts, name: 'user' }));
      expect(project.getSourceFileOrThrow('/form.providers.ts').getText().match(/rxap-no-index-export/g)).toHaveLength(1);
    });
  });

  it('CoerceMethodClass', () => {
    run(CoerceMethodClass({ ...opts, name: 'do-it', providedIn: `'root'`, tsMorphTransform: () => ({ statements: [ 'return 1;' ] }) }));
    const t = project.getSourceFileOrThrow('do-it.method.ts').getText();
    expect(t).toContain('class DoItMethod implements Method');
    expect(t).toContain(`providedIn: 'root'`);
    expect(t).toContain('call(parameters?: any): any');
    run(CoerceMethodClass({ ...opts, name: 'do-it', overwrite: true, tsMorphTransform: () => ({ statements: [ 'return 2;' ] }) }));
    expect(project.getSourceFileOrThrow('do-it.method.ts').getText()).toContain('return 2;');
    run(CoerceMethodClass({ ...opts, name: 'other', overwrite: [ 'method-declaration' ] }));
    expect(project.getSourceFileOrThrow('other.method.ts').getText()).toContain('@Injectable()');
  });

  it('CoercePipe', () => {
    const transform = jest.fn();
    run(CoercePipe({ ...opts, name: 'my-pipe', pure: true, valueType: 'string', tsMorphTransform: transform }));
    const t = project.getSourceFileOrThrow('my-pipe.pipe.ts').getText();
    expect(t).toContain('class MyPipePipe implements PipeTransform');
    expect(t).toContain(`name: 'myPipe'`);
    expect(t).toContain('pure: true');
    expect(t).toContain('transform(value: string)');
    expect(t).toContain('class MyPipePipeModule');
    expect(transform).toHaveBeenCalled();
    run(CoercePipe({ ...opts, name: 'other' }));
    expect(project.getSourceFileOrThrow('other.pipe.ts').getText()).toContain('pure: false');
  });

  it('CoerceProjectFeature', () => {
    const tree = new HostTree();
    tree.create('/apps/app/project.json', JSON.stringify({ name: 'app', root: 'apps/app', sourceRoot: 'apps/app/src', projectType: 'application' }));
    jest.spyOn(console, 'error').mockImplementation();
    const rule: any = CoerceProjectFeature({ project: 'app', feature: 'f' })(tree, {} as any);
    rule(tree, {} as any);
    const t = project.getSourceFileOrThrow('feature/f/routes.ts').getText();
    expect(t).toContain('ROUTES: Route[]');
    expect(t).toContain(`from '@angular/router'`);
    tree.create('/apps/app/src/feature/g/index.ts', '');
    expect(CoerceProjectFeature({ project: 'app', feature: 'g' })(tree, {} as any)).toBeUndefined();
  });

  it('table helper rules', () => {
    run(CoerceTableActionIndexRule(opts));
    expect(project.getSourceFileOrThrow('index.ts').getText()).toContain('TABLE_ROW_ACTION_METHODS');

    project.createSourceFile('user-table.component.ts', `@Component({}) export class UserTableComponent {}`);
    run(CoerceTableActionIndexProviderRule({ ...opts, tableName: 'user-table', directory: 'x/methods/action' }));
    const component = project.getSourceFileOrThrow('user-table.component.ts').getText();
    expect(component).toContain('TABLE_ROW_ACTION_METHODS');
    expect(component).toContain(`from './methods/action'`);
    run(CoerceTableActionIndexProviderRule({ ...opts, tableName: 'user-table' }));

    run(CoerceTableParametersFromRouteRule({ ...opts, tableName: 'user-table', parameterList: [ 'id', 'name' ] }));
    const t = project.getSourceFileOrThrow('user-table.component.ts').getText();
    expect(t).toContain('readonly parameters = input<Observable<Record<string, string>>>(this.route.params.pipe(map(params => ({id: params.id, name: params.name}))))');
    expect(t).toContain('ActivatedRoute');

    run(CoerceTableSelectResolveValueMethodRule({ ...opts, name: 'resolve', operationId: 'getUserById', scope: 'user' }));
    const m = project.getSourceFileOrThrow('resolve.method.ts').getText();
    expect(m).toContain('this.method.call({ parameters:');
    expect(m).toContain('GetUserByIdRemoteMethod');
  });

  it('EnforceUseFormControlOrderRule', () => {
    project.createSourceFile('/user.form.ts', `export class UserForm {
  @UseFormControl() @RxapValidators() a: string;
  @UseFormControl() b: string;
  @RxapValidators() @UseFormControl({ x: 1 }) c: string;
}`);
    run(EnforceUseFormControlOrderRule({ ...opts, formName: 'user' }));
    const cls = project.getSourceFileOrThrow('/user.form.ts').getClassOrThrow('UserForm');
    expect(cls.getPropertyOrThrow('a').getDecorators().map(d => d.getName())).toEqual([ 'RxapValidators', 'UseFormControl' ]);
    expect(cls.getPropertyOrThrow('c').getDecorators().map(d => d.getName())).toEqual([ 'RxapValidators', 'UseFormControl' ]);
    expect(cls.getPropertyOrThrow('b').getDecorators().map(d => d.getName())).toEqual([ 'UseFormControl' ]);
  });
});
